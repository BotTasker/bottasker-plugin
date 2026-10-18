import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const plugin = path.join(root, 'plugins', 'bottasker-tasky')
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const fail = (message) => {
  process.stderr.write(`Plugin validation failed: ${message}\n`)
  process.exitCode = 1
}

const codexManifest = readJson(path.join(plugin, '.codex-plugin', 'plugin.json'))
const claudeManifest = readJson(path.join(plugin, '.claude-plugin', 'plugin.json'))
const codexMcp = readJson(path.join(plugin, '.mcp.json'))
const claudeMcp = readJson(path.join(plugin, 'claude.mcp.json'))
const portableManifest = readJson(path.join(plugin, 'plugin.json'))
const portableMcp = readJson(path.join(plugin, 'mcp.json'))
const submissionMcp = readJson(path.join(root, 'submission', 'mcp.json'))
const openai = portableManifest.extensions?.['com.openai']
const changelog = fs.readFileSync(path.join(plugin, 'CHANGELOG.md'), 'utf8')

for (const requiredFile of ['LICENSE', 'README.md', 'submission/listing.json']) {
  if (!fs.existsSync(path.join(root, requiredFile))) fail(`missing ${requiredFile}`)
}
if (!fs.existsSync(path.join(plugin, 'CHANGELOG.md'))) fail('plugin CHANGELOG.md is missing')
if (!fs.existsSync(path.join(plugin, 'README.md'))) fail('plugin README.md is missing')

