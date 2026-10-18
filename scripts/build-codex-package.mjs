import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readJson, writeJson } from './environment/runtime.mjs'

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function normalizeAppId(value) {
  // The personal-plugin URL identifies the plugin; .app.json references its app.
  if (!/^plugin_asdk_app_[a-f0-9]{32}$/.test(value || '')) {
    throw new Error('Copy the exact plugin_asdk_app_… ID from the registered personal plugin URL. No app ID is assumed.')
  }
  return value.slice('plugin_'.length)
}

export function buildPackage({ root = repository, profile = 'submission', pluginId } = {}) {
  if (!['submission', 'connected'].includes(profile)) throw new Error('Profile must be submission or connected')
  if (profile === 'submission' && pluginId) throw new Error('The submission ZIP cannot contain app references')
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
    writeJson(manifestPath, manifest)
    writeJson(compatibilityPath, compatibility)
  }
  const marketplace = profile === 'connected' ? 'bottasker-tasky-connected' : 'bottasker-tasky'
  writeJson(path.join(directory, '.agents', 'plugins', 'marketplace.json'), {
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
  return { profile, directory, plugin: target, zip, ...(appId ? { appId } : {}) }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.length === 1 && args[0] === '--help') {
      console.log('node scripts/build-codex-package.mjs [submission|connected --plugin-id=plugin_asdk_app_…]\n' +
        'Builds a ZIP and a local marketplace. Does not install, register, authenticate, or publish.\n' +
        'Connected requires an existing personal plugin available to the current account.')
    } else {
      const profile = args[0] || 'submission'
      if (args.length > 2 || (args[1] && !args[1].startsWith('--plugin-id='))) throw new Error('Invalid arguments; use --help')
      execFileSync(process.execPath, [path.join(repository, 'scripts', 'validate-plugin.mjs')], { stdio: 'inherit' })
      console.log(JSON.stringify(buildPackage({ profile, pluginId: args[1]?.slice('--plugin-id='.length) }), null, 2))
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
