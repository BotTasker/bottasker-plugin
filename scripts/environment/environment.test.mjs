import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { main, parseArgs } from '../use-environment.mjs'
import { createClient } from './clients.mjs'
import { buildLocalPlugin, environments, readJson, verifyLocalServices, writeJson } from './runtime.mjs'

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const id = (env) => `${environments[env].name}@${environments[env].name}`

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tasky-environment-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  for (const name of ['plugins', '.agents', '.claude-plugin', 'scripts', 'submission', 'README.md', 'LICENSE']) {
    fs.cpSync(path.join(repository, name), path.join(root, name), { recursive: true })
  }
  const codexHome = path.join(root, 'homes', 'codex')
  fs.mkdirSync(codexHome, { recursive: true })
  const configFile = path.join(codexHome, 'config.toml')
  const otherConfig = '[plugins."unrelated@external"]\nenabled = true\n\n[other]\nvalue = "preserve me"\n'
  fs.writeFileSync(configFile, otherConfig)
  const states = Object.fromEntries(['codex', 'claude'].map((name) => [name, {
    installed: [], markets: [], missing: false, extraMcp: [],
  }]))
  const calls = []
  const mutations = []
  let failure
  const run = (bin, args) => {
    if (bin === process.execPath) {
      const result = spawnSync(bin, args, { encoding: 'utf8' })
      assert.equal(result.status, 0, result.stderr)
      return result.stdout
    }
    const state = states[bin]
    calls.push([bin, ...args])
    if (state.missing) throw Object.assign(new Error(`${bin} ausente`), { code: 'ENOENT' })
    if (failure) failure(bin, args, state)
    if (args[0] === '--version') return '1.0.0'
    if (args.includes('--help')) return '--json --scope --keep-data'
    if (args[0] === 'mcp') {
      return JSON.stringify([
        ...state.installed.filter((p) => p.enabled).flatMap((p) => {
          const plugin = readJson(path.join(p.installPath, '.mcp.json'))
          return Object.entries(plugin.mcpServers).map(([name, server]) => ({ name, enabled: true, transport: server }))
        }),
        ...state.extraMcp,
      ])
    }
    if (args[1] === 'list') {
      // The real CLI reads enabled flags back from config on every invocation.
      if (bin === 'codex') {
        const source = fs.readFileSync(configFile, 'utf8')
        for (const p of state.installed) {
          const section = source.split(`[plugins."${p.pluginId}"]\n`)[1]?.split('\n[')[0]
          if (section) p.enabled = !section.includes('enabled = false')
        }
      }
      return JSON.stringify(bin === 'codex' ? { installed: state.installed } : state.installed)
    }
    if (args[1] === 'marketplace' && args[2] === 'list') {
      return JSON.stringify(bin === 'codex' ? { marketplaces: state.markets } : state.markets)
    }
    mutations.push([bin, ...args])
    if (args[1] === 'marketplace') {
      if (args[2] === 'remove') {
        state.markets = state.markets.filter((m) => m.name !== args[3])
      } else if (args[2] === 'add') {
        const directory = args[3]
        const manifest = readJson(path.join(directory, bin === 'codex' ? '.agents/plugins/marketplace.json' : '.claude-plugin/marketplace.json'))
        assert.ok(!state.markets.some((m) => m.name === manifest.name), 'remove existing marketplace before adding')
        state.markets.push(bin === 'codex'
          ? { name: manifest.name, root: directory, marketplaceSource: { sourceType: 'local', source: directory } }
          : { name: manifest.name, source: 'directory', path: directory })
      } else assert.fail(`unexpected marketplace command ${args}`)
      return ''
    }
    const pluginId = args[2]
    if (['remove', 'uninstall'].includes(args[1])) {
      const removed = state.installed.find((p) => (p.pluginId || p.id) === pluginId)
      state.installed = state.installed.filter((p) => (p.pluginId || p.id) !== pluginId)
      if (removed) fs.rmSync(removed.installPath, { recursive: true, force: true })
    } else if (['enable', 'disable'].includes(args[1])) {
      state.installed.find((p) => p.id === pluginId).enabled = args[1] === 'enable'
    } else if (['add', 'install'].includes(args[1])) {
      const [name, marketplace] = pluginId.split('@')
      const market = state.markets.find((m) => m.name === marketplace)
      assert.ok(market, `marketplace exists: ${marketplace}`)
      const sourceRoot = market.root || market.path
      const manifest = readJson(path.join(sourceRoot, bin === 'codex' ? '.agents/plugins/marketplace.json' : '.claude-plugin/marketplace.json'))
      const entry = manifest.plugins.find((p) => p.name === name)
      const source = path.resolve(sourceRoot, typeof entry.source === 'string' ? entry.source : entry.source.path)
      const version = readJson(path.join(source, '.codex-plugin/plugin.json')).version
      const installPath = path.join(root, 'homes', bin, 'plugins/cache', marketplace, name, version)
      fs.cpSync(source, installPath, { recursive: true })
      const record = { [bin === 'codex' ? 'pluginId' : 'id']: pluginId, version, enabled: true, scope: 'user', installPath }
      if (bin === 'codex') {
        const source = fs.readFileSync(configFile, 'utf8')
        if (!source.includes(`[plugins."${pluginId}"]`)) fs.appendFileSync(configFile, `\n[plugins."${pluginId}"]\nenabled = true\n`)
      }
      state.installed.push(record)
    } else assert.fail(`unexpected command ${args}`)
    return ''
  }
  const clients = Object.fromEntries(['codex', 'claude'].map((name) => [name, createClient(name, root, run, { codexHome })]))
  let output = ''
  const deps = {
    root, run, clients, verifyLocal: async () => {}, input: { isTTY: true },
    output: { isTTY: true, write(value) { output += value } },
  }
  const invoke = async (args, extra = {}) => { output = ''; return main(args, { ...deps, ...extra }) }
  function seed(client, environment, { enabled = true, scope = 'user' } = {}) {
    const destination = environment === 'production' ? root : buildLocalPlugin(root)
    clients[client].addMarket(destination)
    clients[client].install(id(environment))
    states[client].installed.at(-1).scope = scope
    if (!enabled) clients[client].setEnabled(id(environment), false)
    mutations.length = 0
    calls.length = 0
  }
  return {
    root, states, clients, calls, mutations, invoke, seed, configFile, otherConfig,
    output: () => output,
    fail(fn) { failure = fn },
  }
}

