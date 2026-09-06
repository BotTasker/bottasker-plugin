import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const canonicalPlugin = path.join(root, 'plugins', 'bottasker-tasky')
const runtimeRoot = path.join(root, '.tasky-runtime', 'local')
const localPluginName = 'bottasker-tasky-local'
const productionPluginName = 'bottasker-tasky'
const localMarketplaceName = 'bottasker-tasky-local'
const productionMarketplaceName = 'bottasker-tasky'
const localMcpUrl = 'http://localhost:3200/mcp'
const productionMcpUrl = 'https://api.bottasker.ai/mcp'

const environment = process.argv[2]
const install = process.argv.includes('--install')
const clientArg = process.argv.find((value) => value.startsWith('--client='))
const client = clientArg ? clientArg.split('=')[1] : 'all'

if (!['local', 'production', 'status'].includes(environment || '')) {
  process.stderr.write('Usage: node scripts/use-environment.mjs <local|production|status> [--install] [--client=codex|claude|all]\n')
  process.exit(1)
}
if (!['codex', 'claude', 'all'].includes(client)) {
  process.stderr.write('Invalid --client value. Use codex, claude, or all.\n')
  process.exit(1)
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

const command = (bin, args, { allowFailure = false, capture = false } = {}) => {
  const result = spawnSync(bin, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${bin} ${args.join(' ')} failed with exit code ${result.status}`)
  }
  return result
}

const jsonCommand = (bin, args) => {
  const result = command(bin, args, { capture: true })
  return JSON.parse(result.stdout)
}

const request = (url, { insecure = false } = {}) => new Promise((resolve, reject) => {
  const parsed = new URL(url)
  const transport = parsed.protocol === 'https:' ? https : http
  const req = transport.request(parsed, {
    method: 'GET',
    rejectUnauthorized: !insecure,
    timeout: 5000,
  }, (res) => {
    let body = ''
    res.setEncoding('utf8')
    res.on('data', (chunk) => { body += chunk })
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
  })
  req.on('timeout', () => req.destroy(new Error(`Timeout connecting to ${url}`)))
  req.on('error', reject)
  req.end()
})

const verifyCanonicalProduction = () => {
  const codex = readJson(path.join(canonicalPlugin, '.mcp.json'))
  const claude = readJson(path.join(canonicalPlugin, 'claude.mcp.json'))
  const codexServer = codex.mcpServers?.['bottasker-tasky']
  const claudeServer = claude.mcpServers?.['bottasker-tasky']
  if (codexServer?.url !== productionMcpUrl || claudeServer?.url !== productionMcpUrl) {
    throw new Error(`The canonical plugin must keep the production MCP URL: ${productionMcpUrl}`)
  }
}

const verifyLocalServices = async () => {
  const health = await request('http://localhost:3200/health')
  if (health.status !== 200) throw new Error(`Local API health returned ${health.status}`)

  const protectedResource = await request('http://localhost:3200/.well-known/oauth-protected-resource/mcp')
  if (protectedResource.status !== 200) throw new Error(`OAuth protected-resource metadata returned ${protectedResource.status}`)
  const metadata = JSON.parse(protectedResource.body)
  if (metadata.resource !== localMcpUrl) throw new Error(`OAuth resource is ${metadata.resource}; expected ${localMcpUrl}`)

  const authorizationServer = await request('http://localhost:3200/.well-known/oauth-authorization-server')
  if (authorizationServer.status !== 200) throw new Error(`OAuth authorization-server metadata returned ${authorizationServer.status}`)

  const mcp = await request(localMcpUrl)
  if (mcp.status !== 401 || !mcp.headers['www-authenticate']) {
    throw new Error('Local MCP must return 401 with WWW-Authenticate when no token is provided')
  }

  const consent = await request('https://localhost:5185/oauth/mcp/authorize', { insecure: true })
  if (consent.status !== 200) throw new Error(`Local OAuth consent page returned ${consent.status}`)

  process.stdout.write('Local BotTasker API, OAuth discovery, MCP challenge, and consent UI are ready.\n')
}

const timestamp = () => new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)

const buildLocalPlugin = () => {
  verifyCanonicalProduction()
  fs.rmSync(runtimeRoot, { recursive: true, force: true })
  const pluginTarget = path.join(runtimeRoot, 'plugins', localPluginName)
  fs.mkdirSync(path.dirname(pluginTarget), { recursive: true })
  fs.cpSync(canonicalPlugin, pluginTarget, {
    recursive: true,
    filter: (source) => path.basename(source) !== '.DS_Store',
  })

  const codexManifestPath = path.join(pluginTarget, '.codex-plugin', 'plugin.json')
  const claudeManifestPath = path.join(pluginTarget, '.claude-plugin', 'plugin.json')
  const codexManifest = readJson(codexManifestPath)
  const claudeManifest = readJson(claudeManifestPath)
  const localVersion = `${String(codexManifest.version).split('+')[0]}+local.${timestamp()}`

  codexManifest.name = localPluginName
  codexManifest.version = localVersion
  codexManifest.description = `${codexManifest.description} Local development environment.`
  codexManifest.interface = {
    ...codexManifest.interface,
    displayName: 'Tasky by BotTasker (Local)',
    shortDescription: 'Test Tasky against the BotTasker server running on this Mac.',
  }

  claudeManifest.name = localPluginName
  claudeManifest.displayName = 'Tasky by BotTasker (Local)'
  claudeManifest.version = localVersion
  claudeManifest.description = `${claudeManifest.description} Local development environment.`

  writeJson(codexManifestPath, codexManifest)
  writeJson(claudeManifestPath, claudeManifest)
  writeJson(path.join(pluginTarget, '.mcp.json'), {
    mcpServers: {
      'bottasker-tasky-local': { url: localMcpUrl },
    },
  })
  writeJson(path.join(pluginTarget, 'claude.mcp.json'), {
    mcpServers: {
      'bottasker-tasky-local': { type: 'http', url: localMcpUrl },
    },
  })

  writeJson(path.join(runtimeRoot, '.agents', 'plugins', 'marketplace.json'), {
    name: localMarketplaceName,
    interface: { displayName: 'BotTasker Tasky Local' },
    plugins: [{
      name: localPluginName,
      source: { source: 'local', path: `./plugins/${localPluginName}` },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: 'Developer Tools',
      description: 'Tasky connected to the BotTasker MCP running on localhost:3200.',
    }],
  })
  writeJson(path.join(runtimeRoot, '.claude-plugin', 'marketplace.json'), {
    name: localMarketplaceName,
    owner: { name: 'BotTasker' },
    description: 'Generated local-only Tasky marketplace. Never commit this directory.',
    plugins: [{
      name: localPluginName,
      source: `./plugins/${localPluginName}`,
      displayName: 'Tasky by BotTasker (Local)',
      description: 'Tasky connected to the BotTasker MCP running on localhost:3200.',
      category: 'Developer Tools',
      keywords: ['bottasker', 'tasky', 'mcp', 'local-development'],
    }],
  })

  process.stdout.write(`Generated local Tasky runtime at ${runtimeRoot}\n`)
}

const installCodex = (target) => {
  const state = jsonCommand('codex', ['plugin', 'list', '--json'])
  const knownTaskyIds = new Set([
    `${productionPluginName}@${productionMarketplaceName}`,
    `${localPluginName}@${localMarketplaceName}`,
    `${productionPluginName}@${localMarketplaceName}`,
    `${localPluginName}@${productionMarketplaceName}`,
  ])
  for (const pluginId of knownTaskyIds) {
    const installed = state.installed.some((item) => item.pluginId === pluginId)
    command('codex', ['plugin', 'remove', pluginId], {
      allowFailure: !installed,
      capture: !installed,
    })
  }

  for (const marketplaceName of [productionMarketplaceName, localMarketplaceName]) {
    command('codex', ['plugin', 'marketplace', 'remove', marketplaceName], {
      allowFailure: true,
      capture: true,
    })
  }

  const marketplaceRoot = target === 'local' ? runtimeRoot : root
  const selector = target === 'local'
    ? `${localPluginName}@${localMarketplaceName}`
    : `${productionPluginName}@${productionMarketplaceName}`
  command('codex', ['plugin', 'marketplace', 'add', marketplaceRoot])
  command('codex', ['plugin', 'add', selector])
}

const installClaude = (target) => {
  const state = jsonCommand('claude', ['plugin', 'list', '--json'])
  const ids = new Set([
    `${productionPluginName}@${productionMarketplaceName}`,
    `${localPluginName}@${localMarketplaceName}`,
  ])
  for (const plugin of state.filter((item) => ids.has(item.id))) {
    command('claude', ['plugin', 'uninstall', plugin.id, '--scope', plugin.scope || 'user', '--yes'])
  }

  for (const marketplaceName of [productionMarketplaceName, localMarketplaceName]) {
    command('claude', ['plugin', 'marketplace', 'remove', marketplaceName], {
      allowFailure: true,
      capture: true,
    })
  }

  const marketplaceRoot = target === 'local' ? runtimeRoot : root
  const selector = target === 'local'
    ? `${localPluginName}@${localMarketplaceName}`
    : `${productionPluginName}@${productionMarketplaceName}`
  command('claude', ['plugin', 'marketplace', 'add', marketplaceRoot, '--scope', 'user'])
  command('claude', ['plugin', 'install', selector, '--scope', 'user'])
}

const showStatus = () => {
  verifyCanonicalProduction()
  process.stdout.write(`Canonical/GitHub MCP: ${productionMcpUrl}\n`)
  process.stdout.write(`Generated local MCP: ${localMcpUrl}\n`)
  command('codex', ['plugin', 'list'])
  command('claude', ['plugin', 'list'])
}

if (environment === 'status') {
  showStatus()
  process.exit(0)
}

if (environment === 'local') {
  await verifyLocalServices()
  buildLocalPlugin()
} else {
  verifyCanonicalProduction()
}

if (install) {
  if (client === 'all' || client === 'codex') installCodex(environment)
  if (client === 'all' || client === 'claude') installClaude(environment)
}

const serverName = environment === 'local' ? 'bottasker-tasky-local' : 'bottasker-tasky'
process.stdout.write(`\nSelected environment: ${environment}\n`)
process.stdout.write(`MCP URL: ${environment === 'local' ? localMcpUrl : productionMcpUrl}\n`)
if (!install) process.stdout.write(`Run again with --install to install it in Codex and Claude Code.\n`)
process.stdout.write(`Open a new client session. In Codex run: codex mcp login ${serverName}\n`)
process.stdout.write('In Claude Code open /mcp and authenticate the matching Tasky server.\n')
