import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { buildPackage, normalizeAppId } from './build-codex-package.mjs'
import { readJson } from './environment/runtime.mjs'

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pluginId = 'plugin_asdk_app_0123456789abcdef0123456789abcdef'
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tasky-package-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  for (const file of ['plugins', 'scripts', 'submission', 'LICENSE', 'README.md']) {
    fs.cpSync(path.join(repository, file), path.join(root, file), { recursive: true })
  }
  return root
}

function cloudArchive(root, mutate = () => {}) {
  const directory = path.join(root, 'downloaded-cloud-plugin')
  fs.mkdirSync(path.join(directory, '.codex-plugin'), { recursive: true })
  const manifest = { name: 'dev-test-cloud-plugin', version: '1.0.0', apps: './.app.json' }
  const apps = { apps: { 'dev-test-cloud-plugin': { id: pluginId.replace(/^plugin_/, '') } } }
  mutate(manifest, apps)
  fs.writeFileSync(path.join(directory, '.codex-plugin/plugin.json'), JSON.stringify(manifest))
  fs.writeFileSync(path.join(directory, '.app.json'), JSON.stringify(apps))
  // The downloaded package is identity input, never a source of runtime code.
  fs.writeFileSync(path.join(directory, 'untrusted-script.sh'), 'echo must-not-be-copied')
  const zip = path.join(root, 'downloaded-plugin.zip')
  execFileSync('zip', ['-qr', zip, '.'], { cwd: directory })
  return { zip, manifest, apps }
}

test('default build requires a registered app and never falls back to a direct MCP package', (t) => {
  const root = fixture(t)
  assert.throws(() => buildPackage({ root }), /registered asdk_app/)
  assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
  const result = buildPackage({ root, pluginId })
  assert.equal(result.profile, 'connected')
  assert.equal(fs.existsSync(path.join(result.plugin, 'mcp.json')), false)
})

test('CLI without an explicit profile builds App plus skills and requires an app identity', (t) => {
  const root = fixture(t)
  const script = path.join(root, 'scripts/build-codex-package.mjs')
  const missing = spawnSync(process.execPath, [script], { encoding: 'utf8' })
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /registered asdk_app/)
  assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
  const built = spawnSync(process.execPath, [script, `--plugin-id=${pluginId}`], { encoding: 'utf8' })
  assert.equal(built.status, 0, built.stderr)
  assert.match(built.stdout, /"profile": "connected"/)
  assert.match(built.stdout, /"appId": "asdk_app_0123456789abcdef0123456789abcdef"/)
})

test('ChatGPT update adds skills to the same cloud plugin without duplicating MCP or importing portal review cases', (t) => {
  const root = fixture(t)
  const original = fs.readFileSync(path.join(root, 'plugins/bottasker-tasky/plugin.json'), 'utf8')
  const downloaded = cloudArchive(root)
  const result = buildPackage({ root, profile: 'chatgpt-update', existingPluginZip: downloaded.zip })
  const entries = execFileSync('unzip', ['-Z1', result.zip], { encoding: 'utf8' }).trim().split('\n')
  assert.equal(entries.filter((entry) => /^skills\/[^/]+\/SKILL.md$/.test(entry)).length, 15)
  assert.equal(result.existingPluginName, downloaded.manifest.name)
  assert.equal(result.appId, pluginId.replace(/^plugin_/, ''))
  assert.deepEqual(readJson(path.join(result.plugin, '.app.json')), downloaded.apps)
  const portable = readJson(path.join(result.plugin, 'plugin.json'))
  const compatibility = readJson(path.join(result.plugin, '.codex-plugin/plugin.json'))
  assert.equal(portable.name, downloaded.manifest.name)
  assert.equal(compatibility.name, downloaded.manifest.name)
  assert.equal(portable.version, JSON.parse(original).version)
  assert.equal(compatibility.version, portable.version)
  assert.equal(portable.extensions['com.openai'].apps, './.app.json')
  assert.equal(compatibility.apps, './.app.json')
  assert.equal(compatibility.skills, './skills/')
  assert.equal(compatibility.mcpServers, undefined)
  for (const manifest of [portable, compatibility]) {
    assert.equal(manifest.extensions['com.openai'].review, undefined)
    assert.equal(manifest.extensions['com.openai'].onboardingSkill, './skills/bottasker-connection-guide/SKILL.md')
    assert.deepEqual(Object.keys(manifest.extensions['com.openai'].publication.translations).sort(), ['en-US', 'es-PE', 'pt-BR'])
  }
  assert.ok(!entries.some((entry) => /(^|\/)(mcp\.json|\.mcp\.json|claude\.mcp\.json|\.claude-plugin|untrusted-script\.sh)(\/|$)/.test(entry)))
  assert.equal(fs.existsSync(path.join(result.directory, '.agents/plugins/marketplace.json')), false)
  assert.equal(fs.readFileSync(path.join(root, 'plugins/bottasker-tasky/plugin.json'), 'utf8'), original)
  // The updated cloud ZIP can supply identity again for subsequent releases.
  const rebuilt = buildPackage({ root, profile: 'chatgpt-update', existingPluginZip: result.zip })
  assert.deepEqual(readJson(path.join(rebuilt.plugin, '.app.json')), downloaded.apps)
})

