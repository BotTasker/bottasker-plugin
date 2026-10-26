# Tasky installation

For local Codex, install **direct MCP + all 15 skills** from this GitHub
repository by default. Follow the README's Codex commands:

```sh
codex plugin marketplace add BotTasker/bottasker-plugin --ref main
codex plugin add bottasker-tasky@bottasker-tasky
codex mcp login bottasker-tasky
```

Use the production endpoint `https://api.bottasker.ai/mcp` with native OAuth.
Do not require a registered OpenAI app, an App ID, or a Platform submission for
this installation. Do not open or modify Platform when installing locally.
Do not change Bottasker Developer or other plugins. Inspect existing Tasky
variants and respect the user's choice before removing duplicates. Never
delete an app registration or publication to uninstall a Codex plugin.

The package builder defaults to `direct`: MCP plus 15 skills, without
`.app.json`. The optional `connected` profile is only for an explicit App +
skills request and requires an actual accessible registered app identity.
Never invent an App ID or reuse a deleted registration. The `chatgpt-update`
profile updates an existing ChatGPT cloud package only when explicitly asked.
The `submission` profile is separate and must also be requested explicitly.

Installation, OAuth authentication and available tools are separate checks.
Verify one enabled Tasky variant, all 15 skills, the effective MCP endpoint,
and the authenticated profile with a read-only query. Let the user sign in,
choose the organization and approve OAuth. Do not claim authentication from
the installed files alone. Keep tokens and generated packages out of Git.

After changing packaging, run `node scripts/validate-plugin.mjs` and
`node --test scripts/codex-package.test.mjs`.
