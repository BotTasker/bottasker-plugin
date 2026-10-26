import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readJson, writeJson } from './environment/runtime.mjs'

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function normalizeAppId(value) {
  const invalid = () => new Error('Copy the registered asdk_app_… App ID, plugin_asdk_app_… plugin ID, or its https://chatgpt.com/plugins/… URL. No app ID is assumed.')
  if (typeof value !== 'string') throw invalid()
  let identifier = value.trim()
  // Accept the two identifiers shown by ChatGPT and the actual plugin page,
  // but never extract an ID from another host or an OAuth callback URL.
  if (identifier.startsWith('https://')) {
    let url
    try { url = new URL(identifier) } catch { throw invalid() }
    const match = url.pathname.match(/^\/plugins\/(plugin_asdk_app_[a-f0-9]{32})\/?$/)
    if (url.origin !== 'https://chatgpt.com' || url.username || url.password || url.hash || !match ||
        [...url.searchParams].some(([key, entry]) => key !== 'directoryTab' || entry !== 'personal')) {
      throw invalid()
    }
    identifier = match[1]
  }
  if (!/^(?:plugin_)?asdk_app_[a-f0-9]{32}$/.test(identifier)) throw invalid()
  return identifier.replace(/^plugin_/, '')
}

// Read only the two known JSON members. Never extract or copy executable content
// from the downloaded plugin; all skills and assets come from this repository.
function readExistingCloudPlugin(zip) {
  if (typeof zip !== 'string' || !zip.trim()) throw new Error('chatgpt-update requires --existing-plugin-zip=<downloaded-plugin.zip>')
  const archive = path.resolve(zip)
  const entries = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8', maxBuffer: 1024 * 1024 }).trim().split('\n')
  const readMember = (name) => {
    if (entries.filter((entry) => entry === name).length !== 1) throw new Error(`Existing plugin ZIP must contain exactly one ${name}`)
    return JSON.parse(execFileSync('unzip', ['-p', archive, name], { encoding: 'utf8', maxBuffer: 1024 * 1024 }))
  }
  const existing = readMember('.codex-plugin/plugin.json')
  const appManifest = readMember('.app.json')
  if (!existing || typeof existing.name !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,127}$/.test(existing.name) ||
      existing.apps !== './.app.json') throw new Error('Existing cloud plugin must declare its name and apps: "./.app.json"')
  const apps = appManifest?.apps
  if (!apps || typeof apps !== 'object' || Array.isArray(apps) || Object.keys(apps).length !== 1 ||
      Object.keys(appManifest).some((key) => key !== 'apps')) throw new Error('Existing cloud plugin must reference exactly one registered app')
  const [alias, app] = Object.entries(apps)[0]
  if (!/^[a-z0-9][a-z0-9_-]{0,127}$/.test(alias) || !app || typeof app !== 'object' || Array.isArray(app) ||
      Object.keys(app).some((key) => !['id', 'required'].includes(key)) ||
      (app.required !== undefined && typeof app.required !== 'boolean') ||
      typeof app.id !== 'string' || !/^asdk_app_[a-f0-9]{32}$/.test(app.id)) {
    throw new Error('Existing cloud app mapping must contain a registered App ID and no credentials')
  }
  return { name: existing.name, appManifest, appId: app.id }
}

