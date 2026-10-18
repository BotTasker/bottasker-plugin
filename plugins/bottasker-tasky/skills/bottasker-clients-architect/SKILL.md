---
name: bottasker-clients-architect
description: "Use when the user wants to build an app with BotTasker Clientes or configure and operate its client records, prospects, contacts, interactions, tasks, segments, imports, and contextual AI follow-up."
---

# BotTasker Clients Architect

Own the native `clients` module inside the selected app. Use it as the source of truth for people, companies, prospects, contacts, commercial status, interaction history, tasks, and client follow-up. Do not recreate those native entities in Base de datos or invent a CRM with duplicate tables.

For a complete application, coordinate with `bottasker-app-builder`: select modules and approve the app blueprint there, then return here to implement Clientes. Add other modules only for needs Clientes does not cover. For example, a health insurance sales app can keep leads, coverage preferences, qualification notes, and follow-up in Clientes; products belong in Catalogs when a real sellable catalog is needed. A quote/policy transaction may need its own model, but must reference the real client rather than duplicate their identity.

## Response language

Support Spanish, Brazilian Portuguese, and English. Follow the user's explicitly requested response language; otherwise use the language of their current request, retaining the established preference when a short or mixed-language message is ambiguous. Apply that language to plans, questions, confirmations, summaries, and explanations of errors, even when a tool returns text in another language. Use the requested language for generated content, which may differ from the conversation language; changing the conversation language does not authorize translating or updating existing records. Preserve tool names, payload keys, enum values, identifiers, existing resource names, and error codes exactly. When referring to a visible product control, keep its actual label when needed to help the user find it.

## Discovery and execution

1. Call `bt_context_get_profile`, `bt_apps_list_modules`, and resolve the exact app with `bt_apps_list` / `bt_apps_get`. Do not infer access from the app name or a supplied record ID.
2. Call `bt_mcp_find_tools` with `moduleKey: "clients"`, the requested intent, and effect. Use the returned schemas, policies, and approval metadata. The canonical Clients tools are `bt_clients_*`; these are Tasky's administration/operation tools, distinct from the contextual tool equipped on a sales agent.
3. Read `bt_clients_get_state`. After the app module is enabled, `bt_clients_enable` initializes its activation boundary. This never imports old conversations or starts follow-up for all existing clients.
4. Read current states with `bt_clients_get_statuses`, fields with `bt_clients_list_fields`, and existing records with `bt_clients_list` before writes. Use the enriched paginated list instead of loading every contact, interaction, and task separately per client.
5. For a narrow authorized non-destructive change, perform it and verify it. For a new app or broad redesign, present the business flow, states/fields, intake, daily work screens, follow-up rules, unresolved decisions, and execution order first. Follow the existing App Builder approval workflow; do not ask twice for a plan already approved.
6. Preserve real IDs and `revision` from read results. Updates require `expectedRevision`. Status configuration and field order have their own revision; first configuration can have revision zero. On conflict, reload and reconcile the requested change instead of overwriting someone else's changes.
7. Use a stable `requestKey` for a logical create/import/reference operation; reuse it for an identical retry and change it for a different operation. Verify the result with a read-back. A timeout or `success:false` is not proof of success; do not create another record blindly.

Never send `organization`, actor identity, delegated permissions, runtime context, or internal scheduler fields in user inputs. The authenticated connection and backend own authorization. Explain missing access in business language, preserving the actual error category; do not change roles to work around it.

## Build an application around Clientes

Provide App Builder and the agent specialist with `moduleContext.clients` containing:

- appId, activation state, actual status keys/default/reporting groups;
- actual field IDs, types, required values, reference targets, privacy and agent visibility;
- intended capture channels, identity/duplicate rules, contact requirements, ownership and person-company relationships;
- daily work: Listado, client detail, interactions/changes, Pendientes and Completados in Seguimientos, saved views or segments;
- the approved follow-up mode, timezone, hours, steps, response behavior, same/fixed agent and channel, fallback, limits, and explicit send authorization;
- agent tool scope and enabled operations, human handoff, stop criteria, and verification cases.

Use `bt_apps_create` / `bt_apps_update` / `bt_apps_update_menu` through App Builder to enable the real module key returned by discovery. Preserve the rest of the app and menu. Configure native states and custom fields next; equip agents only after that context exists. Do not create demo leads, enable sending, or backfill historical conversations merely because an app is being configured.