for (const client of ['codex', 'claude', 'all']) {
  test(`Local → PROD → Local: ${client}`, async (t) => {
    const f = fixture(t)
    f.seed('codex', 'local')
    f.seed('claude', 'local')
    const targets = client === 'all' ? ['codex', 'claude'] : [client]
    const canonical = fs.readFileSync(path.join(f.root, 'plugins/bottasker-tasky/.mcp.json'), 'utf8')
    for (const environment of ['prod', 'local']) {
      assert.equal(await f.invoke([environment, '--install', `--client=${client}`]), 0, f.output())
      for (const target of targets) {
        const state = f.clients[target].inspect()
        assert.equal(state.items.length, 1)
        assert.equal(state.items[0].environment, environment === 'prod' ? 'production' : environment)
        assert.equal(state.items[0].enabled, true)
        assert.equal(state.items[0].error, undefined)
      }
      assert.match(f.output(), /instalación .* verificada/)
      assert.match(f.output(), /OAuth: no comprobado/)
    }
    if (client !== 'all') assert.ok(f.calls.every(([bin]) => bin === client), 'unselected client is never queried or modified')
    assert.equal(fs.readFileSync(path.join(f.root, 'plugins/bottasker-tasky/.mcp.json'), 'utf8'), canonical)
    assert.ok(fs.readFileSync(f.configFile, 'utf8').includes(f.otherConfig))
    assert.ok(!f.mutations.some((call) => /login|logout|mcp/.test(call.slice(1).join(' '))))
    assert.ok(f.mutations.filter(([bin]) => bin === 'claude').every((call) => call.includes('--scope') && call.includes('user')))
    assert.ok(f.mutations.filter((call) => call[2] === 'uninstall').every((call) => call.includes('--keep-data')))
  })
}

test('aliases, legacy defaults and invalid arguments', () => {
  assert.deepEqual(parseArgs(['prod', '--install']), { environment: 'production', client: 'all', install: true })
  assert.deepEqual(parseArgs(['production']), { environment: 'production', client: 'all', install: false })
  for (const args of [['local', '--client=unknown'], ['local', '--unknown'], ['prod', 'local'], ['status', '--install'], ['--install']]) {
    assert.throws(() => parseArgs(args))
  }
})

test('no TTY and --help show usage without inspection or writes', async (t) => {
  const f = fixture(t)
  assert.equal(await f.invoke([], { input: { isTTY: false } }), 0)
  assert.match(f.output(), /Uso:/)
  assert.equal(await f.invoke(['--help']), 0)
  assert.equal(f.calls.length, 0)
  assert.equal(fs.existsSync(path.join(f.root, '.tasky-runtime')), false)
})

