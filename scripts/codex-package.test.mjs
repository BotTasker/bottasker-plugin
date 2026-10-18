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

test('submission ZIP contains skills, OAuth, legal metadata and onboarding, without app references or development files', (t) => {
  const root = fixture(t)
  // A loose development file must not accidentally become part of the upload.
  fs.writeFileSync(path.join(root, 'plugins/bottasker-tasky', '.env'), 'DEVELOPMENT_ONLY=true')
  const result = buildPackage({ root })
  const entries = execFileSync('unzip', ['-Z1', result.zip], { encoding: 'utf8' }).trim().split('\n')
  assert.ok(entries.includes('plugin.json'))
  assert.ok(entries.includes('mcp.json'))
  assert.ok(entries.includes('LICENSE'))
  assert.equal(entries.filter((entry) => /^skills\/[^/]+\/SKILL.md$/.test(entry)).length, 15)
  assert.ok(!entries.some((entry) => /\.app\.json|\.env|hooks\/|\.tasky-runtime/.test(entry)))
  const manifest = readJson(path.join(result.plugin, 'plugin.json'))
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
  assert.equal(fs.readFileSync(path.join(root, 'plugins/bottasker-tasky/plugin.json'), 'utf8'), original)
  assert.equal(fs.existsSync(path.join(root, 'plugins/bottasker-tasky/.app.json')), false)
})

test('invalid profile and missing or invented app identifiers fail before creating outputs', (t) => {
  const root = fixture(t)
  for (const value of [undefined, '', 'asdk_app_0123456789abcdef0123456789abcdef', 'Tasky', `${pluginId}?x=1`]) {
    assert.throws(() => normalizeAppId(value))
    assert.throws(() => buildPackage({ root, profile: 'connected', pluginId: value }))
  }
  assert.throws(() => buildPackage({ root, profile: 'submission', pluginId }))
  assert.throws(() => buildPackage({ root, profile: 'public' }))
  assert.equal(fs.existsSync(path.join(root, '.tasky-runtime')), false)
})

test('validator rejects a portable declaration that silently points Local at PROD', (t) => {
  const root = fixture(t)
  const file = path.join(root, 'plugins/bottasker-tasky/mcp.json')
  const mcp = readJson(file)
  mcp.mcpServers['bottasker-tasky'].extensions['com.openai'].auth.resource = 'http://localhost:3200/mcp'
  fs.writeFileSync(file, JSON.stringify(mcp))
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/validate-plugin.mjs')], { encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /portable OAuth/)
})