for (const [label, mutate] of [
  ['missing name', (manifest) => { delete manifest.name }],
  ['invalid name', (manifest) => { manifest.name = '../other-plugin' }],
  ['undeclared app file', (manifest) => { delete manifest.apps }],
  ['wrong app path', (manifest) => { manifest.apps = '../.app.json' }],
  ['multiple apps', (_, apps) => { apps.apps.other = { id: pluginId.replace(/^plugin_/, '') } }],
  ['unregistered ID', (_, apps) => { apps.apps['dev-test-cloud-plugin'].id = 'Tasky' }],
  ['unexpected credentials', (_, apps) => { apps.apps['dev-test-cloud-plugin'].clientSecret = 'do-not-import' }],
  ['unexpected top-level data', (_, apps) => { apps.accessToken = 'do-not-import' }],
]) {
  test(`ChatGPT update rejects invalid downloaded identity before creating output: ${label}`, (t) => {
    const root = fixture(t)
    const downloaded = cloudArchive(root, mutate)
    assert.throws(() => buildPackage({ root, profile: 'chatgpt-update', existingPluginZip: downloaded.zip }))
    assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
  })
}

test('cloud identity input cannot be applied to the public submission or connected profile', (t) => {
  const root = fixture(t)
  const { zip } = cloudArchive(root)
  assert.throws(() => buildPackage({ root, profile: 'submission', existingPluginZip: zip }), /Only chatgpt-update/)
  assert.throws(() => buildPackage({ root, profile: 'connected', pluginId, existingPluginZip: zip }), /Only chatgpt-update/)
  assert.throws(() => buildPackage({ root, profile: 'chatgpt-update', pluginId }), /Only connected/)
  assert.throws(() => buildPackage({ root, profile: 'chatgpt-update' }), /existing-plugin-zip/)
  assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
})

test('submission ZIP contains skills, OAuth, legal metadata and onboarding, without app references or development files', (t) => {
  const root = fixture(t)
  // A loose development file must not accidentally become part of the upload.
  fs.writeFileSync(path.join(root, 'plugins/bottasker-tasky', '.env'), 'DEVELOPMENT_ONLY=true')
  const result = buildPackage({ root, profile: 'submission' })
  const entries = execFileSync('unzip', ['-Z1', result.zip], { encoding: 'utf8' }).trim().split('\n')
  assert.ok(entries.includes('plugin.json'))
  assert.ok(entries.includes('mcp.json'))
  assert.ok(entries.includes('LICENSE'))
  assert.equal(entries.filter((entry) => /^skills\/[^/]+\/SKILL.md$/.test(entry)).length, 15)
  assert.ok(!entries.some((entry) => /\.app\.json|\.env|hooks\/|\.tasky-runtime/.test(entry)))
  const manifest = readJson(path.join(result.plugin, 'plugin.json'))
  assert.equal(manifest.extensions['com.openai'].review.demo_recording_url, 'https://youtu.be/GE1NGw_v7jc')
  assert.deepEqual(manifest.extensions['com.openai'].review,
    readJson(path.join(result.plugin, '.codex-plugin/plugin.json')).extensions['com.openai'].review)
  const publication = manifest.extensions['com.openai'].publication
  assert.deepEqual(Object.keys(publication.translations).sort(), ['en-US', 'es-PE', 'pt-BR'])
  assert.deepEqual(publication, readJson(path.join(result.plugin, '.codex-plugin/plugin.json')).extensions['com.openai'].publication)
  assert.equal(publication.translations['en-US'].description, manifest.extensions['com.openai'].interface.longDescription)
  assert.equal(manifest.extensions['com.openai'].apps, undefined)
  assert.ok(fs.existsSync(path.join(result.plugin, manifest.extensions['com.openai'].onboardingSkill)))
  assert.deepEqual(readJson(path.join(result.plugin, 'mcp.json')).mcpServers['bottasker-tasky']
    .extensions['com.openai'].auth.defaultScopes, ['mcp:read', 'mcp:write'])
  assert.equal(readJson(path.join(result.directory, '.agents/plugins/marketplace.json')).plugins[0].policy.authentication, 'ON_INSTALL')
})