test('preparation preserves installations and canonical files', async (t) => {
  const f = fixture(t)
  assert.equal(await f.invoke(['local', '--client=codex']), 0)
  assert.match(f.output(), /preparado/)
  assert.equal(f.mutations.length, 0)
  assert.equal(f.calls.length, 0)
  const builds = path.join(f.root, '.tasky-runtime/builds')
  const generated = path.join(builds, fs.readdirSync(builds)[0], 'plugins/bottasker-tasky-local')
  for (const file of ['.mcp.json', 'claude.mcp.json']) {
    assert.deepEqual(Object.keys(readJson(path.join(generated, file)).mcpServers), ['bottasker-tasky-local'])
    assert.equal(readJson(path.join(generated, file)).mcpServers['bottasker-tasky-local'].url, environments.local.url)
  }
  assert.equal(readJson(path.join(generated, '.codex-plugin/plugin.json')).apps, undefined)
  assert.equal(fs.existsSync(path.join(generated, '.app.json')), false)
  assert.deepEqual(fs.readdirSync(path.join(generated, 'skills')), fs.readdirSync(path.join(f.root, 'plugins/bottasker-tasky/skills')))
})

test('status respects client and reports disabled, missing and scope conflict', async (t) => {
  const f = fixture(t)
  f.seed('claude', 'local', { enabled: false, scope: 'project' })
  assert.equal(await f.invoke(['status', '--client=codex']), 0)
  assert.match(f.output(), /no está instalado/)
  assert.ok(f.calls.every(([bin]) => bin === 'codex'))
  assert.equal(await f.invoke(['status', '--client=claude']), 1)
  assert.match(f.output(), /deshabilitado.*ámbito project/)
  assert.match(f.output(), /CONFLICTO/)
  assert.equal(f.mutations.length, 0)
})

test('status detects duplicate variants and mismatched MCP', async (t) => {
  const f = fixture(t)
  f.seed('claude', 'local')
  f.seed('claude', 'production')
  assert.equal(await f.invoke(['status', '--client=claude']), 1)
  assert.match(f.output(), /varias variantes/)
  const file = path.join(f.states.claude.installed[0].installPath, 'claude.mcp.json')
  writeJson(file, { mcpServers: { 'bottasker-tasky-local': { type: 'http', url: environments.production.url } } })
  assert.equal(await f.invoke(['status', '--client=claude']), 1)
  assert.match(f.output(), /no corresponde/)
  assert.equal(f.mutations.length, 0)
})

test('missing requested client aborts both before writes', async (t) => {
  const f = fixture(t)
  f.states.claude.missing = true
  assert.equal(await f.invoke(['prod', '--install']), 1)
  assert.match(f.output(), /Claude Code no está disponible/)
  assert.equal(f.mutations.length, 0)
  assert.equal(fs.existsSync(path.join(f.root, '.tasky-runtime')), false)
})

test('local API or OAuth failure preserves the previous environment', async (t) => {
  const f = fixture(t)
  f.seed('codex', 'production')
  assert.equal(await f.invoke(['local', '--install', '--client=codex'], { verifyLocal: async () => { throw new Error('ECONNREFUSED local') } }), 1)
  assert.match(f.output(), /ECONNREFUSED/)
  assert.equal(f.mutations.length, 0)
  assert.equal(f.clients.codex.inspect().items[0].environment, 'production')
})

test('invalid canonical manifest aborts before writes', async (t) => {
  const f = fixture(t)
  writeJson(path.join(f.root, 'plugins/bottasker-tasky/.mcp.json'), { mcpServers: {} })
  assert.equal(await f.invoke(['prod', '--install']), 1)
  assert.equal(f.mutations.length, 0)
})

for (const client of ['codex', 'claude']) {
  for (const enabled of [true, false]) {
    test(`installation failure restores exact installed payload and enabled=${enabled}: ${client}`, async (t) => {
      const f = fixture(t)
      f.seed(client, 'local', { enabled })
      const before = f.clients[client].inspect().items[0]
      fs.writeFileSync(path.join(before.installPath, 'original-only.txt'), 'cached payload')
      f.fail((bin, args) => {
        if (bin === client && ['add', 'install'].includes(args[1]) && args[2] === id('production')) throw new Error('injected installation failure')
      })
      assert.equal(await f.invoke(['prod', '--install', `--client=${client}`]), 1)
      assert.match(f.output(), /anterior restaurada y verificada/, f.output())
      const after = f.clients[client].inspect().items[0]
      assert.equal(after.id, before.id)
      assert.equal(after.version, before.version)
      assert.equal(after.enabled, enabled)
      assert.equal(fs.readFileSync(path.join(after.installPath, 'original-only.txt'), 'utf8'), 'cached payload')
      assert.ok(fs.readFileSync(f.configFile, 'utf8').includes(f.otherConfig))
    })
  }
}