For integrations, discover the real target connector or workflow node. A form is not automatically connected to Clientes: only claim it writes clients after confirming a supported mapping/action and verifying its result. Use `bottasker-forms-architect` and `bottasker-automation-engineer` where needed. Use `bottasker-dashboard-architect` only after verifying a supported Clientes reporting source; never assume a Clients collection is a Base de datos model.

## Fiches, identity, and contacts

- Use `bt_clients_create`, `bt_clients_get`, `bt_clients_update`, `bt_clients_available_owners`. `kind` is `person` or `company`, and is immutable after creation. Commercial `status` is a different concept. Use the current configured default unless the business request specifies Prospecto/Cliente or another actual state.
- Client fields are `name`, `kind`, `company`, `status`, `ownerId`, `tags`, `description`, `doNotContact`, and `customValues`. Phone/email are explicit contact records, not top-level client fields. An unknown name can be collected conversationally; do not invent personal details.
- Search before creating or resolving an existing person. Multiple plausible matches require disambiguation; do not merge by name alone. External integrations use `bt_clients_lookup_external` / `bt_clients_upsert_external` with a deliberate source namespace and real external ID. Existing records require the current revision; creation still requires create permission.
- Use `bt_clients_list_contacts`, `bt_clients_create_contacts`, `bt_clients_update_contacts` for contacts. Creation needs a name and at least email, an international phone (`+` country code), or a real external identifier. Do not guess the country or fabricate provider identity. Existing channel/external linkage is immutable.
- Use `bt_clients_list_relations` / `bt_clients_create_relation` for real person-company links with an explicit role. Closing a relationship uses `bt_clients_archive_relation`; it does not archive either client.
- Notes private to the business are separate from ordinary interaction notes. `bt_clients_update_private_notes` requires specific sensitive-write access as well as backend edit access. Do not copy private or agent-disabled custom fields into agent prompts, templates, exports, or conversations.
- `bt_clients_propose_merge` proposes a duplicate review without merging. `bt_clients_merge_preview` is read-only; `bt_clients_merge_commit` needs reviewed choices, proposal, current revisions and explicit confirmation. A partial/uncertain merge uses `bt_clients_merge_recover` with the real operation ID after review, not another blind commit. Archiving (`bt_clients_archive`) differs from the commercial Inactivo state. `bt_clients_purge_preview` only inspects removal dependencies; it never deletes. Do not invent a purge execution tool.

## States, fields, views, and history

- `bt_clients_get_statuses` / `bt_clients_save_statuses`: preserve real state keys, labels, active flags, order, colors and reporting groups. New state keys start `draft_`; read back the server-issued `custom_` keys before using them. Reporting groups remain `unclassified`, `prospect`, `customer`, `inactive`; they are not extra workflow states. Keep a valid active default.
- `bt_clients_list_fields`, `bt_clients_create_field`, `bt_clients_update_field`: types are `text`, `longText`, `number`, `date`, `boolean`, `select`, `multiSelect`, `reference`. Options are strings; date values use `YYYY-MM-DD`. References target Clientes (`person`, `company`, `any`). Use actual field IDs under `customValues`. Type and reference target cannot be changed in place. Privacy (`readPolicy` / `writePolicy`) and `agentEnabled` are independent choices. Required fields can prevent writes; do not invent values to satisfy them.
- `bt_clients_get_field_order` / `bt_clients_save_field_order`: preserve all current field IDs, including inactive ones, and the field-order revision when reordering. This affects display order without rewriting stored client values.
- `bt_clients_list_views`, `bt_clients_get_view`, `bt_clients_create_view`, `bt_clients_update_view`: dynamic views use filters; static segments use explicit client IDs. Filters use `field`, `op`, `value`, with supported operators `eq`, `ne`, `in`, `contains`, `gt`, `gte`, `lt`, `lte`, `empty`, `notEmpty`. Do not send raw Mongo queries. Read-back verifies ownership/shared visibility.
- `bt_clients_list_activities`, `bt_clients_create_activities`, `bt_clients_update_note`: interactions are notes, messages, calls, or meetings. Recording a message/call is an audit entry, not a delivery or phone call. Only ordinary note text is editable. Optional source links require authorized real resources created after module activation; validate them with `bt_clients_list_sources` / `bt_clients_get_source` and never backfill old chat history.
- `bt_clients_list_audit` provides changes and actors. Say who actually performed the action; an AI agent's activity belongs to that agent, not its human creator. Tasky configuration changes execute with the authenticated operator's permissions; do not impersonate the equipped sales agent.

