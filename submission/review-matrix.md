# Tasky plugin review matrix

Build the public submission ZIP with `node scripts/build-codex-package.mjs submission`. It contains no registered-app references or hooks. The manifest includes five positive and three negative review scenarios; those definitions are not recorded pass results.

For private connected-app acceptance, use the exact personal `plugin_asdk_app_…` identifier and `node scripts/build-codex-package.mjs connected --plugin-id=<id>`. This package is for account-aware local testing and must not be uploaded as the public submission ZIP.

## Demonstration recording

[Tasky demonstration video](https://youtu.be/GE1NGw_v7jc) is declared in both manifests at `extensions.com.openai.review.demo_recording_url` and retained by both package profiles. The supplementary PDF is `output/pdf/tasky-review.pdf`; the portal imports the URL from the ZIP manifest. The link is supplied by the publisher; language acceptance results must still be recorded separately.

## Native Codex acceptance

- Confirm the personal app is visible to the same Codex account/workspace; public publication is not a prerequisite.
- Verify the plugin detail page shows its app dependency and native Connect/Authenticate controls.
- Connect, approve safe scopes in BotTasker, and wait for host success before invoking tools.
- Confirm setup launches `bottasker-connection-guide` from both a fresh chat and installation during an existing chat.
- Read `bt_context_get_connected_account` and `bt_context_get_profile`; verify identity and organization, then run the five positive and three negative cases.
- Reconnect after revocation and confirm errors remain explicit. Verify refresh does not require a fresh browser consent.
- Disable the connected variant and verify the direct MCP variant remains usable; test Local separately, without a production app mapping.
- Record the actual client version and results. ZIP validation does not establish any of these UI outcomes.

## Installation

- Install from a clean Codex profile and a clean Claude Code profile.
- Confirm that installation does not request an API key, environment variable, repository clone, or terminal configuration.
- Complete browser OAuth, choose an organization, and return to the client.

## Language acceptance

Run the same functional cases with the demo account in Spanish, Brazilian Portuguese and English, recording actual prompts, results and failures. English remains the base listing language; imported listing translations are not proof of a translated directory UI.

| Scenario | Prompt or action | Expected result |
| --- | --- | --- |
| Spanish | `Muéstrame mis apps de BotTasker y resume sus módulos.` | Read-only discovery and a Spanish summary. |
| Brazilian Portuguese | `Mostre meus apps do BotTasker e resuma os módulos.` | The equivalent read-only discovery and a Brazilian Portuguese summary. |
| English | `Show my BotTasker apps and summarize their modules.` | The equivalent read-only discovery and an English summary. |
| Explicit switch | After the Spanish case: `Continue in English.` Then: `Agora responda em português.` | Each next answer follows the requested language without restarting discovery unnecessarily. |
| Separate content language | `Explícame en español y redacta en portugués un mensaje de bienvenida, sin guardarlo ni enviarlo.` | Spanish explanation and Portuguese draft, with no write or send. |
| Existing data | Repeat the app-list case in another language. | Existing app names and stored values retain their exact values. |
| Error explanation | Trigger the same validation/policy error in each language. | The explanation follows the conversation; error codes and permission requirements remain accurate. |

## Authorization

- `mcp:read` exposes read and planning tools.
- `mcp:write` exposes reversible writes only.
- Destructive tools remain hidden until a separate `mcp:destructive` grant is approved.
- Revoking the connection in BotTasker makes the next MCP request return `401`.
- A token issued for another audience or organization is rejected.

## Tool behavior

- Read the authenticated profile and list available apps.
- Create one reversible test resource and verify it with a read-back.
- Attempt a destructive tool without elevation and expect `403 insufficient_scope`.
- Trigger a validation error and confirm it remains an explicit tool error rather than feedback or simulated success.
- Trigger a policy-denied operation and confirm the BotTasker permission error remains visible.

## Reviewer materials still supplied outside source control

- Verified OpenAI and Anthropic publisher accounts.
- Temporary reviewer account and organization.
- Final catalog screenshots captured from the production OAuth flow.
- Country availability and policy attestations entered in each submission portal.