test('failed verification rolls back after install succeeds', async (t) => {
  const f = fixture(t)
  f.seed('claude', 'local')
  let corrupted = false
  f.fail((bin, args, state) => {
    if (!corrupted && bin === 'claude' && args[1] === 'list' && state.installed[0]?.id === id('production')) {
      corrupted = true
      state.installed[0].version = '9.9.9'
    }
  })
  assert.equal(await f.invoke(['prod', '--install', '--client=claude']), 1)
  assert.match(f.output(), /anterior restaurada y verificada/, f.output())
  assert.equal(f.clients.claude.inspect().items[0].environment, 'local')
})

test('rollback failure reports actual state and recovery commands', async (t) => {
  const f = fixture(t)
  f.seed('claude', 'local')
  f.fail((bin, args) => { if (bin === 'claude' && args[1] === 'install' && !args.includes('--help')) throw new Error('all installs fail') })
  assert.equal(await f.invoke(['prod', '--install', '--client=claude']), 1)
  assert.match(f.output(), /falló la restauración/)
  assert.match(f.output(), /Copia recuperable:/)
  assert.match(f.output(), /Recuperación: claude plugin uninstall bottasker-tasky@bottasker-tasky --scope user --yes --keep-data/)
  assert.match(f.output(), /Recuperación: claude plugin install bottasker-tasky-local@bottasker-tasky-local --scope user/)
  assert.match(f.output(), /Tasky no está instalado/)
  assert.ok(!f.output().includes('anterior restaurada y verificada'))
})

test('one failed client does not undo the successful client', async (t) => {
  const f = fixture(t)
  f.seed('codex', 'local')
  f.seed('claude', 'local')
  f.fail((bin, args) => { if (bin === 'claude' && args[1] === 'install' && args[2] === id('production')) throw new Error('Claude fails') })
  assert.equal(await f.invoke(['prod', '--install']), 1)
  assert.equal(f.clients.codex.inspect().items[0].environment, 'production')
  assert.equal(f.clients.claude.inspect().items[0].environment, 'local')
})

test('a failure in the first client still allows the second client to switch', async (t) => {
  const f = fixture(t)
  f.seed('codex', 'local')
  f.seed('claude', 'local')
  f.fail((bin, args) => { if (bin === 'codex' && args[1] === 'add' && args[2] === id('production')) throw new Error('Codex fails') })
  assert.equal(await f.invoke(['prod', '--install']), 1)
  assert.equal(f.clients.codex.inspect().items[0].environment, 'local')
  assert.equal(f.clients.claude.inspect().items[0].environment, 'production')
})

test('unsupported CLI capabilities abort before modifying either client', async (t) => {
  const f = fixture(t)
  f.fail((bin, args) => {
    if (bin === 'claude' && args.includes('--help')) throw new Error('unsupported CLI')
  })
  assert.equal(await f.invoke(['prod', '--install']), 1)
  assert.match(f.output(), /unsupported CLI/)
  assert.equal(f.mutations.length, 0)
})

test('reselecting a disabled Codex environment enables only Tasky', async (t) => {
  const f = fixture(t)
  f.seed('codex', 'production', { enabled: false })
  assert.equal(await f.invoke(['prod', '--install', '--client=codex']), 0, f.output())
  assert.equal(f.clients.codex.inspect().items[0].enabled, true)
  assert.ok(fs.readFileSync(f.configFile, 'utf8').includes(f.otherConfig))
})

test('foreign marketplace and non-user installation are never modified', async (t) => {
  const f = fixture(t)
  f.seed('claude', 'local', { scope: 'project' })
  assert.equal(await f.invoke(['prod', '--install', '--client=claude']), 1)
  assert.equal(f.mutations.length, 0)
  f.states.claude.installed[0].scope = 'user'
  f.states.claude.markets[0].source = 'github'
  assert.equal(await f.invoke(['prod', '--install', '--client=claude']), 1)
  assert.match(f.output(), /no pertenece a este repositorio/)
  assert.equal(f.mutations.length, 0)
})

test('unrelated plugins and marketplaces survive switching', async (t) => {
  const f = fixture(t)
  const unrelatedPlugin = { id: 'unrelated@external', version: '1.0.0', scope: 'user', enabled: true }
  const unrelatedMarket = { name: 'external', source: 'github' }
  f.states.claude.installed.push(unrelatedPlugin)
  f.states.claude.markets.push(unrelatedMarket)
  assert.equal(await f.invoke(['prod', '--install', '--client=claude']), 0, f.output())
  assert.deepEqual(f.states.claude.installed.find((p) => p.id === unrelatedPlugin.id), unrelatedPlugin)
  assert.deepEqual(f.states.claude.markets.find((m) => m.name === 'external'), unrelatedMarket)
})

