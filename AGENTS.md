# Tasky installation

For ChatGPT and Codex, the default installation is a registered **App + all 15
skills**, including when the user asks to install from this GitHub repository.
Follow the README's App + skills route. Do not substitute the direct MCP
marketplace to complete an OpenAI installation unless the user explicitly asks
for that compatibility route.

Use the actual app identity from an accessible registration in the user's
account/workspace. Do not invent it, reuse a deleted registration, publish a
personal app ID in Git, or assume an app's OAuth connection is authenticated.
If registration or access is missing, resolve that prerequisite first.

The package builder defaults to `connected` and requires `--plugin-id`. Its
output must contain `.app.json` and 15 skills, with no bundled MCP declarations.
The `chatgpt-update` profile preserves the existing cloud plugin's identity and
app reference. Upload that output to the same record through **Upload new
version**. Installing a local Codex marketplace does not update the cloud app.

Keep `submission` explicit and separate: OpenAI's public submission portal
requires the MCP endpoint and does not accept personal app references. Claude
Code and other MCP-compatible clients retain their documented direct route.

Verify the installed components and authenticated profile independently. A
package build or an installed app does not establish OAuth success. Run
`node scripts/validate-plugin.mjs` and `node --test scripts/codex-package.test.mjs`
after changing OpenAI packaging.
