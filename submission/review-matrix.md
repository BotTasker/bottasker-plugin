# Current release: 0.2.32

Version 0.2.32 makes the ChatGPT cloud update reproducible: download the existing personal plugin ZIP, run `chatgpt-update --existing-plugin-zip=<absolute-path>`, and upload the generated ZIP using **Upload new version** on that same record. It preserves the technical plugin name and app mapping while adding the 15 repository skills. It excludes duplicate MCP declarations and portal-only MCP review cases from that personal package. A local Codex installation is not evidence of cloud skill installation.

The public `submission` ZIP remains a separate **With MCP** upload: canonical name `bottasker-tasky`, production endpoint and explicit OAuth settings, 15 skills, three listing translations and the demonstration video. It contains no personal app references. This release changes packaging and documentation; it requires no MCP backend deployment and does not resolve or suppress findings about dynamic tool execution. Production must already be ready before uploading and scanning.

Acceptance performed on the personal cloud plugin with 0.2.31: ChatGPT visibly displayed **Apps 1**, **Skills 15**, version **0.2.31**, the linked OAuth account and the production endpoint. The earlier app-only wrapper had shown version 1.0.0 with no Skills section. That observation establishes the cloud update route; it is not a public directory approval or a recorded test of the new 0.2.32 ZIP. Verify the release version and account again after each upload.

## Previous release: 0.2.31

Version 0.2.31 adds client-specific installation instructions and accepts a copied App ID, personal plugin ID or ChatGPT plugin URL for the connected development build. The public submission remains free of personal app mappings. This release changes packaging and documentation only; it does not deploy or change the MCP server's tool catalog.

For connected-app acceptance, use a current registration accessible to the testing account/workspace. Verify one app, all 15 enabled skills, the selected OAuth account and a read-only profile request in a fresh conversation. A registration deleted during cleanup cannot be reused. Input validation and packaging tests do not verify a fresh registration's account access or consent.

## Backend operation contracts retained from 0.2.29

Deploy the production server and verify the 327-tool catalog before uploading the ZIP and rescanning. All 321 previous public names and 70 Clients operations remain. Six fixed product operations are added; tenant resource names/counts never affect discovery.

- Six configuration reads have explicit output contracts. API/workflow/board reads omit execution manifests and accept no includeExecution mode. Board automation/trigger editor choices return an options array in an object; their saved binding-schema read remains configuration data.
- Workflow updates accept configuration fields only and require the workflow inactive. Separate activation, deactivation, start-test-listeners and stop-test-listeners operations have explicit side effects and consent requirements. No status/action selector can convert a configuration update into activation.
- Three read-only previews validate the saved endpoint input, selected workflow trigger input, or configured board-button target/item. Each returns validation status, a revision and its limited validation scope; none dispatches a run, sends HTTP requests/messages, resolves credentials or evaluates custom code. They do not claim to simulate downstream workflow behavior or guarantee successful delivery.
- Real endpoint/trigger/button execution remains dynamic, saved-resource scoped, input-validated and approval-gated. The owner explicitly requires dynamic workflows; no resource-specific tools or restrictive per-organization allowlists are introduced. These contracts may still need human review. Do not claim automatic acceptance before the scan result.

Authorization uses existing seeded policies: read policies for previews, workflows:update for editing/activation, workflows:run for listeners. No new roles or OAuth grants. The package retains the three languages, video and demo review cases; credentials stay in the secure portal.

Earlier sections below describe historical scans and are superseded by this release.

---

# Current release: 0.2.28

Production must be deployed and verified before this ZIP is uploaded. The public catalog now contains 321 original names, including all 70 Clientes operations; it introduces no customer-specific tool names. The duplicate `bt_apps_run_implementation_plan` alias stays internal because it only previews stages; the existing `bt_apps_implementation_plan` remains the public planner. Clientes control descriptions now distinguish cancellation, a resumable pause, future outbound scheduling, recording real manual contact and classifying a real incoming response.