test('active standalone Codex MCP is detected before modification', async (t) => {
  const f = fixture(t)
  f.states.codex.extraMcp.push({ name: 'bottasker-tasky-local', enabled: true, transport: { url: environments.local.url } })
  assert.equal(await f.invoke(['prod', '--install', '--client=codex']), 1)
  assert.match(f.output(), /activo fuera del plugin/)
  assert.equal(f.mutations.length, 0)
})

test('menu offers available clients only, default both, and no second confirmation', async (t) => {
  const f = fixture(t)
  const answers = ['3', '']
  assert.equal(await f.invoke([], { ask: async () => answers.shift() }), 0)
  assert.equal(answers.length, 0)
  assert.match(f.output(), /Ambos \(predeterminado\)/)
  assert.equal(f.clients.codex.inspect().items[0].environment, 'production')
  assert.equal(f.clients.claude.inspect().items[0].environment, 'production')
})

test('menu status, invalid input and cancellation never write', async (t) => {
  const f = fixture(t)
  f.states.claude.missing = true
  const answers = ['x', '1', '3', '', '0']
  assert.equal(await f.invoke([], { ask: async () => answers.shift() }), 0)
  assert.match(f.output(), /Opción no válida/)
  assert.match(f.output(), /Tasky no está instalado/)
  assert.match(f.output(), /Cancelado/)
  assert.ok(!f.output().includes('Claude Code'))
  assert.equal(f.mutations.length, 0)
})

test('menu EOF or cancellation at client selection does not change anything', async (t) => {
  const f = fixture(t)
  for (const answers of [[null], ['2', null], ['3', '0']]) {
    assert.equal(await f.invoke([], { ask: async () => answers.shift() }), 0)
    assert.equal(f.mutations.length, 0)
  }
})

test('lock prevents overlapping changes', async (t) => {
  const f = fixture(t)
  fs.mkdirSync(path.join(f.root, '.tasky-runtime'))
  fs.writeFileSync(path.join(f.root, '.tasky-runtime/environment.lock'), '123\n')
  assert.equal(await f.invoke(['prod', '--install']), 1)
  assert.match(f.output(), /bloqueo pendiente/)
  assert.equal(f.mutations.length, 0)
})

function discovery() {
  return {
    '/health': { status: 200 },
    '/.well-known/oauth-protected-resource/mcp': { status: 200, body: JSON.stringify({ resource: environments.local.url, authorization_servers: ['http://localhost:3200'] }) },
    '/.well-known/oauth-authorization-server': { status: 200, body: JSON.stringify({ issuer: 'http://localhost:3200', authorization_endpoint: 'http://localhost:3200/oauth/authorize', token_endpoint: 'http://localhost:3200/oauth/token' }) },
    '/mcp': { status: 401, headers: { 'www-authenticate': 'Bearer resource_metadata="http://localhost:3200/.well-known/oauth-protected-resource/mcp"' } },
    '/oauth/mcp/authorize': { status: 200 },
  }
}

test('local preflight checks health, discovery, MCP challenge and consent', async () => {
  const responses = discovery()
  const calls = []
  await verifyLocalServices(async (url, options) => { calls.push([url, options]); return responses[new URL(url).pathname] })
  assert.equal(calls.length, 5)
  assert.deepEqual(calls.filter(([, opts]) => opts?.insecure).map(([url]) => url), ['https://localhost:5185/oauth/mcp/authorize'])
})

for (const [name, change] of [
  ['health', (r) => { r['/health'].status = 503 }],
  ['wrong resource', (r) => { r['/.well-known/oauth-protected-resource/mcp'].body = JSON.stringify({ resource: environments.production.url }) }],
  ['wrong issuer', (r) => { r['/.well-known/oauth-authorization-server'].body = JSON.stringify({ issuer: 'https://api.bottasker.ai' }) }],
  ['bad JSON', (r) => { r['/.well-known/oauth-authorization-server'].body = '<html>' }],
  ['missing challenge', (r) => { r['/mcp'].headers = {} }],
  ['consent', (r) => { r['/oauth/mcp/authorize'].status = 404 }],
]) {
  test(`local preflight rejects ${name}`, async () => {
    const responses = discovery()
    change(responses)
    await assert.rejects(verifyLocalServices(async (url) => responses[new URL(url).pathname]))
  })
}
