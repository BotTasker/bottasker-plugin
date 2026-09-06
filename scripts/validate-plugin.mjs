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

for (const requiredFile of ['LICENSE', 'README.md', 'submission/listing.json']) {
  if (!fs.existsSync(path.join(root, requiredFile))) fail(`missing ${requiredFile}`)
}
if (!fs.existsSync(path.join(plugin, 'CHANGELOG.md'))) fail('plugin CHANGELOG.md is missing')
if (!fs.existsSync(path.join(plugin, 'README.md'))) fail('plugin README.md is missing')

if (codexManifest.name !== claudeManifest.name) fail('manifest names differ')
if (codexManifest.version !== claudeManifest.version) fail('manifest versions differ')
if (codexManifest.license !== 'Apache-2.0' || claudeManifest.license !== 'Apache-2.0') fail('license metadata must match LICENSE')
if (claudeManifest.userConfig) fail('Claude userConfig must not be required for OAuth')

for (const [field, value] of Object.entries({
  homepage: codexManifest.homepage,
  website: codexManifest.interface?.websiteURL,
  privacy: codexManifest.interface?.privacyPolicyURL,
  terms: codexManifest.interface?.termsOfServiceURL,
})) {
  try {
    if (new URL(value).protocol !== 'https:') fail(`${field} URL must use HTTPS`)
  } catch {
    fail(`${field} URL is invalid`)
  }
}

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