The 0.2.27 automated scan reported 13 grouped-operation findings, one misleading runner-name finding, one unclear cancellation description and two new-definition/further-review notices for manual follow-up completion and response classification. The name and description findings are corrected here. The owner explicitly requested the original reusable interface rather than tools generated from each customer's workflows or endpoints. The remaining reusable-contract findings are submitted for human consideration, not hidden or claimed to have passed.

Seven flagged tools only read configuration or preview document edits: process preview, API/workflow/board reads, and the three board automation-choice/schema reads. They do not execute the returned configuration. The six write/execution contracts are the bounded process editor, saved endpoint execution, workflow update/testing/trigger execution and configured board-button invocation. Each has a static schema, fixed product action boundary, existing tenant/app guards and explicit approval/consent. IDs are resource data; configuration schemas never add callable tools. Only process documentation edits use the fully enumerated bounded operation array; no arbitrary backend action is accepted.

The two Clients notices request further review rather than identify a specific runtime defect. Manual completion is restricted to manual-mode cycles and does not send messages. Classification validates a real incoming message and can close a purpose, pause it or restrict client contact, but does not itself send or automatically restart a cycle. Existing policies, revision checks and truthful destructive annotations remain authoritative. Reviewer credentials remain separately entered by the owner; keep using the dedicated test account and sample data.

---

# Current release: 0.2.27

The owner requested the original reusable catalog rather than the later per-action expansion. Version 0.2.27 restores the public names from the pre-review baseline, retaining all 70 Clients tools. It removes generated customer/workflow tool names and the 13-way process-editor split. There are 322 public operations: the old unsupported raw consumption-log wrapper stays removed and one duplicate dashboard alias stays internal. No new public names are introduced relative to the 324-name historical baseline.

The historical execution names are public, reusable and protected again: `bt_api_tools_test_endpoint`, `bt_workflows_run_trigger_test`, `bt_workflows_start_testing`, and `bt_boards_invoke_detail_widget_action`. Saved IDs remain arguments; selected-resource authorization and saved-schema validation stay authoritative. Reviewed resource revisions are optional compatible inputs, not schema-generated tool names.

The combined process editor declares its full bounded operation schema and destructive effects. The original WhatsApp list/sync contract is restored with conservative write/overwrite/external annotations and an additional policy check for refresh. Workflow status uses the original update operation with status-only input and execution consent. Reviewer acceptance of these contracts remains subject to OpenAI review; do not split them back into tools named after customer resources to bypass findings.

The sections below record earlier scans and superseded approaches; they are not instructions for the current release. Uploading a ZIP updates package metadata/skills only. Complete the backend production rollout and verify its native catalog before requesting a new MCP scan.

---

# Tasky plugin review matrix

Build the public submission ZIP with `node scripts/build-codex-package.mjs submission`. It contains no registered-app references or hooks. The manifest includes five positive and three negative review scenarios; those definitions are not recorded pass results.

For local Codex connected-app acceptance, use the exact personal `plugin_asdk_app_…` identifier and `node scripts/build-codex-package.mjs connected --plugin-id=<id>`. This does not update ChatGPT's cloud plugin. To add skills to that cloud record, use `node scripts/build-codex-package.mjs chatgpt-update --existing-plugin-zip=<downloaded-plugin.zip>` and **Upload new version** on the existing personal plugin. Neither personal package belongs in the public submission.

## Demonstration recording

[Tasky demonstration video](https://youtu.be/GE1NGw_v7jc) is declared in both source manifests at `extensions.com.openai.review.demo_recording_url` and retained by the submission and local connected profiles. The personal `chatgpt-update` profile omits portal review metadata because its tools come from the existing app. The supplementary PDF is `output/pdf/tasky-review.pdf`; the public portal imports the URL from the submission ZIP manifest. The link is supplied by the publisher; language acceptance results must still be recorded separately.

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
