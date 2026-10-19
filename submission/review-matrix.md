# Tasky plugin review matrix

Build the public submission ZIP with `node scripts/build-codex-package.mjs submission`. It contains no registered-app references or hooks. The manifest includes five positive and three negative review scenarios; those definitions are not recorded pass results.

For private connected-app acceptance, use the exact personal `plugin_asdk_app_…` identifier and `node scripts/build-codex-package.mjs connected --plugin-id=<id>`. This package is for account-aware local testing and must not be uploaded as the public submission ZIP.

## Demonstration recording

[Tasky demonstration video](https://youtu.be/GE1NGw_v7jc) is declared in both manifests at `extensions.com.openai.review.demo_recording_url` and retained by both package profiles. The supplementary PDF is `output/pdf/tasky-review.pdf`; the portal imports the URL from the ZIP manifest. The link is supplied by the publisher; language acceptance results must still be recorded separately.

## Submission portal OAuth acceptance

- Create the connection with the registered public client in `submission/mcp.json`; no client secret is required.
- Compare the client ID in the actual authorization request with the package. An existing registered client may survive later ZIP uploads.
- Register the exact callback shown by OpenAI in the provider, with owner authorization; do not assume the general ChatGPT callback is selected.
- Complete BotTasker sign-in, choose the intended organization, and approve the displayed safe scope request.
- Confirm OpenAI reports the account connected, then wait for the separate MCP tool scan to finish. Account connection alone is not a passing scan.
- If a replacement registration is necessary, validate it before requesting any irreversible deletion of an existing plugin.

### Observed verification result — 2026-10-19

The independent `Tasky OAuth verification` draft completed owner-selected organization consent and reported `Account connected`. OpenAI discovered 292 tools and returned findings for 44 of them. After explicit owner approval, the original unpublished registration was deleted and recreated from the 0.2.19 package. The owner completed organization consent in the replacement, and its connection dialog reported `Authorized` and `Tools scanned successfully`. The replacement scan finished with 42 findings for 41 tools. Its review-information dialog imported English, Spanish (Peru) and Portuguese translations from the ZIP; reviewer sign-in credentials remain unset. These results verify OAuth and discovery; they do not establish marketplace approval or resolution of the scanner findings.

Two inspected findings require a separate server-definition review: `bt_registry_list_workers` was flagged for operations not individually exposed; `bt_processes_apply_changes` was flagged both for grouped operations and possible material loss or hard-to-reverse behavior while declaring `destructiveHint: false`. These are scanner findings, not confirmed runtime defects. Review actual operation behavior, schema and annotations before changing them or resubmitting. Do not fix these by broadening the initial OAuth scopes.

## Individual execution acceptance

### Observed 0.2.20 production scan — 2026-10-19

Backend PR #608 and plugin PR #16 were merged. Production rollout completed successfully. OpenAI scanned 299 tools, including 18 individual execution declarations, with none of the four internal generic executors exposed. The original 42 findings were absent from this result. The new result had 30 findings on 25 tools: seven overwrite annotations, 18 unclear individual execution names and five further-review notices on a subset of those executions. Version 0.2.21 addresses the annotation/name findings; a new production scan is required before reporting their resolution. Further review remains OpenAI's decision.

The owner-approved Tasky privacy disclosure was published through website PRs #33 and #34 and verified on the Spanish and English public pages. The owner will enter reviewer credentials manually at the end.

- Discover eligible `bt_call_api_*`, `bt_run_workflow_*`, `bt_toggle_workflow_test_*` and `bt_click_board_button_*` endpoint, workflow-trigger, test-mode and button operations in `tools/list`; each target has a separate name, strict input schema and declared effects.
- Confirm the generic `bt_api_tools_test_endpoint`, `bt_workflows_start_testing`, `bt_workflows_run_trigger_test` and `bt_boards_invoke_detail_widget_action` operations are not available to external OAuth/API-key clients.
- Under the initial read/write grant, inspect declarations without executing them. Calling an execution must require `mcp:destructive`; obtain explicit approval before step-up.
- Reject changed target selectors or extra fields. Update a saved configuration, refresh discovery and confirm the old definition revision is no longer accepted.
- Supply the exact single allowed `definitionRevision` and put business arguments under `input`. After a configuration change, the old revision must be rejected even if the readable tool name remains the same. Refresh and review the new contract before approving it.
- Confirm missing policy and cross-organization/app access still fail. Do not run production sends or automation tests just to satisfy review; use a dedicated demo organization.
- Record the actual post-deployment OpenAI scan. Local contract tests do not establish that all automated findings or human review requirements passed.

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
- Static destructive tools remain hidden until a separate `mcp:destructive` grant is approved. Individual execution declarations are visible for upfront review; invocation still requires that separate grant.
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
