# Current release: 0.2.27

The owner requested the original reusable catalog rather than the later per-action expansion. Version 0.2.27 restores the public names from the pre-review baseline, retaining all 70 Clients tools. It removes generated customer/workflow tool names and the 13-way process-editor split. There are 322 public operations: the old unsupported raw consumption-log wrapper stays removed and one duplicate dashboard alias stays internal. No new public names are introduced relative to the 324-name historical baseline.

The historical execution names are public, reusable and protected again: `bt_api_tools_test_endpoint`, `bt_workflows_run_trigger_test`, `bt_workflows_start_testing`, and `bt_boards_invoke_detail_widget_action`. Saved IDs remain arguments; selected-resource authorization and saved-schema validation stay authoritative. Reviewed resource revisions are optional compatible inputs, not schema-generated tool names.

The combined process editor declares its full bounded operation schema and destructive effects. The original WhatsApp list/sync contract is restored with conservative write/overwrite/external annotations and an additional policy check for refresh. Workflow status uses the original update operation with status-only input and execution consent. Reviewer acceptance of these contracts remains subject to OpenAI review; do not split them back into tools named after customer resources to bypass findings.

The sections below record earlier scans and superseded approaches; they are not instructions for the current release. Uploading a ZIP updates package metadata/skills only. Complete the backend production rollout and verify its native catalog before requesting a new MCP scan.

---

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

### Observed 0.2.21 production scan — 2026-10-19

Production workflow 39211318545 succeeded. OpenAI imported 299 tools with 18 readable individual executions and no old `bt_exec_*` names; all 15 skills and metadata passed. The scan returned 18 findings on 14 tools: one undo annotation, ten duplicate-name notices, and seven further-review notices (four overlap with duplicate notices). The catalog's literal names were all unique, but repeated triggers had identical full titles. Version 0.2.22 makes each trigger's identity prominent in both name and title and corrects the undo annotation. It also presents the app-stage compiler truthfully as planning and keeps its non-executing legacy helper internal. A post-deployment scan is still required; further-review notices are OpenAI decisions.

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

## Live 0.2.22 verification and individual process edits

Backend PR #611 and plugin PR #18 were merged. Production workflow 39215249552 succeeded with image `a49ad274d0f8405998fa3a17279695583aa69275`; all nine deployments adopted it. OpenAI's completed scan returned ten findings on nine tools. Duplicate-name, process undo and app planning findings disappeared. Two findings were technical: the process batch dispatcher and the follow-up pause description. Eight were further-review notices, including one overlapping the pause description. Further review is an OpenAI decision, not evidence of an unspecified code defect.

Version 0.2.23 replaces external process batching with thirteen independently declared editor operations. Each has a strict operation-specific schema, fixed server-side operation type, canonical authenticated organization/app scoping, existing `processes:update` policy, revision checking and idempotency. Removal requires destructive scope and explicit confirmation. The batch dispatcher remains internal for Tasky. Draft editing never executes the documented business process. Descriptions disclose node removal's connected-edge cleanup and review-answer clearing.

The pause description now states status, approval clearing, rejected run states, retained history and absence of message sending. Arbitrary URL knowledge ingestion explicitly declares its open-world effect. Existing permissions and initial OAuth scopes are preserved. Local verification: 306 backend tests in eleven suites, TypeScript checking, 57 plugin tests and manifest validation passed. The new production scan remains pending. Reviewer credentials remain for the owner to enter manually.

## Template synchronization correction (0.2.24)

Inspection of the WhatsApp further-review notice found a concrete mixed contract: the nominally read-only list tool accepted `sync: true`, which called Meta and created or overwrote local cache records. Listing now always sets `sync: false` and rejects the undeclared flag. The separately declared `bt_whatsapp_templates_sync` performs that existing refresh with write scope, approval and a destructive overwrite annotation. It retains the existing `whatsapp-templates:create` policy, canonical organization binding and credential guard. It does not submit templates or send messages; the Meta account is bounded by the authorized credential, so openWorldHint is false. Internal/product service behavior remains unchanged.

WhatsApp Template Architect advances to 0.1.3 and the companion package to 0.2.24. Local validation: 307 backend tests across eleven suites, TypeScript checking, 57 plugin tests, manifest validation, package build and visual PDF verification. The final production scan remains pending.

## Live 0.2.23 editor verification and workflow descriptions (0.2.25)

Production workflow 39262182877 completed successfully with image `af2560658684765da6d0df0252554afe28c6903c`. During the following build, a completed OpenAI scan imported 308 tools. Ten individual process edits were visible under the safe grant; three removal operations remain separately registered behind destructive scope. The internal batch dispatcher was absent. Process editing, follow-up pause and knowledge URL notices disappeared. The result contained sixteen findings on twelve tools: ten unclear workflow-trigger descriptions and six further-review notices, including four overlapping those descriptions. WhatsApp listing still used the pre-0.2.24 backend at this point.

The workflow description correction replaces opaque worker-code inventories (which also listed unrelated triggers) with readable event types and non-trigger saved actions. It states that branch conditions decide which actions run, execution is real, only event data varies and successful dispatch is not downstream completion. Strict input/revision fields now explain their purpose. Bindings, scopes, approval, stale-definition checks and execution policies are unchanged. Automation skill advances to 0.1.8, companion plugin to 0.2.25. Local validation: 308 backend tests across eleven suites, TypeScript checking, 57 plugin tests, manifest validation and rebuilt/visually verified package PDF. Final production deployment and scan remain pending.