## Tasks and follow-up are different operations

Manual tasks use `bt_clients_list_tasks`, `bt_clients_create_tasks`, `bt_clients_update_tasks` and `bt_clients_list_followup_tasks`. They have title, description, responsible person, optional dueAt (Unix milliseconds), and `pending` / `completed` / `cancelled` state. A null/missing date is unscheduled. A normal task alone does not equip or wake an AI agent.

For native AI follow-up, distinguish three levels:

1. **App configuration:** how new follow-up cycles operate.
2. **Agent capability:** which conversational agent can use that configuration.
3. **Client cycle:** a particular purpose/contact/conversation and its one next pending task.

Configuring the app is not a command to contact every client. Equipping a tool is not proof a cycle is scheduled. A saved draft is not an active configuration.

### Configure the app

1. Read `bt_clients_get_followup_settings` and `bt_clients_followup_options`. Preserve existing settings not being changed and resolve actual available agents/connections.
2. Prepare a complete configuration matching `bt_clients_preview_followup_settings` / `bt_clients_save_followup_settings`. `mode`: `manual` (person contacts), `review` (AI draft requires approval), or `automatic` (AI sends under the rules). Same conversation agent/channel uses `agentSource: "conversation"`, `channelSource: "conversation"`; fixed sources need the actual IDs. `fallbackAgentId` handles a missing conversation agent; it does not authorize a different recipient/channel.
3. Set timezone and seven `hours` entries in Monday-to-Sunday order. Each day has `active` and up to four `turns` with `open` / `close` in `HH:mm`. Out-of-hours sends move to the next allowed range. Two minutes after Friday night can therefore mean Monday morning; inspect the preview before calling this a scheduling defect.
4. Define ordered `steps` with unique id, label, `contentMode: "template" | "objective"`, corresponding template/objective, `useConversation`, and schedule. Approved template variables are `{{nombre}}`, `{{contacto}}`, `{{proposito}}`; do not invent private field interpolation.
5. Schedule bases: `activation`, `unanswered`, `previous`, `due`, `date`, `weekday`, `immediate`. Amount/unit, `businessDays`, direction, and conditional anchor matter. First step cannot use `previous`; `unanswered` waits from the last relevant agent message expecting an answer, not the client record creation time. `previous` waits from the preceding successful send. Absolute `at` and dueAt are Unix milliseconds; weekday is 1=Monday through 7=Sunday. A missing required anchor produces an unscheduled/blocked result; do not manufacture a date.
6. Set `responseBehavior` explicitly: `restart`, `continue`, or `stop` on customer reply. Follow the user's choice; do not silently rely on legacy defaults. Repetition has a bounded max/end; total expanded sequence is at most ten sends. `maxPerContactDay` and `minSeparationMinutes` are contact-wide guardrails, not replacements for step frequency; a 60-minute guardrail can override a requested five-minute interval. Explain the effective timing rather than weakening limits silently.
7. Preview, save with current revision, read back, then use `bt_clients_activate_followup_settings` only when activation/sending is authorized. The UI's Guardar combines save and activation; the underlying tools are separate and require both results to confirm active. Activating automatic/review mode also requires the backend's task/contact/follow-up/send permissions. `bt_clients_pause_followup_settings` pauses/reactivates the app setting; it does not erase history.

Changes apply to new activations; existing cycles retain their configuration snapshot. Do not retrofit or replay old cycles to “apply” new settings.

### Equip the conversational agent

Coordinate with `bottasker-ai-agent-architect`. Discover the Clients tool with `bt_ai_agent_tools_discover` using the user's intent; inspect it with `bt_ai_agent_tool_get_config_schema`, prepare with `bt_ai_agent_prepare_item_config`, validate with `bt_ai_agent_validate_item_config`, and add/update only the discovered real item through `bt_ai_agents_add_item` / `bt_action_instances_update_config`. Read existing items first and preserve unrelated tools, inputs, outputs and prompts.

Configure the discovered access scope (`assigned` or `all`) and enabled `tools` using real options. When the approved design includes configured client follow-up, enable the option **Usar el seguimiento con IA configurado** (`start_followup`). The backend automatically supplies the instructions/context to the agent. The administrator must not paste a second follow-up prompt. Do not hard-code permissions or equate this option to the AI Agents module's separate simple conversation follow-up feature.

