import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { environments, names, readJson, writeJson } from './runtime.mjs'

export const label = (client) => client === 'codex' ? 'Codex' : 'Claude Code'
const isTasky = (id) => names.includes(id?.split('@')[0])
const real = (value) => fs.realpathSync(value)
const within = (parent, child) => {
  const relative = path.relative(real(parent), real(child))
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

export function createRunner(root) {
  return (bin, args) => {
    const result = spawnSync(bin, args, {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60_000, maxBuffer: 8 * 1024 * 1024,
    })
    if (result.error) throw result.error
    if (result.status !== 0) {
      // Do not echo raw client output: it may contain credentials or unrelated configuration.
      throw new Error(`${bin} ${args.join(' ')} falló (código ${result.status ?? result.signal})`)
    }
    return result.stdout
  }
}

export function createClient(client, root, run, {
  codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex'),
} = {}) {
  const exec = (args) => run(client, args)
  const json = (args) => JSON.parse(exec(args))
  const scope = client === 'claude' ? ['--scope', 'user'] : []
  const configFile = path.join(codexHome, 'config.toml')

  function inspect() {
    const raw = json(['plugin', 'list', '--json'])
    const plugins = client === 'codex' ? raw.installed : raw
    if (!Array.isArray(plugins)) throw new Error('Respuesta de plugin list no reconocida')
    const rawMarkets = json(['plugin', 'marketplace', 'list', '--json'])
    const markets = client === 'codex' ? rawMarkets.marketplaces : rawMarkets
    if (!Array.isArray(markets)) throw new Error('Respuesta de marketplace list no reconocida')
    const effective = client === 'codex' ? json(['mcp', 'list', '--json']) : null
    if (effective && !Array.isArray(effective)) throw new Error('Respuesta de mcp list no reconocida')
    const items = plugins.filter((p) => isTasky(p.pluginId || p.id)).map((p) => {
      const id = p.pluginId || p.id
      const [name, marketplace] = id.split('@')
      const item = {
        id, name, marketplace, version: p.version, enabled: p.enabled,
        scope: p.scope || 'user',
      }
      try {
        if (![name, marketplace, p.version].every((v) => typeof v === 'string' && /^[a-zA-Z0-9._+-]+$/.test(v))) {
          throw new Error('Identificador o versión de plugin no válido')
        }
        item.installPath = p.installPath || path.join(codexHome, 'plugins', 'cache', marketplace, name, p.version)
        const manifest = readJson(path.join(item.installPath, client === 'codex' ? '.codex-plugin/plugin.json' : '.claude-plugin/plugin.json'))
        if (manifest.name !== name || manifest.version !== p.version) throw new Error('El manifiesto instalado no coincide con el inventario')
        if (typeof manifest.mcpServers !== 'string') throw new Error('El manifiesto MCP instalado no tiene una ruta verificable')
        const mcpFile = path.resolve(item.installPath, manifest.mcpServers)
        if (!within(item.installPath, mcpFile)) throw new Error('Configuración MCP fuera del plugin')
        const servers = readJson(mcpFile).mcpServers
        item.urls = Object.values(servers || {}).map((s) => s.url || '(sin URL HTTP)')
        const env = Object.entries(environments).find(([, e]) => e.name === name)
        item.environment = env[0]
        if (Object.keys(servers || {}).length !== 1 || servers[name]?.url !== env[1].url) {
          throw new Error('La URL o el identificador MCP instalado no corresponde a su entorno')
        }
        if (item.enabled !== true && item.enabled !== false) throw new Error('Estado de habilitación desconocido')
        if (item.enabled && effective) {
          const server = effective.find((s) => s.name === name)
          if (!server?.enabled || server.transport?.url !== env[1].url) {
            throw new Error('El MCP efectivo de Codex no coincide con el plugin instalado')
          }
        }
      } catch (error) { item.error = error.message }
      return item
    })
    return { items, markets, effective }
  }

  function assertManaged(state) {
    for (const item of state.items) {
      if (item.scope !== 'user') throw new Error(`Conflicto: ${item.id} está instalado en ámbito ${item.scope}. Resuélvelo desde Claude Code en ese ámbito`)
      if (item.error) throw new Error(`${item.id}: ${item.error}`)
      if (!names.includes(item.marketplace) || !state.markets.some((m) => m.name === item.marketplace)) {
        throw new Error(`${item.id} pertenece a un marketplace no administrado por este repositorio`)
      }
    }
    for (const market of state.markets.filter((m) => names.includes(m.name))) {
      const directory = client === 'codex'
        ? (market.marketplaceSource?.sourceType === 'local' && market.marketplaceSource.source)
        : (market.source === 'directory' && market.path)
      const runtime = path.join(root, '.tasky-runtime')
      if (!directory || !(real(directory) === real(root) || (fs.existsSync(runtime) && within(runtime, directory)))) {
        throw new Error(`El marketplace ${market.name} no pertenece a este repositorio; no se modificó`)
      }
      const file = client === 'codex' ? '.agents/plugins/marketplace.json' : '.claude-plugin/marketplace.json'
      const manifest = readJson(path.join(directory, file))
      if (manifest.name !== market.name || !manifest.plugins?.length || manifest.plugins.some((p) => !names.includes(p.name))) {
        throw new Error(`El marketplace ${market.name} contiene una declaración ajena a Tasky`)
      }
    }
    // An independently configured Tasky MCP must not remain active beside the selected plugin.
    for (const server of state.effective || []) {
      if (names.includes(server.name) && server.enabled && !state.items.some((p) => p.name === server.name && p.enabled)) {
        throw new Error(`MCP ${server.name} activo fuera del plugin; resuelve esa configuración antes del cambio`)
      }
    }
  }

  function setEnabled(id, enabled) {
    if (client === 'claude') {
      exec(['plugin', enabled ? 'enable' : 'disable', id, ...scope])
      return
    }
    // Codex currently exposes add/remove but no enable/disable CLI command. Change only
    // this known plugin's explicit boolean, never rewrite or restore the whole config.
    if (!isTasky(id) || !names.includes(id.split('@')[1])) throw new Error('Plugin no administrado')
    const source = fs.readFileSync(configFile, 'utf8')
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const table = new RegExp(`(^\\[plugins\\."${escaped}"\\][^\\n]*\\n)([\\s\\S]*?)(?=^\\[|$(?![\\s\\S]))`, 'm')
    const match = source.match(table)
    if (!match || !/^enabled\s*=\s*(true|false)\s*(?:#.*)?$/m.test(match[2])) {
      throw new Error(`No se pudo ${enabled ? 'habilitar' : 'deshabilitar'} ${id}; ajusta su habilitación en Codex`)
    }
    const next = source.replace(table, (_, header, body) => header + body.replace(/^enabled\s*=\s*(true|false)/m, `enabled = ${enabled}`))
    const temporary = `${configFile}.tasky-${process.pid}.tmp`
    try {
      fs.writeFileSync(temporary, next, { flag: 'wx', mode: fs.statSync(configFile).mode & 0o777 })
      if (fs.readFileSync(configFile, 'utf8') !== source) throw new Error('La configuración de Codex cambió durante la operación; reintenta')
      fs.renameSync(temporary, configFile)
    } finally { fs.rmSync(temporary, { force: true }) }
  }

  return {
    name: client,
    available() { try { exec(['--version']); return true } catch (error) { if (error.code === 'ENOENT') return false; throw error } },
    checkCommands() {
      const checks = client === 'codex'
        ? [[['plugin', 'add'], '--json'], [['plugin', 'remove'], '--json'], [['plugin', 'marketplace', 'list'], '--json']]
        : [[['plugin', 'install'], '--scope'], [['plugin', 'uninstall'], '--keep-data'], [['plugin', 'marketplace', 'remove'], '--scope']]
      for (const [command, option] of checks) {
        if (!exec([...command, '--help']).includes(option)) throw new Error(`${client} ${command.join(' ')} no admite ${option}; actualiza el cliente antes del cambio`)
      }
    },
    inspect, assertManaged, setEnabled,
    addMarket(directory) { exec(['plugin', 'marketplace', 'add', directory, ...scope]) },
    removeMarket(name) { exec(['plugin', 'marketplace', 'remove', name, ...scope]) },
    install(id) { exec(['plugin', client === 'codex' ? 'add' : 'install', id, ...scope]) },
    remove(id) { exec(['plugin', client === 'codex' ? 'remove' : 'uninstall', id, ...scope, ...(client === 'claude' ? ['--yes', '--keep-data'] : [])]) },
  }
}

export function describeState(client, state) {
  const lines = [`${label(client)}:`]
  if (!state.items.length) lines.push('  Tasky no está instalado.')
  if (state.items.filter((p) => p.enabled).length > 1) lines.push('  CONFLICTO: varias variantes de Tasky están habilitadas.')
  for (const item of state.items) {
    lines.push(`  ${environments[item.environment]?.label || 'Desconocido'} | ${item.urls?.join(', ') || 'URL desconocida'} | v${item.version} | ${item.enabled === true ? 'habilitado' : item.enabled === false ? 'deshabilitado' : 'habilitación desconocida'} | ámbito ${item.scope}`)
    if (item.scope !== 'user') lines.push('  CONFLICTO: instalación fuera del ámbito user; no se modificará.')
    if (item.error) lines.push(`  ERROR: ${item.error}`)
  }
  lines.push('  OAuth: no comprobado; la instalación no confirma la autenticación.')
  return lines.join('\n')
}

// Preserve the installed payload, not the potentially edited source repository.
export function snapshotClient(root, client, state) {
  const recoveryRoot = path.join(root, '.tasky-runtime', 'recovery')
  fs.mkdirSync(recoveryRoot, { recursive: true })
  const directory = fs.mkdtempSync(path.join(recoveryRoot, `${client}-`))
  const marketplaces = []
  for (const market of state.markets.filter((m) => names.includes(m.name))) {
    const backup = path.join(directory, market.name)
    const source = client === 'codex' ? market.marketplaceSource.source : market.path
    fs.mkdirSync(backup, { recursive: true })
    for (const relative of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json']) {
      const manifest = readJson(path.join(source, relative))
      for (const plugin of manifest.plugins) {
        const installed = state.items.find((p) => p.marketplace === market.name && p.name === plugin.name)
        const target = path.join(backup, 'plugins', plugin.name)
        const original = installed?.installPath || path.resolve(source, typeof plugin.source === 'string' ? plugin.source : plugin.source.path)
        fs.cpSync(original, target, { recursive: true })
        plugin.source = relative.startsWith('.agents') ? { source: 'local', path: `./plugins/${plugin.name}` } : `./plugins/${plugin.name}`
      }
      writeJson(path.join(backup, relative), manifest)
    }
    marketplaces.push({ name: market.name, directory: backup })
  }
  const snapshot = { directory, marketplaces, items: state.items }
  writeJson(path.join(directory, 'state.json'), snapshot)
  return snapshot
}

function signature(state) {
  return state.items.map((p) => [p.id, p.version, p.enabled, p.scope, p.urls, p.error]).sort((a, b) => a[0].localeCompare(b[0]))
}

export function switchClient(root, adapter, environment, targetRoot, write) {
  let snapshot
  let changed = false
  try {
    const before = adapter.inspect()
    adapter.assertManaged(before)
    snapshot = snapshotClient(root, adapter.name, before)
    const target = environments[environment]
    const id = `${target.name}@${target.name}`
    write(`${label(adapter.name)}: aplicando ${target.label}…`)
    changed = true
    // Remove only this repository's Tasky entries, never unrelated plugins/marketplaces.
    for (const item of before.items) adapter.remove(item.id)
    for (const market of before.markets.filter((m) => names.includes(m.name))) adapter.removeMarket(market.name)
    adapter.addMarket(targetRoot)
    adapter.install(id)
    let after = adapter.inspect()
    if (after.items.find((p) => p.id === id)?.enabled === false) {
      adapter.setEnabled(id, true)
      after = adapter.inspect()
    }
    if (after.items.length !== 1 || after.items[0].id !== id || !after.items[0].enabled || after.items[0].error) {
      throw new Error('La verificación de la instalación destino no coincide con el entorno solicitado')
    }
    adapter.assertManaged(after)
    const expectedVersion = readJson(path.join(targetRoot, 'plugins', target.name, '.codex-plugin/plugin.json')).version
    if (after.items[0].version !== expectedVersion) throw new Error('El cliente instaló una versión distinta del destino preparado')
    write(`${label(adapter.name)}: instalación ${target.label} verificada.`)
    write(describeState(adapter.name, after))
    write(adapter.name === 'codex'
      ? `Si requiere autenticación: codex mcp login ${target.name}. Abre una nueva sesión para cargar el entorno.`
      : `Abre /mcp y autentica ${target.name} si es necesario. Ejecuta /reload-plugins o abre una nueva sesión.`)
    return { ok: true, snapshot: snapshot.directory }
  } catch (error) {
    write(`${label(adapter.name)}: ERROR: ${error.message}`)
    if (changed) {
      try {
        const current = adapter.inspect()
        adapter.assertManaged({ ...current, items: current.items.map((p) => ({ ...p, error: undefined })) })
        for (const item of current.items) adapter.remove(item.id)
        for (const market of current.markets.filter((m) => names.includes(m.name))) adapter.removeMarket(market.name)
        for (const market of snapshot.marketplaces) adapter.addMarket(market.directory)
        for (const item of snapshot.items) {
          adapter.install(item.id)
          if (!item.enabled) adapter.setEnabled(item.id, false)
        }
        const restored = adapter.inspect()
        if (JSON.stringify(signature(restored)) !== JSON.stringify(signature(snapshot))) throw new Error('La restauración no coincide con la instalación anterior')
        write(`${label(adapter.name)}: instalación anterior restaurada y verificada.`)
      } catch (restoreError) {
        write(`${label(adapter.name)}: falló la restauración: ${restoreError.message}`)
        write(`Copia recuperable: ${snapshot.directory}`)
        write(`Consulta primero: node scripts/use-environment.mjs status --client=${adapter.name}`)
        write('Retira estas entradas solo si siguen instaladas y pertenecen a este repositorio:')
        const targetName = environments[environment].name
        for (const id of new Set([...snapshot.items.map((p) => p.id), `${targetName}@${targetName}`])) {
          write(`Recuperación: ${adapter.name} plugin ${adapter.name === 'codex' ? 'remove' : 'uninstall'} ${id}${adapter.name === 'claude' ? ' --scope user --yes --keep-data' : ''}`)
        }
        write('Retira estos marketplaces solo si siguen registrados y pertenecen a este repositorio:')
        for (const name of new Set([...snapshot.marketplaces.map((m) => m.name), targetName])) {
          write(`Recuperación: ${adapter.name} plugin marketplace remove ${name}${adapter.name === 'claude' ? ' --scope user' : ''}`)
        }
        write('Reinstala las copias de recuperación:')
        for (const market of snapshot.marketplaces) {
          const quoted = `'${market.directory.replaceAll("'", "'\\''")}'`
          write(`Recuperación: ${adapter.name} plugin marketplace add ${quoted}${adapter.name === 'claude' ? ' --scope user' : ''}`)
        }
        for (const item of snapshot.items) {
          write(`Recuperación: ${adapter.name} plugin ${adapter.name === 'codex' ? 'add' : 'install'} ${item.id}${adapter.name === 'claude' ? ' --scope user' : ''}`)
          if (!item.enabled) write(`Después, deshabilita ${item.id} en ${label(adapter.name)}.`)
        }
      }
    }
    try { write(describeState(adapter.name, adapter.inspect())) } catch (inspectionError) { write(`Estado desconocido: ${inspectionError.message}`) }
    return { ok: false, snapshot: snapshot?.directory }
  }
}