export function buildPackage({ root = repository, profile = 'direct', pluginId, existingPluginZip } = {}) {
  if (!['direct', 'submission', 'connected', 'chatgpt-update'].includes(profile)) throw new Error('Profile must be direct, submission, connected or chatgpt-update')
  if (profile !== 'connected' && pluginId !== undefined) throw new Error('Only connected accepts --plugin-id; direct and submission cannot contain app references')
  if (profile !== 'chatgpt-update' && existingPluginZip !== undefined) throw new Error('Only chatgpt-update accepts --existing-plugin-zip')
  const cloud = profile === 'chatgpt-update' ? readExistingCloudPlugin(existingPluginZip) : undefined
  const appId = profile === 'connected' ? normalizeAppId(pluginId) : undefined
  const source = path.join(root, 'plugins', 'bottasker-tasky')
  const builds = path.join(root, '.tasky-runtime', 'packages')
  fs.mkdirSync(builds, { recursive: true })
  const directory = fs.mkdtempSync(path.join(builds, `${profile}-`))
  const target = path.join(directory, 'plugins', 'bottasker-tasky')
  fs.mkdirSync(target, { recursive: true })
  // Only package runtime components; never copy client configuration or tokens.
  for (const entry of ['plugin.json', 'mcp.json', '.codex-plugin', '.claude-plugin', '.mcp.json',
    'claude.mcp.json', 'skills', 'assets', 'README.md', 'CHANGELOG.md']) {
    fs.cpSync(path.join(source, entry), path.join(target, entry), {
      recursive: true,
      filter(file) {
        if (fs.lstatSync(file).isSymbolicLink()) throw new Error(`Package input must not be a symlink: ${file}`)
        return path.basename(file) !== '.DS_Store'
      },
    })
  }
  fs.copyFileSync(path.join(root, 'LICENSE'), path.join(target, 'LICENSE'))
  const manifestPath = path.join(target, 'plugin.json')
  const compatibilityPath = path.join(target, '.codex-plugin', 'plugin.json')
  const manifest = readJson(manifestPath)
  const compatibility = readJson(compatibilityPath)
  // The current desktop loader rejects per-server portable extensions. Keep
  // native installs on OAuth discovery; the submission portal imports this
  // explicit OAuth declaration instead.
  if (profile === 'submission') {
    const mcp = readJson(path.join(root, 'submission', 'mcp.json'))
    const runtime = readJson(path.join(source, 'mcp.json'))
    const server = mcp.mcpServers?.['bottasker-tasky']
    if (server?.url !== runtime.mcpServers?.['bottasker-tasky']?.url) {
      throw new Error('Submission MCP endpoint must match the runtime endpoint')
    }
    writeJson(path.join(target, 'mcp.json'), mcp)
  }
  if (appId) {
    manifest.extensions['com.openai'].apps = './.app.json'
    compatibility.apps = './.app.json'
    writeJson(path.join(target, '.app.json'), {
      apps: { 'bottasker-tasky': { id: appId, required: true } },
    })
  }
  if (cloud) {
    // Updating the existing cloud plugin must keep BOTH its technical name and
    // app mapping. A local marketplace install never updates this cloud record.
    manifest.name = compatibility.name = cloud.name
    manifest.extensions['com.openai'].apps = './.app.json'
    compatibility.apps = './.app.json'
  }
  if (appId || cloud) {
    // Registered-app installs must contain only the app and skills. Portable
    // hosts discover root mcp.json even when an apps mapping is also present.
    delete compatibility.mcpServers
    // Portal review cases belong to the explicit public submission profile.
    delete manifest.extensions['com.openai'].review
    delete compatibility.extensions['com.openai'].review
    for (const entry of ['mcp.json', '.mcp.json', 'claude.mcp.json', '.claude-plugin']) {
      fs.rmSync(path.join(target, entry), { recursive: true, force: true })
    }
    if (cloud) writeJson(path.join(target, '.app.json'), cloud.appManifest)
  }
  writeJson(manifestPath, manifest)
  writeJson(compatibilityPath, compatibility)
  const marketplace = profile === 'connected' ? 'bottasker-tasky-connected' : 'bottasker-tasky'
  if (!cloud) writeJson(path.join(directory, '.agents', 'plugins', 'marketplace.json'), {
    name: marketplace,
    interface: { displayName: profile === 'connected' ? 'Tasky — Connected app' : 'Tasky by BotTasker' },
    plugins: [{
      name: 'bottasker-tasky',
      source: { source: 'local', path: './plugins/bottasker-tasky' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: manifest.extensions['com.openai'].interface.category,
    }],
  })
  const zip = path.join(directory, `bottasker-tasky-${manifest.version}-${profile}.zip`)
  execFileSync('zip', ['-qr', zip, '.'], { cwd: target })
  return { profile, directory, plugin: target, zip, ...(appId ? { appId } : {}),
    ...(cloud ? { existingPluginName: cloud.name, appId: cloud.appId } : {}) }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.length === 1 && args[0] === '--help') {
      console.log('node scripts/build-codex-package.mjs [direct]\n' +
        'node scripts/build-codex-package.mjs connected --plugin-id=<registered-app-id-or-plugin-url>\n' +
        'node scripts/build-codex-package.mjs chatgpt-update --existing-plugin-zip=<downloaded-plugin.zip>\n' +
        'node scripts/build-codex-package.mjs submission\n' +
        'Builds a ZIP; direct/submission/connected also generate a local marketplace. Does not install, register, authenticate, or publish.\n' +
        'Default: direct (MCP + 15 skills with native OAuth, no registered app required).\n' +
        'Connected accepts an asdk_app_… App ID, plugin_asdk_app_… ID, or https://chatgpt.com/plugins/… URL.\n' +
        'ChatGPT update preserves the name and app mapping from Download plugin ZIP; upload its output with Upload new version.\n' +
        'The registered app must already be available to the current account; the build cannot verify access.')
    } else {
      const profile = args[0]?.startsWith('--') ? 'direct' : (args.shift() || 'direct')
      const option = profile === 'chatgpt-update' ? '--existing-plugin-zip=' : '--plugin-id='
      if (args.length > 1 || (args[0] && !args[0].startsWith(option))) throw new Error('Invalid arguments; use --help')
      execFileSync(process.execPath, [path.join(repository, 'scripts', 'validate-plugin.mjs')], { stdio: 'inherit' })
      const value = args[0]?.slice(option.length)
      console.log(JSON.stringify(buildPackage({ profile, ...(profile === 'chatgpt-update'
        ? { existingPluginZip: value } : { pluginId: value }) }), null, 2))
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