During conversation, capture/update the client, explicit contact, permitted qualification data and useful history. Start/reuse follow-up for a real unresolved commercial purpose. A first contact may need a return if identity/qualification is incomplete; later decisions depend on context. Do not follow up after rejection, completion, No contactar or human takeover, or when no useful pending purpose remains. Never schedule another cycle or manual task on every normal response. Use the existing pending task/cycle and the configured restart/continue/stop behavior; update an agreed date or close a fulfilled/rejected purpose through the contextual tool when appropriate.

Automatic work is assigned to the resolved same AI agent (or configured fixed/fallback agent), not its creator. Only the next pending task exists. After a confirmed successful send the system creates the next step; no whole sequence of pending tasks upfront. Redis wakes the agent at the computed time; startup/hourly recovery handles the last hour. Tasky must not add its own cron, poll loop, Redis job, workflow timer or duplicate task to implement this behavior.

### Operate and diagnose a cycle

- Use `bt_clients_list_followup_runs`, `bt_clients_get_followup_run`, `bt_clients_followup_recipients` and task reads to inspect the actual cycle, snapshot, nextRunAt, current task, agent, contact, conversation, channel, blocked state and audit. An active agent and an active follow-up configuration are distinct.
- Manual activation uses `bt_clients_start_followup` with real taskId, contactId and purpose plus verified conversation/connection context; it may schedule real sending, so honor explicit authorization and pending approval. Never send `runtimeContext` or call internal wake/delivery actions to impersonate the sales agent.
- Pause/cancel/resume/take control with `bt_clients_pause_followup`, `bt_clients_cancel_followup`, `bt_clients_resume_followup`, `bt_clients_take_control_followup` using current revision. Review operations: `bt_clients_edit_followup_draft`, `bt_clients_approve_followup` (exact current hash), `bt_clients_classify_followup_response`. `bt_clients_complete_manual_followup` records a contact actually completed by a person; never use it to fake a successful AI send.
- Check effective hours/timezone, step anchor, prior send receipt, response handling, minimum separation/max-per-day, contact validity, live permissions, same agent availability, channel/connection and human takeover before concluding Redis failed. WhatsApp needs a valid attention window; Telegram needs a known chat. A phone copied into notes is not proof of a valid messaging connection. Review mode waits for approval; uncertain delivery requires `bt_clients_followup_receipt_options` and reviewed `bt_clients_reconcile_followup_receipt` using the real receipt, not blind resend.
- If step one succeeded but step two is absent, inspect cycle state and receipt, whether the customer replied/stopped it, the second schedule anchor and current snapshot. Absence of all future pending tasks is expected; absence of the one next eligible task needs diagnosis.
- Do not test by sending to real clients. Use mocks/previews or an explicitly authorized test conversation; keep restrictions such as no sending or no server startup in force. Never report “sent” when merely scheduled, drafted or attempted.

## Import and export

Use `bt_clients_import_headers` then `bt_clients_import_preview`; map every exact CSV header to an allowed core field, actual custom field ID, `email`, `phone`, `externalId`, or `ignore`. Use a stable namespace for external references. Review invalid rows, ambiguous/duplicate matches, privacy and update conflicts. Only `bt_clients_import_confirm` with the reviewed preview ID and explicit approval writes the batch. Import permission does not bypass create/update/contact/field checks. Do not reimport history to activate follow-up.

`bt_clients_export` accepts explicit columns plus filters or viewId and enforces field access. Avoid collecting or exporting unnecessary sensitive data. Use the existing Files skill only when a real supported file-reading step is needed; do not invent upload/import connectors.

## Verification and handoff

Read back configuration and resources. For a configured follow-up solution, verify enabled app state, actual agent tool config, one scheduled next task assigned to the correct AI agent, effective timezone/date, reply behavior and stop conditions using previews/mocks or an authorized test conversation. Test ordinary client registration still works, repeated turns do not duplicate tasks, a confirmed send chains the next step, and no-follow-up cases stay closed.

Report actual changes and verified state in product language. Identify remaining gaps honestly: missing permission, contact, channel, approval, unavailable connector or incomplete runtime evidence. Do not present a dry-run implementation plan or a scheduled task as proof of a successful customer delivery.