if (codexManifest.name !== claudeManifest.name) fail('manifest names differ')
if (codexManifest.version !== claudeManifest.version) fail('manifest versions differ')
for (const field of ['name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords']) {
  if (JSON.stringify(portableManifest[field]) !== JSON.stringify(codexManifest[field])) fail(`portable ${field} differs from Codex compatibility manifest`)
}
if (portableManifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') fail('portable plugin schema is missing')
if (portableMcp.$schema !== 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json') fail('portable MCP schema is missing')
if (JSON.stringify(openai?.interface) !== JSON.stringify(codexManifest.interface)) fail('OpenAI interface metadata differs between manifests')
for (const field of ['onboardingSkill', 'review', 'publication']) {
  if (JSON.stringify(openai?.[field]) !== JSON.stringify(codexManifest.extensions?.['com.openai']?.[field])) fail(`OpenAI ${field} differs between manifests`)
}
const translations = openai?.publication?.translations
if (!openai?.publication?.release_notes?.trim()) fail('publication release notes are missing')
for (const locale of ['en-US', 'es-PE', 'pt-BR']) {
  const translation = translations?.[locale]
  if (!translation || typeof translation !== 'object') {
    fail(`missing translation for ${locale}`)
    continue
  }
  for (const [field, limit] of [['subtitle', 30], ['description', 4000]]) {
    const value = translation[field]
    if (typeof value !== 'string' || !value.trim() || value.length > limit ||
        /[\u0000-\u0009\u000B-\u001F\u007F]/u.test(value) ||
        (field === 'subtitle' && /[\r\n]/u.test(value))) {
      fail(`${locale} translation ${field} must contain supported text within ${limit} characters`)
    }
  }
}
if (translations?.['en-US']?.subtitle !== codexManifest.interface?.shortDescription ||
    translations?.['en-US']?.description !== codexManifest.interface?.longDescription) {
  fail('English translation must match the base English listing')
}
if (openai?.apps !== undefined) fail('canonical portable package must remain eligible for ZIP submission')
if (openai?.onboardingSkill !== './skills/bottasker-connection-guide/SKILL.md' ||
    !fs.existsSync(path.join(plugin, openai.onboardingSkill))) fail('onboarding must reference the packaged connection guide')
const cases = openai?.review?.test_cases
try {
  const value = openai?.review?.demo_recording_url
  const url = new URL(value)
  if (typeof value !== 'string' || /\s/u.test(value) || url.protocol !== 'https:' || url.username || url.password) {
    fail('review demo recording URL must be a public HTTPS URL without credentials')
  }
} catch {
  fail('review demo recording URL is missing or invalid')
}
if (cases?.positive?.length !== 5 || cases?.negative?.length !== 3) fail('MCP review needs five positive and three negative cases')
for (const [kind, entries] of Object.entries(cases || {})) {
  for (const entry of entries) {
    for (const field of ['description', 'prompt', 'expected_behavior', ...(kind === 'positive' ? ['tools_triggered'] : [])]) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) fail(`${kind} review case is missing ${field}`)
    }
  }
}
if (codexManifest.apps !== undefined) fail('Codex manifest must not reference a private App while it is ineligible')
if (fs.existsSync(path.join(plugin, '.app.json'))) fail('private .app.json must stay out of the active development package')
if (codexManifest.mcpServers !== './.mcp.json') fail('Codex manifest must reference ./.mcp.json')
const changelogVersion = changelog.match(/^##\s+(\d+\.\d+\.\d+)\s*$/m)?.[1]
if (changelogVersion !== codexManifest.version) {
  fail(`latest changelog version ${changelogVersion || '<missing>'} does not match manifest ${codexManifest.version}`)
}
if (codexManifest.license !== 'Apache-2.0' || claudeManifest.license !== 'Apache-2.0') fail('license metadata must match LICENSE')
if (claudeManifest.userConfig) fail('Claude userConfig must not be required for OAuth')

for (const [field, value] of Object.entries({
  homepage: codexManifest.homepage,
  website: codexManifest.interface?.websiteURL,
  privacy: codexManifest.interface?.privacyPolicyURL,
  terms: codexManifest.interface?.termsOfServiceURL,
  support: codexManifest.interface?.supportURL,
})) {
  try {
    if (new URL(value).protocol !== 'https:') fail(`${field} URL must use HTTPS`)
  } catch {
    fail(`${field} URL is invalid`)
  }
}
for (const field of ['displayName', 'shortDescription']) {
  if (!codexManifest.interface?.[field] || codexManifest.interface[field].length > 30) fail(`${field} must contain 1–30 characters for public submission`)
}
const listing = readJson(path.join(root, 'submission', 'listing.json'))
for (const [field, listingField] of Object.entries({
  supportURL: 'support', privacyPolicyURL: 'privacyPolicy', termsOfServiceURL: 'termsOfService', shortDescription: 'shortDescription', longDescription: 'description',
})) {
  if (listing[listingField] !== codexManifest.interface[field]) fail(`submission listing ${listingField} differs from the packaged metadata`)
}
if (JSON.stringify(listing.translations) !== JSON.stringify(translations)) fail('submission listing translations differ from the packaged metadata')

for (const field of ['composerIcon', 'logo', 'logoDark']) {
  const relativePath = codexManifest.interface?.[field]
  if (relativePath && !fs.existsSync(path.resolve(plugin, relativePath))) fail(`${field} asset is missing`)
}

for (const [label, server] of [
  ['Codex', codexMcp.mcpServers?.['bottasker-tasky']],
  ['Claude', claudeMcp.mcpServers?.['bottasker-tasky']],
]) {
  if (server?.url !== 'https://api.bottasker.ai/mcp') fail(`${label} MCP URL is not canonical`)
  if (server?.headers || server?.bearer_token_env_var) fail(`${label} MCP config contains manual credentials`)
}
const codexServer = codexMcp.mcpServers?.['bottasker-tasky']
if (codexServer?.type !== 'http') fail('Codex MCP transport must be http')
if (codexServer?.oauth_resource !== 'https://api.bottasker.ai/mcp') fail('Codex MCP OAuth resource is not canonical')
const portableServer = portableMcp.mcpServers?.['bottasker-tasky']
const submissionServer = submissionMcp.mcpServers?.['bottasker-tasky']
const auth = submissionServer?.extensions?.['com.openai']?.auth
if (Object.keys(portableMcp.mcpServers || {}).length !== 1 || portableServer?.type !== 'streamable-http' ||
    portableServer?.url !== codexServer?.url) fail('portable transport and URL must match the hosted MCP')
if (Object.keys(portableServer || {}).some((field) => !['type', 'url'].includes(field))) {
  fail('runtime portable MCP must contain only transport and URL for desktop compatibility')
}
if (submissionMcp.$schema !== portableMcp.$schema || Object.keys(submissionMcp.mcpServers || {}).length !== 1 ||
    submissionServer?.type !== portableServer?.type || submissionServer?.url !== portableServer?.url) {
  fail('submission MCP must match the runtime portable endpoint')
}
if (auth?.type !== 'oauth' || auth?.client?.mode !== 'cimd' || auth?.resource !== codexServer?.url ||
    JSON.stringify(auth?.baseScopes) !== JSON.stringify(['mcp:read', 'mcp:write']) ||
    JSON.stringify(auth?.defaultScopes) !== JSON.stringify(['mcp:read', 'mcp:write'])) fail('submission OAuth must prefer CIMD and request only safe initial scopes')

for (const [label, config] of [['Codex', codexMcp], ['Claude', claudeMcp]]) {
  const serverNames = Object.keys(config.mcpServers || {})
  if (serverNames.length !== 1 || serverNames[0] !== 'bottasker-tasky') {
    fail(`${label} MCP server name must be bottasker-tasky`)
  }
}

const skillsDir = path.join(plugin, 'skills')
for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const skillPath = path.join(skillsDir, entry.name, 'SKILL.md')
  if (!fs.existsSync(skillPath)) {
    fail(`${entry.name} has no SKILL.md`)
    continue
  }
  const source = fs.readFileSync(skillPath, 'utf8')
	const agentPath = path.join(skillsDir, entry.name, 'agents', 'openai.yaml')
	if (!fs.existsSync(agentPath)) fail(`${entry.name} has no agents/openai.yaml`)
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatter) {
    fail(`${entry.name}/SKILL.md has invalid frontmatter`)
    continue
  }
  const declaredName = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim()
  if (declaredName !== entry.name) fail(`${entry.name}/SKILL.md declares name ${declaredName || '<missing>'}`)
  if (!/^description:\s*.+$/m.test(frontmatter[1])) fail(`${entry.name}/SKILL.md has no description`)
	if (/\[TODO:|<TODO>/i.test(source)) fail(`${entry.name}/SKILL.md contains an unfinished placeholder`)
	for (const match of source.matchAll(/\[[^\]]+\]\((?!https?:|#)([^)]+)\)/g)) {
		const target = match[1].split('#')[0]
		if (target && !fs.existsSync(path.resolve(path.dirname(skillPath), target))) {
			fail(`${entry.name}/SKILL.md links to missing ${target}`)
		}
	}
}

const pluginFiles = fs.readdirSync(plugin, { recursive: true, withFileTypes: true })
for (const entry of pluginFiles) {
	if (!entry.isFile()) continue
	const filePath = path.join(entry.parentPath || entry.path, entry.name)
	const source = fs.readFileSync(filePath, 'utf8')
	if (/BOTASKER_API_KEY|bearer_token_env_var|Authorization\s*:\s*Bearer|sk-[A-Za-z0-9_-]{16,}/.test(source)) {
		fail(`${path.relative(plugin, filePath)} contains a manual credential or probable secret`)
	}
}

if (!process.exitCode) process.stdout.write(`Validated ${codexManifest.name} ${codexManifest.version} for Codex and Claude Code.\n`)