test('connected package uses only the supplied registered app and leaves canonical source untouched', (t) => {
  const root = fixture(t)
  const original = fs.readFileSync(path.join(root, 'plugins/bottasker-tasky/plugin.json'), 'utf8')
  const result = buildPackage({ root, profile: 'connected', pluginId })
  assert.deepEqual(readJson(path.join(result.plugin, '.app.json')), {
    apps: { 'bottasker-tasky': { id: 'asdk_app_0123456789abcdef0123456789abcdef', required: true } },
  })
  assert.equal(readJson(path.join(result.plugin, 'plugin.json')).extensions['com.openai'].apps, './.app.json')
  assert.equal(readJson(path.join(result.plugin, '.codex-plugin/plugin.json')).apps, './.app.json')
  assert.deepEqual(readJson(path.join(result.plugin, 'plugin.json')).extensions['com.openai'].publication,
    readJson(path.join(root, 'plugins/bottasker-tasky/plugin.json')).extensions['com.openai'].publication)
  assert.equal(fs.readFileSync(path.join(root, 'plugins/bottasker-tasky/plugin.json'), 'utf8'), original)
  assert.equal(fs.existsSync(path.join(root, 'plugins/bottasker-tasky/.app.json')), false)
  const entries = execFileSync('unzip', ['-Z1', result.zip], { encoding: 'utf8' }).trim().split('\n')
  assert.equal(entries.filter((entry) => /^skills\/[^/]+\/SKILL.md$/.test(entry)).length, 15)
  assert.equal(readJson(path.join(result.plugin, '.codex-plugin/plugin.json')).mcpServers, undefined)
  assert.equal(readJson(path.join(result.plugin, 'plugin.json')).extensions['com.openai'].review, undefined)
  assert.ok(!entries.some((entry) => /(^|\/)(mcp\.json|\.mcp\.json|claude\.mcp\.json|\.claude-plugin)(\/|$)/.test(entry)))
})

for (const identity of [
  'asdk_app_0123456789abcdef0123456789abcdef',
  pluginId,
  `https://chatgpt.com/plugins/${pluginId}`,
  `https://chatgpt.com/plugins/${pluginId}?directoryTab=personal`,
]) {
  test(`connected build accepts a copied ChatGPT identity: ${identity}`, (t) => {
    const root = fixture(t)
    const result = buildPackage({ root, profile: 'connected', pluginId: identity })
    assert.equal(result.appId, 'asdk_app_0123456789abcdef0123456789abcdef')
    assert.equal(readJson(path.join(result.plugin, '.app.json')).apps['bottasker-tasky'].id, result.appId)
    assert.equal(fs.readdirSync(path.join(result.plugin, 'skills')).length, 15)
    assert.equal(fs.existsSync(path.join(result.plugin, 'mcp.json')), false)
    assert.throws(() => buildPackage({ root, profile: 'submission', pluginId: identity }))
  })
}

for (const video of [undefined, '', 'http://example.com/demo', 'https://user:password@example.com/demo']) {
  test(`validator rejects missing or unsafe demo recording URL: ${video ?? 'missing'}`, (t) => {
    const root = fixture(t)
    const file = path.join(root, 'plugins/bottasker-tasky/plugin.json')
    const manifest = readJson(file)
    manifest.extensions['com.openai'].review.demo_recording_url = video
    fs.writeFileSync(file, JSON.stringify(manifest))
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /demo recording URL/)
  })
}

test('repository runtime stays desktop-compatible while submission preserves explicit OAuth settings', (t) => {
  const root = fixture(t)
  const runtime = readJson(path.join(root, 'plugins/bottasker-tasky/mcp.json'))
  assert.deepEqual(runtime.mcpServers['bottasker-tasky'], {
    type: 'streamable-http', url: 'https://api.bottasker.ai/mcp',
  })
  const result = buildPackage({ root, profile: 'submission' })
  const server = readJson(path.join(result.plugin, 'mcp.json')).mcpServers['bottasker-tasky']
  assert.equal(server.url, runtime.mcpServers['bottasker-tasky'].url)
  assert.deepEqual(server.extensions['com.openai'].auth, {
    type: 'oauth', client: {
      mode: 'provided', clientId: 'T8HLDAid7PWyT6sv3ZpuYfkL6t7FXLo1', tokenEndpointAuthMethod: 'none',
    },
    authorizationUrl: 'https://api.bottasker.ai/oauth/authorize',
    tokenUrl: 'https://api.bottasker.ai/oauth/token', resource: server.url,
    baseScopes: ['mcp:read', 'mcp:write'], defaultScopes: ['mcp:read', 'mcp:write'],
  })
  assert.deepEqual(readJson(path.join(root, 'plugins/bottasker-tasky/mcp.json')), runtime)
})

