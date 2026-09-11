import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'

export const environments = {
  local: { name: 'bottasker-tasky-local', label: 'Local', url: 'http://localhost:3200/mcp' },
  production: { name: 'bottasker-tasky', label: 'PROD', url: 'https://api.bottasker.ai/mcp' },
}
export const names = Object.values(environments).map(({ name }) => name)
const localPluginName = environments.local.name
const productionPluginName = environments.production.name
const localMarketplaceName = localPluginName
const localMcpUrl = environments.local.url
const productionMcpUrl = environments.production.url
export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
export const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
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
    res.on('error', reject)
    res.on('data', (chunk) => { body += chunk })
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
  })
  req.on('timeout', () => req.destroy(new Error(`Timeout connecting to ${url}`)))
  req.on('error', reject)
  req.end()
})

export const verifyCanonicalProduction = (root) => {
  const canonicalPlugin = path.join(root, "plugins", productionPluginName)
  const codex = readJson(path.join(canonicalPlugin, '.mcp.json'))
  const claude = readJson(path.join(canonicalPlugin, 'claude.mcp.json'))
  const codexServer = codex.mcpServers?.['bottasker-tasky']
  const claudeServer = claude.mcpServers?.['bottasker-tasky']
  if (codexServer?.url !== productionMcpUrl || claudeServer?.url !== productionMcpUrl) {
    throw new Error(`The canonical plugin must keep the production MCP URL: ${productionMcpUrl}`)
  }
}

export const verifyLocalServices = async (fetch = request) => {
  const health = await fetch('http://localhost:3200/health')
  if (health.status !== 200) throw new Error(`Local API health returned ${health.status}`)

  const protectedResource = await fetch('http://localhost:3200/.well-known/oauth-protected-resource/mcp')
  if (protectedResource.status !== 200) throw new Error(`OAuth protected-resource metadata returned ${protectedResource.status}`)
  const metadata = JSON.parse(protectedResource.body)
  if (metadata.resource !== localMcpUrl) throw new Error(`OAuth resource is ${metadata.resource}; expected ${localMcpUrl}`)
  if (!Array.isArray(metadata.authorization_servers) || metadata.authorization_servers.length !== 1 ||
      new URL(metadata.authorization_servers[0]).origin !== 'http://localhost:3200') {
    throw new Error('El recurso OAuth local debe anunciar un único servidor de autorización local')
  }

  const authorizationServer = await fetch('http://localhost:3200/.well-known/oauth-authorization-server')
  if (authorizationServer.status !== 200) throw new Error(`OAuth authorization-server metadata returned ${authorizationServer.status}`)
  const oauth = JSON.parse(authorizationServer.body)
  if (oauth.issuer !== metadata.authorization_servers[0] ||
      new URL(oauth.token_endpoint).origin !== 'http://localhost:3200' ||
      new URL(oauth.authorization_endpoint).origin !== 'http://localhost:3200') {
    throw new Error('El issuer o los endpoints OAuth no corresponden al entorno local')
  }

  const mcp = await fetch(localMcpUrl)
  if (mcp.status !== 401 || !mcp.headers['www-authenticate']) {
    throw new Error('Local MCP must return 401 with WWW-Authenticate when no token is provided')
  }

  const consent = await fetch('https://localhost:5185/oauth/mcp/authorize', { insecure: true })
  if (consent.status !== 200) throw new Error(`Local OAuth consent page returned ${consent.status}`)


}

const timestamp = () => new Date().toISOString().replace(/[-:TZ.]/g, '')

export const buildLocalPlugin = (root) => {
  verifyCanonicalProduction(root)
  const canonicalPlugin = path.join(root, "plugins", productionPluginName)
  const builds = path.join(root, ".tasky-runtime", "builds")
  fs.mkdirSync(builds, { recursive: true })
  const runtimeRoot = fs.mkdtempSync(path.join(builds, "local-"))
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

  return runtimeRoot
}