for (const [label, mutate] of [
  ['missing client ID', (auth) => { delete auth.client.clientId }],
  ['client secret in package', (auth) => { auth.client.clientSecret = 'must-not-be-packaged' }],
  ['top-level client secret in package', (auth) => { auth.clientSecret = 'must-not-be-packaged' }],
  ['confidential client method', (auth) => { auth.client.tokenEndpointAuthMethod = 'client_secret_basic' }],
  ['destructive initial scope', (auth) => { auth.defaultScopes.push('mcp:destructive') }],
]) {
  test(`validator rejects unsafe or incomplete submission OAuth: ${label}`, (t) => {
    const root = fixture(t)
    const file = path.join(root, 'submission/mcp.json')
    const mcp = readJson(file)
    mutate(mcp.mcpServers['bottasker-tasky'].extensions['com.openai'].auth)
    fs.writeFileSync(file, JSON.stringify(mcp))
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /submission OAuth/)
  })
}

test('validator rejects runtime extensions rejected by the native desktop MCP loader', (t) => {
  const root = fixture(t)
  const file = path.join(root, 'plugins/bottasker-tasky/mcp.json')
  const mcp = readJson(file)
  mcp.mcpServers['bottasker-tasky'].extensions = { 'com.openai': { auth: { type: 'oauth' } } }
  fs.writeFileSync(file, JSON.stringify(mcp))
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')], { encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /desktop compatibility/)
})

test('submission packaging rejects an OAuth template pointing at another environment', (t) => {
  const root = fixture(t)
  const file = path.join(root, 'submission/mcp.json')
  const mcp = readJson(file)
  mcp.mcpServers['bottasker-tasky'].url = 'http://localhost:3200/mcp'
  fs.writeFileSync(file, JSON.stringify(mcp))
  assert.throws(() => buildPackage({ root, profile: 'submission' }), /Submission MCP endpoint/)
})

for (const [label, mutate] of [
  ['missing Portuguese', (translations) => { delete translations['pt-BR'] }],
  ['oversized subtitle', (translations) => { translations['es-PE'].subtitle = 'a'.repeat(31) }],
  ['multiline subtitle', (translations) => { translations['pt-BR'].subtitle = 'Tasky\nBotTasker' }],
  ['unsupported control character', (translations) => { translations['es-PE'].description = 'Texto\tcon tabulación' }],
]) {
  test(`validator rejects publication translations: ${label}`, (t) => {
    const root = fixture(t)
    const file = path.join(root, 'plugins/bottasker-tasky/plugin.json')
    const manifest = readJson(file)
    mutate(manifest.extensions['com.openai'].publication.translations)
    fs.writeFileSync(file, JSON.stringify(manifest))
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /translation/)
  })
}

test('invalid profile and missing or invented app identifiers fail before creating outputs', (t) => {
  const root = fixture(t)
  for (const value of [undefined, '', 'Tasky', `${pluginId}?x=1`]) {
    assert.throws(() => normalizeAppId(value))
    assert.throws(() => buildPackage({ root, profile: 'connected', pluginId: value }))
  }
  assert.throws(() => buildPackage({ root, profile: 'submission', pluginId }))
  assert.throws(() => buildPackage({ root, profile: 'public' }))
  assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
})

for (const value of [
  `http://chatgpt.com/plugins/${pluginId}`,
  `https://example.com/plugins/${pluginId}`,
  `https://chatgpt.com.example.com/plugins/${pluginId}`,
  `https://user:password@chatgpt.com/plugins/${pluginId}`,
  `https://chatgpt.com:8443/plugins/${pluginId}`,
  `https://chatgpt.com/connector/oauth/${pluginId}`,
  `https://chatgpt.com/plugins/${pluginId}/other`,
  `https://chatgpt.com/plugins/${pluginId}?code=do-not-accept`,
  `https://chatgpt.com/plugins/${pluginId}#fragment`,
]) {
  test(`reject untrusted or incorrect app page before creating output: ${value}`, (t) => {
    const root = fixture(t)
    assert.throws(() => buildPackage({ root, profile: 'connected', pluginId: value }))
    assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
  })
}

test('validator rejects a submission OAuth resource pointing at the wrong environment', (t) => {
  const root = fixture(t)
  const file = path.join(root, 'submission/mcp.json')
  const mcp = readJson(file)
  mcp.mcpServers['bottasker-tasky'].extensions['com.openai'].auth.resource = 'http://localhost:3200/mcp'
  fs.writeFileSync(file, JSON.stringify(mcp))
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')], { encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /submission OAuth/)
})
