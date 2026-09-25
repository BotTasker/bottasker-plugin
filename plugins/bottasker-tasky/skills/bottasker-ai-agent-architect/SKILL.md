---
name: bottasker-ai-agent-architect
description: "Use when the user wants to design, create, edit, duplicate or manage AI Agents in an existing or approved BotTasker app: conversation protection, message limits, follow-up, incoming message grouping, subagents, tools, inputs and outputs."
---

# BotTasker AI Agent Architect

Use this skill only as the specialist for the BotTasker `ai-agents` module. It does not own complete app design, module selection, Base de datos (Data Hub) modeling, dashboards, conversations, or workflows unless App Builder has delegated that part of an approved app blueprint.

If the user asks to create a complete app, route to `bottasker-app-builder` first. Return here only after App Builder has selected AI Agents as a required module and has provided the app context.

## Mandatory Flow

1. Discover context:
   - Call `bt_context_get_profile`.
   - Call `bt_ai_agent_tools_discover` with `search` set to the user's natural-language capability intent when the request mentions any tool, action, input, output, worker, or business capability. Use an empty search only for broad inventory.
   - Call `bt_mcp_list_skills` and load relevant dynamic skills with `bt_mcp_load_skill`.
2. Resolve `appId`:
   - If the user names an existing app, call `bt_apps_list` and choose the exact app.
   - If multiple apps match, ask the user which one to use.
   - If this is a new app, stop and ask App Builder to create or approve the app first.
3. Decide whether this is simple or plan-worthy:
   - If the user asks for a narrow, existing-agent change (for example, add one already existing Knowledge Base/document/tool, update the agent prompt, or attach one validated input/output/tool), do not build a visual blueprint. For Knowledge Base/document/tool work, load or delegate to `bottasker-knowledge-base-assistant`; for form design or form-linked agent behavior, load or delegate to `bottasker-forms-architect`; inspect current items, prepare/validate the config, execute the non-destructive write, verify, and summarize.
   - Use `bt_ai_agent_blueprint_plan` only for new agent systems, multi-component changes, unclear architecture, external communication setup, credential-sensitive tools, broad rewrites, or changes with real risks/pending decisions.
   - Evaluate whether proactive behavior would create measurable value for sales, collections, appointments, recovery, support, or stalled opportunities. Select the correct mechanism using Proactivity Decision Rules; do not add proactivity by default.
   - For every conversational channel, discover its input and Response schema. Adding the first supported input creates the channel Response automatically on current backends; additional accounts on that channel reuse it. Read back the workspace before adding an output. Text sending is intrinsic to Response. Enable only the additional sending capabilities exposed there, such as images or documents. Preserve existing Actions and legacy outputs unless migration was requested.
   - Use `bt_ai_agents_get_create_schema` and `bt_ai_agents_validate_create_payload` before `bt_ai_agents_create` unless using `bt_ai_agents_create_simple`.
   - Review discovered workers/actions and call `bt_ai_agent_tool_get_config_schema` for any tool that will be attached to an agent.
   - Call `bt_ai_agent_prepare_item_config` for every planned input, output, subagent tool, and agent item.
   - Call `bt_ai_agent_validate_item_config` for every prepared `initialConfig`.
   - Ask only important unresolved questions.
4. Ask for explicit approval only when required:
   - Present a visual blueprint of all app/agent components using Mermaid plus tables for plan-worthy work.
   - Do not call remove/archive/delete, external-send/template submission, public access, credential changes, broad multi-item rewrites, or risky configuration tools until the user clearly approves the visual blueprint.
   - For non-destructive add/update/configuration tasks with validated config and no unresolved risk, execute directly. Do not ask the user to approve a plan whose risk section says none/low.
   - Approval must be requested with real selectable options through `propose_interaction`/`assistantActions`; never write approval options only as Markdown text. Include at least `confirm_plan` (Aprobar y ejecutar) and `revise_plan` options.
   - Valid approval includes "apruebo", "continua", "crealo", "ejecuta el plan", or an equivalent direct approval.
5. Execute:
   - Prefer `bt_ai_agents_create_simple` for a single main agent when no custom workspace graph is required.
   - Use `bt_ai_agents_create_from_blueprint` only when `bt_ai_agent_blueprint_plan.executionPayload` is complete and approved.
   - Create the main AI Agent.
   - Add subagents with `bt_ai_agents_add_item` using `itemType: "agent"`.
   - Add inputs with `bt_ai_agents_add_item` using `itemType: "input"` and a validated `initialConfig`.
   - Add outputs with `bt_ai_agents_add_item` using `itemType: "output"` and a validated `initialConfig`.
   - Add tools to subagents with `bt_ai_agents_add_item` using `itemType: "tool"`, `agentTargetId`, and a validated `initialConfig`.
   - Use `bt_ai_agents_update_agent_config` for prompt/role/model updates so `equippedTools` are preserved.
   - For agent-wide settings, follow Agent Configuration below, including conversation protection, incoming message grouping, and proactive follow-up. Read the full workspace before changing settings through `bt_ai_agents_update`; preserve all unrelated configuration.
   - Use `bt_ai_agents_list_items` before removing or reconfiguring existing items.
   - Use `bt_ai_agents_remove_item` only after explicit confirmation.
   - Use `bt_action_instances_update_config` only to repair or update an existing action instance after validation.
6. Verify:
   - Read back the agent with `bt_ai_agents_get`.
   - After creating or updating proactive behavior, verify the saved execution setting and every scheduler/event/channel item involved.
   - Check action instances with `bt_action_instances_get_details` when available.

## Blueprint Format

Always present plans with these sections:

- Objetivo del modulo AI Agents
- Contexto de app recibido
- Agente principal y subagentes
- Herramientas por agente
- Configuracion requerida
- Blueprint visual
- Matriz de configuracion de items
- Inputs y outputs por agente
- Riesgos
- Plan de ejecucion

## Visual Blueprint Gate

Before broad, risky, or multi-component AI Agent work, show:

- A Mermaid diagram with the data flow: user/channel -> input -> main agent -> subagents -> tools -> outputs.
- A component table listing modules, Base de datos models (Data Hub service), agents, subagents, inputs, outputs, tools, and dashboards/ops modules referenced by App Builder.
- A configuration matrix for every item to be added.
- When proactivity is relevant, a proactivity row with objective, trigger, required context, delay/cadence, maximum attempts, stop conditions, timezone, channel/audience, tools, escalation, and human control.
- Pending parameters and risks.

If the change is simple, validated, non-destructive, and affects an existing agent, skip the visual blueprint and execute directly. If the user has not approved a required visual blueprint after seeing it, stop. Do not create the AI Agent, add/remove items, configure action instances, or update existing agents.

For each tool, include:

- Para que sirve.
- Worker/action usado.
- Parametros requeridos.
- Como se configurara.
- Riesgos.
- Que input recibe el agente.
- Que output produce.

For each input/output/tool item, include:

- `itemType`.
- `workerRegistryId`.
- `actionKey`.
- `agentTargetId` when `itemType: "tool"`.
- `initialConfig` safe summary, never secrets.
- Source of every configured value: user decision, created resource ID, app context, default, or pending.
- Result of `bt_ai_agent_validate_item_config`.

## Dynamic Discovery Rules

- Do not assume the full list of modules, workers, actions, or schemas.
- Treat `bt_ai_agent_tools_discover` as the source of truth for available agent tools.
- Treat skill discovery and tool/node discovery as separate layers. `list_solution_skills` can choose the right specialist, but only `bt_ai_agent_tools_discover`, `bt_mcp_find_tools`, and schema/config tools can prove whether a concrete agent tool or node exists.
- Discovery is hybrid: results may be exact, semantic, or both. Treat `matchType: "semantic"`, `matchedBy: "semantic"`, `matchedBy: "keyword+semantic"`, and `semanticScore` as signals that the tool may satisfy the user's intent even when the literal name does not match.
- For any user request like "can the agent do X?", first run `bt_ai_agent_tools_discover` with `search` equal to X in natural language. Do not answer "no" only because you do not know a tool name or because a literal search term is absent.
- Do not ask the user whether to explore available tools. A capability question already authorizes read-only discovery; ask only for missing app/resource/configuration details after discovery finds a plausible candidate.
- If semantic discovery returns a plausible candidate, inspect its config schema with `bt_ai_agent_tool_get_config_schema` before deciding whether it can be equipped.
- If no exact result appears but semantic candidates exist, evaluate those candidates and explain the user-facing capability in product language. Only say a capability is unavailable after discovery returns no usable exact or semantic candidate for the agent scope.
- Treat `bt_ai_agent_tool_get_config_schema` as the source of truth for configuration fields.
- Treat `bt_ai_agent_prepare_item_config` as the source of truth for draft `initialConfig`.
- Treat `bt_ai_agent_validate_item_config` as the required gate before `bt_ai_agents_add_item`.
- If a new BotTasker module or worker appears later, use the discovery results instead of local knowledge.
- Respect `ignore_in: ["agent"]`: do not equip tools that discovery excludes.
- Never include API keys, credential values, tokens, cookies, or authorization headers in plans, configs, or messages.
- Do not choose app modules here. Module selection belongs to `bottasker-app-builder`.
- Do not design Base de datos (Data Hub) models here. Request `bottasker-data-architect` output as `dataContext`.
- Do not design dashboards, boards, forms, conversations, catalogs, files, or knowledge here. Request `bottasker-dashboard-architect` output for dashboard/control context, `bottasker-board-architect` output for board/source/widget/security context, `bottasker-forms-architect` output for form capture/submission/mapping context, `bottasker-knowledge-base-assistant` output for Knowledge Base context and agent knowledge tools, and `bottasker-ops-builder` output for other operational module context.

## Agent Design Rules

- Prefer one main coordinator agent plus focused subagents.
- Use subagents for separate responsibilities such as capture, validation, enrichment, execution, reporting, or escalation.
- Give each subagent clear inputs, outputs, and allowed tools.
- Add tools incrementally and configure them with the exact schema returned by MCP.
- Never add an input/output/tool with empty config when the schema has required fields.
- Inputs are inbound triggers such as an incoming WhatsApp, Telegram, WebChat, Instagram, or Messenger message. Configure credentials, automatic conversation registration, transcription, scheduler/timezone, filters, and human handoff options when present in schema. A channel Actions tool is never the inbound input.
- For WhatsApp, Telegram, and WebChat inputs, enabling automatic conversation registration also gives every subagent the contextual `manage_conversation_tags` runtime tool. The tool lists, creates/reuses, assigns, and removes labels only on the verified current conversation; it does not need to be added as a workspace item.
- When the business process uses labels for routing, qualification, urgency, lifecycle, or handoff, include explicit prompt guidance describing which label names to apply/remove and at what moment. Do not invent label IDs or colors; the runtime resolves names in the app-scoped catalog and assigns a default color to newly created labels.
- A conversational output is the standard response action for the same channel that received the message. Keep one Response per channel unless the approved design is explicitly receive-only. Every production message input of that channel must reference it. A channel Actions tool does not replace this response output.
- Agents may have multiple accounts and inputs. A shared Response takes credentials from the exact input that received the current message, while recipient context comes from that conversation. Validate every input-to-Response reference and keep credentials, recipient context, and conversation identity isolated by channel.
- For tools that write data, map every required parameter to either user input, model IDs created earlier, app context, or a fixed approved value.
- For Base de datos (Data Hub) MCP tools, configuring model access is mandatory: set least-privilege `globalPermissions` and non-empty `modelPermissions` for every selected model, explicitly deciding `read` (Leer), `create` (Crear), and `update` (Editar) per model. Do not grant `update` or `manage_schema` unless the approved plan requires it.
- For Base de datos (Data Hub) `date` fields, agents must output `YYYY-MM-DD` exactly, for example `2026-05-31`; convert natural language dates before tool calls.
- For Base de datos (Data Hub) `datetime` fields, agents must output ISO 8601, preferred `YYYY-MM-DDTHH:mm`, for example `2026-05-31T14:30`.
- For communication tools, confirm channel, audience, and message behavior before execution.
- Before creating a new agent, list existing agents in the target app and reuse an agent with the same purpose/name instead of creating duplicates. The MCP create tools are idempotent; if they return `idempotent:true` or `reusedExisting:true`, continue with that agent ID.
- Before adding subagents, inputs, outputs, or tools to an existing/reused agent, call `bt_ai_agents_list_items` and do not add an item that already exists with the same `itemType`, `workerRegistryId`, `actionKey`, and target agent.
- After adding or updating an item directly, verify with `bt_ai_agents_get` or `bt_ai_agents_list_items` and answer with a compact before/after summary.

## Agent Configuration

These settings belong to `workspaceConfig.executionSettings` on the main AI Agent workspace, not to a subagent's prompt, `config`, input credentials, or dynamic conversation tags. Load this guidance for creating, editing, duplicating, or otherwise manipulating agents. Explain choices in everyday language; show internal property names only when the user asks for technical details.

| Parameter (relative to executionSettings) | User-facing meaning and behavior |
| --- | --- |
| `proactiveFollowUp.enabled` | “Recordar si no responden”: allows reminders when the agent is waiting for the same person's answer. Defaults to false. This does not schedule a campaign; follow Proactivity Decision Rules below. |
| `queueIncomingMessages` | “Juntar mensajes seguidos”: when true, messages arriving while the agent is working are collected for the ongoing conversation instead of starting independent work for each arrival. Defaults to false; do not change it just because protection is enabled. |
| `conversationProtection.enabled` | “Protección de conversaciones”: enables automatic detection and message limits for all supported connected chat inputs. Defaults to false until activation is requested. Messages always arrive and remain visible; only the agent's automatic attention pauses. |
| `conversationProtection.mode` | `observe` = “Solo registrar”: record detected exchanges without pausing for detection. `protect` = “Pausar atención”: also pause when detection finds sufficient evidence. Message limits can pause in BOTH modes. |
| `conversationProtection.sensitivity` | `conservative` = “Más prudente”: needs more coinciding signals, reducing mistaken pauses. `balanced` = “Más sensible”: detects more cases, including repeated courtesy exchanges, but may pause a real person by mistake. Neither option can reliably identify every AI. |
| `conversationProtection.pauseMinutes` | Duration of an automatic pause, in whole minutes, from 5 to 10080. 1440 means one day. When it ends, only new messages can receive attention; messages received during the pause are not replayed. A still-reached message limit can cause another pause. |
| `conversationProtection.maxPerTenMinutes` | Maximum incoming messages admitted for attention per conversation in a rolling 10-minute window; integer 0–1000. 0 means unlimited. The next message beyond the limit pauses automatic attention. Counts admitted messages, not the number of generated replies. |
| `conversationProtection.maxPerDay` | Equivalent limit over a rolling 24-hour window; integer 0–10000. 0 means unlimited. Either limit may trigger a pause; they do not reset at midnight. |
| `conversationProtection.configured` | Internal first-activation marker. Write true when explicitly configuring protection; retain it on later edits and when disabling. Do not ask users to choose it. It prevents their saved settings, including explicit zero limits, being replaced by the first-activation preset. |

First activation requested by the user uses this preset unless they specify other values:

```json
{"enabled":true,"configured":true,"mode":"protect","sensitivity":"balanced","pauseMinutes":1440,"maxPerTenMinutes":3,"maxPerDay":15}
```

This preset is NOT an instruction to activate protection on all agents. An agent with no settings remains disabled. The legacy inactive baseline is `enabled:false`, `mode:"observe"`, `sensitivity:"conservative"`, `pauseMinutes:1440`, and both limits 0, without `configured:true`. On its first activation replace that untouched baseline with the preset. For partial or customized settings, fill missing values from the preset and preserve saved choices, including explicit 0. On reactivation of a previously configured agent retain all saved values. Never use a truthiness fallback that turns a saved 0 into 3 or 15.

Channels are identified automatically from incoming messages; do not add a `channels` selector or write the obsolete `conversationProtection.channels` field. Supported chat channels include Webchat, WhatsApp, Telegram, Messenger, Instagram, email (Gmail/Outlook), Slack, and Chatwoot. Voice and real-time calls are excluded, including voice modality and call transcripts. Scope is isolated by organization, app, channel, account and conversation; this is not a shared quota across all contacts or agents.

The detector uses rules over repeated exchanges and reply timing, without calling a classification model. One greeting, one bot disclosure, or a few fast messages are not proof that someone is an AI. Do not promise perfect detection or suggest testing by spending credits on live agent conversations without authorization.

Safe create/edit procedure:

1. Discover the current create schema; use `bt_ai_agents_create` with a validated full workspace if settings must be included at creation. `bt_ai_agents_create_simple` does not accept executionSettings: if used, read back the created/reused agent and update its full workspace separately.
2. Before editing, use `bt_ai_agents_get` with the correct `id` and `appId`. Merge only requested settings into the returned `workspaceConfig.executionSettings`, preserving other execution settings, `proactiveFollowUp` properties, inputs, agents/subagents, equippedTools, outputs, shared instructions and unknown workspace properties. Remove only obsolete protection `channels` when editing that section.
3. Send the complete merged `workspaceConfig` through `bt_ai_agents_update` using its discovered input schema. Do not send a partial workspace that deletes its graph. `bt_ai_agents_update_agent_config` edits a node's prompt/role/model, not these workspace settings.
4. Read back with `bt_ai_agents_get` and verify every requested value plus preservation of the existing graph and other settings. An unrelated prompt/tool edit must not reset or activate protection. Cloning an agent preserves these choices unless the user requests different settings.

Administration: in **Conversaciones → Atención del agente → Ignoradas por el agente**, users can find paused conversations; the robot icon before Enviar opens attention controls/history. Ignored state is the protected system attribute `agentAttention`, not a dynamic tag. Never try to pause or resume by adding/removing tags or by generic conversation CRUD. Discover an authorized attention-management tool if available; otherwise guide the user to these controls, without inventing a tool or writing protected fields. Manual reactivation clears the message quota and starts with future messages. Disabling protection stops new automatic detection and limits but does not reactivate existing pauses. Excluding a conversation from detection does not bypass message limits or lift an existing pause. Marking a false positive records feedback; it does not retrain a model, change rules, or reactivate attention by itself.

## Proactivity Decision Rules

Treat proactive follow-up and proactive operations as different capabilities. First identify the business signal that should start the action:

| Business signal | Mechanism | Example |
| --- | --- | --- |
| The agent asked a question and the same user did not answer | Native proactive follow-up | A silent lead after the agent asks for availability |
| A date, cron expression, or recurrence is reached | Agent scheduler or scheduled workflow | Appointment reminder or invoice due date |
| A record, status, or external event changes | Event-triggered workflow | Opportunity becomes stalled or payment becomes overdue |
| A campaign or audience must be contacted | Communication automation with explicit approval | Re-engagement campaign for inactive customers |

Use native proactive follow-up only when all of these are true:

- `workspaceConfig.executionSettings.proactiveFollowUp.enabled` is `true`.
- The active human-in-loop interruption expects a response from the same user in the current conversation. It is not a campaign mechanism and must not initiate unrelated outreach or contact someone without a preceding conversational interruption.
- For each interruption, the agent explicitly decides whether to schedule a follow-up. When enabled for that interruption, use an integer delay from 1 to 1440 minutes, 1 to 5 maximum attempts, an internal reason, and a future wake instruction.
- Each wake continues the same objective and sends a fresh, natural visible message through the available channel. Never copy, quote, or resend the previous visible message verbatim.
- Stop when the user responds, the active task or human turn changes, the conversation is no longer waiting for that response, another execution or pending human input takes precedence, the attempt limit is reached, or proactive follow-up is disabled.

For scheduled, event-driven, or campaign proactivity, coordinate with `bottasker-automation-engineer`. Discover the actual scheduler, event trigger, workflow, data, and channel actions before proposing them. Define the objective, trigger, eligibility condition, required context, delay/cadence, timezone, overlap behavior, attempt/rate limits, stop conditions, recipient/audience, outbound channel, tools and permissions, escalation, consent, and human approval. External sends, templates, campaigns, and broad audience contact remain approval-gated.

Do not propose proactivity merely because it is available. Prefer it only when it prevents a concrete loss, delay, missed obligation, or service failure and the result can be observed. If no safe trigger, recipient, stop condition, or delivery channel can be established, keep the solution reactive and report the missing dependency.

## Workspace Concepts

- Entrada (`itemType: input`): trigger or channel that starts the agent, such as inbound WhatsApp, WebChat, call, Telegram, scheduler, or webhook. Configure credentials, filters, transcription, conversation registration, and handoff behavior. An input does not store business data by itself; it receives events and passes normalized context to the agent.
- Agente/subagente (`itemType: agent`): reasoning worker inside the workspace. The main agent coordinates; subagents handle focused responsibilities such as capture, validation, document review, catalog support, scheduling, or escalation.
- Herramienta (`itemType: tool`): capability an agent or subagent can call while reasoning. Tools read/write data, call external channels, search knowledge, manage carts, create files, or perform operational actions. Tools must be attached to the intended `agentTargetId` and configured with validated `initialConfig`.
- Salida (`itemType: output`): delivery capabilities for customer messages or side effects, such as replying to WhatsApp/WebChat, sending a message, creating a call response, or notifying a human. Outputs should be configured with audience, channel, templates, and safety constraints.

## Tool Family Guide

- On current backends, Response always provides current-conversation text without a switch. Configure images, files, audio, video, locations, templates, buttons and other supported sends through the optional fields exposed on that output. Do not add a duplicate Actions node for those capabilities.
- Use the exact discovered worker/action and switches. Response has no account selector: at runtime it inherits the connection from the exact input that received the current message; recipient/session comes from that conversation. One Response can therefore serve several numbers or accounts of the same channel. The agent can call one or several enabled sending tools. `finish_task` and the final assistant text are internal; an image with a caption does not require another text message.
- Existing Response outputs also provide text; obsolete `response_tools_enabled` and `enable_send_message` values do not disable it. Existing Actions remain supported. If the Response schema does not expose optional rich-send fields, use the discovered legacy Actions tools for those additional capabilities. Keep Actions for separately authorized sends to other recipients and workflow operations.
- File, Knowledge, Base de datos, or storage tools can create, read, or store media and metadata, but delivery requires an enabled channel sending tool, supplied by Response or a legacy Actions node.
- Base de datos (DataHub): use as a tool for durable structured data: create/read/update records, validate fields, and maintain process state. Configure the Base de datos (Data Hub), global permissions, allowed models, field mappings, and a per-model permission matrix. For every model the agent can access, explicitly set Leer (`read`), Crear (`create`), and Editar (`update`) according to the approved process. Use least privilege: read/create for capture, update only when the approved process requires editing. Dates must be normalized before tool calls. Adding the tool is incomplete until the UI would show at least one enabled model instead of `0 habilitados`.
- Calendario: use as a tool/input/output when the agent schedules appointments, checks availability, creates events, updates meetings, or sends reminders. Configure calendar/resource, timezone, availability windows, required attendee fields, conflict behavior, and confirmation rules.
- Base de Conocimiento: use as a retrieval tool when the agent must answer from manuals, policies, FAQs, documents, or internal instructions. For this tool family, load or delegate to `bottasker-knowledge-base-assistant`. If an agent must use knowledge bases from the Base de Conocimiento module, it must have the `Base de conocimiento (knowledge)` tool equipped and validated; creating or uploading knowledge documents alone does not let the agent retrieve them. Configure the selected `knowledge_documents` value, retrieval limits when supported, citation/fallback behavior when supported, and fallback behavior when no source is found. Do not use it for transactional state; use Base de datos (DataHub) for records.
- Catálogo: use as a tool when the agent needs product/service knowledge: search products, inspect prices, variants, modifiers, availability, or present options. Configure catalog ID, visibility channels, currency, search behavior, and product fields needed by the conversation. Do not invent prices or availability.
- Carrito: use as a tool when the agent builds or updates a transaction: get/create active cart, add/remove items, apply customer data, set status, or prepare checkout. Configure catalog/cart scope, required checkout fields, currency, customer identity, and validation behavior. Always respect cart tool failures; do not confirm a sale if the cart rejects an item.
- Archivos: use as input/tool/output when the agent receives, reads, generates, stores, or shares documents/images/audio. If the agent must use files, documents, images, audio, or other assets that live in the BotTasker Files module, it must have the Archivos/Files tool equipped and validated; Base de datos (DataHub), Knowledge, or channel tools may reference file IDs or URLs, but they do not grant general access to browse/read/manage the Files module. Configure allowed file types, storage target, parsing/OCR/transcription behavior when available, size limits, and whether files become knowledge, evidence, or record attachments.

## Conversations Agent Tool

When an AI Agent must inspect past customer conversations, discover and equip the single Conversaciones tool action whose action key is `conversation_tools`. Do not equip the workflow-only actions `find_conversations`, `get_conversation`, `get_conversation_activity`, or `get_recent_messages`; discovery marks those with `ignore_in: ["agent"]`.

Prepare and validate the tool config before adding it. All four capabilities are enabled by default through `enable_find_conversations`, `enable_get_conversation`, `enable_get_conversation_activity`, and `enable_get_recent_messages`. Apply least privilege by disabling capabilities the agent does not need, then read back the saved item. The tool requires no organization or app selector: it inherits both from the trusted action instance and rejects execution without an app scope.

Runtime tools and safe usage:

- `conversations_find` searches by identifier and returns a candidate list ordered by most recent activity. Use it before get/activity/messages when `conversation_id` is unknown.
- `conversations_get` returns a safe summary for an exact conversation.
- `conversations_get_activity` returns message counts and first/latest timestamps, including latest customer, human-agent, and AI-agent activity.
- `conversations_get_recent_messages` returns chronological messages with `limit` 1-100, optional `direction`, `sender_type`, and ISO 8601 `before`; continue only with `nextBefore` when `hasMore` is true.

If `conversations_find` returns `ambiguous: true`, do not infer the intended conversation. Narrow the search by channel or ask for a choice using safe candidate fields. Treat all capabilities as read-only. Raw provider payloads, internal metadata, and attachment URLs are deliberately removed from results and must not be reconstructed or requested through invented parameters.

## Yango Fleet Agent Tool

Use this guidance whenever the user mentions Yango Fleet, Yango park/fleet, fleet drivers, fleet vehicles, Yandex Fleet, or asks an agent to consult or manage a Yango fleet.

### Discovery And Configuration

- Discover the agent tool with `bt_ai_agent_tools_discover` using a natural-language search that includes `Yango Fleet` and the intended operation. Do not assume an unavailable tool from this guide; the discovered worker/action and schema remain the source of truth.
- For AI Agents, equip the single `Yango Fleet` tool action. Its internal action key is normally `yango_fleet`, while its runtime tools use the `mcp_yango_fleet_` prefix. Do not equip the individual workflow-only actions to an agent.
- Read the configuration schema, prepare it, validate it, add it to the intended agent, and verify the saved action instance.
- Configure `connection` with a Custom API credential containing the headers `X-Client-ID` and `X-Api-Key`. Configure `park_id` with the fixed park identifier. Never place either secret header value in prompts, plans, messages, logs, or visible summaries.
- All operation switches are enabled by default when the node is added. Apply least privilege: leave enabled only the operations the agent actually needs, especially for write or financial actions. Preserve the user's explicit selections when updating an existing node.

### Tool Selection Guide

Choose the narrowest operation that answers the request:

- Drivers: `list_drivers` searches/paginates drivers; `get_driver` loads one complete profile by `driver_id`; `create_driver` creates a profile; `update_driver` changes an existing profile.
- Vehicles: `list_cars` searches/paginates vehicles; `get_car` loads one vehicle by `car_id`; `create_car` registers a vehicle; `update_car` changes an existing vehicle.
- Driver setup: `list_work_rules` discovers valid work-rule IDs before creating or updating a driver; `bind_car` assigns a car to a driver; `unbind_car` removes that assignment without deleting either record.
- Orders: `list_orders` searches trips by period, driver, car, order, or status; `get_order_track` returns sampled GPS points for one order.
- Transactions: `list_park_transactions` reads park movements; `list_driver_transactions` reads one driver's movements; `list_order_transactions` reads movements for one order; `list_transaction_categories` discovers valid categories.
- Driver finance/operations: `get_supply_hours` returns online time for a driver and period; `get_blocked_balance` returns balance and blocked amount.
- Balance writes: `create_transaction` creates a driver credit or charge; `get_transaction_status` verifies whether that asynchronous movement completed, is pending, or failed.

### Recommended Sequences

- Search then detail: call a list operation with a small limit, select the exact ID, then call the matching get operation only if full details are necessary.
- Create driver: search for duplicates by phone/license when possible, call `list_work_rules`, create the driver, then read it back. Bind a vehicle separately only when requested.
- Update driver or vehicle: obtain the current record first because Yango updates may require preserving existing values; change only what the user requested and verify afterward.
- Create balance movement: confirm the exact driver, amount, sign, currency context, and description; call `create_transaction`, then use the returned transaction `id` and `version` with `get_transaction_status` using bounded retries. The v3 create operation uses transaction `data.kind=other` internally and does not accept `categoria_id`.
- Order investigation: call `list_orders` with dates and the narrowest known filter; request `get_order_track` only for the selected order.

### Exact Parameter Contract

Use only parameters exposed by the discovered schema. Never rename them, translate enum values, substitute labels for IDs, or send fields from one operation to another.

- `list_drivers`: all inputs are optional: `texto`, `limite` (1-50, default 10), `offset` (default 0), `detalle`, `driver_id`, `estado_laboral`, `estado_actual`, and `orden`. `estado_laboral` is `working`, `not_working`, or `fired`; `estado_actual` is `offline`, `busy`, `free`, `in_order_free`, or `in_order_busy`.
- `get_driver`: requires `driver_id`; optional `detalle` is `resumen` or `completo`.
- `create_driver`: requires `nombre`, `apellido`, `telefono`, `fecha_nacimiento`, `licencia_numero`, `licencia_pais`, `licencia_emision`, `licencia_vencimiento`, `conduce_desde`, `regla_trabajo_id`, and `fecha_ingreso`. Optional fields include `segundo_nombre`, `email`, `direccion`, `limite_saldo`, `car_id`, and `comentario`.
- `update_driver`: requires `driver_id`; all change fields are optional. Load the profile first and preserve current values needed by Yango. `estado_laboral` is `working`, `not_working`, or `fired`.
- `list_cars`: all inputs are optional: `texto`, `limite` (1-50, default 10), `offset`, `detalle`, `car_id`, `estado`, `categoria`, and `es_alquiler`. Omitting `es_alquiler` means both; `false` is a real filter, not omission.
- `get_car`: requires `car_id`; optional `detalle` is `resumen` or `completo`.
- `create_car`: requires `marca`, `modelo`, `color`, `anio`, `transmision`, `placa`, `certificado_registro`, `indicativo`, and `estado`. Optional fields include `vin`, `categorias`, `comodidades`, `comentario`, `combustible`, `es_del_parque`, and `kilometraje`.
- `update_car`: requires `car_id`; other vehicle fields are changes. Load the current car first so required existing values are not accidentally removed.
- `list_work_rules`: takes no agent input; `park_id` comes from node configuration.
- `list_orders`: inputs are optional: `desde`, `hasta`, `detalle`, `order_id`, `driver_id`, `car_id`, `estado`, `limite` (1-50, default 10), and `cursor`. Use the exact cursor returned by the preceding page.
- `get_order_track`: requires `order_id`; optional `limite_puntos` is 1-200 (default 50) and `detalle`. In summary mode long tracks are sampled while preserving first and last points.
- `list_park_transactions`: optional `desde`, `hasta`, `detalle`, `categoria_id`, `limite` (1-100, default 20), and `cursor`. `categoria_id` filters existing movements only.
- `list_driver_transactions`: requires `driver_id`; optional `desde`, `hasta`, `detalle`, `limite` (1-100, default 20), and `cursor`.
- `list_order_transactions`: requires `order_id`; optional `desde`, `hasta`, `detalle`, and local result `limite` (1-200, default 50). This endpoint has no official cursor.
- `list_transaction_categories`: optional booleans `solo_habilitadas` and `solo_creables`. Use it to inspect/filter existing transaction categories; do not pass its IDs to the v3 `create_transaction` operation.
- `get_supply_hours`: requires `driver_id`, `desde`, and `hasta`.
- `get_blocked_balance`: requires `driver_id`.
- `bind_car` and `unbind_car`: each requires exact `driver_id` and `car_id` values.
- `create_transaction`: requires `driver_id`, `importe`, and `descripcion`. `importe` is a non-zero decimal string with up to 4 decimal places: positive credits, negative debits; no currency symbol or thousands separator. `descripcion` is 1-256 characters. Do not send `categoria_id`; the node supplies `version: 1` and `data.kind: other` for a new v3 movement.
- `get_transaction_status`: requires the same `driver_id`, the transaction `transaccion_id` returned as `id`, and integer `version` returned by creation. Do not substitute `event_id` for `transaccion_id`.

Global formats:

- `driver_id`, `car_id`, `order_id`, `regla_trabajo_id`, and `categoria_id` are opaque IDs. Copy them exactly from tool results.
- Driver dates use `YYYY-MM-DD` exactly. `licencia_pais` is a three-letter lowercase country code such as `per`. `telefono` uses E.164, such as `+51999999999`.
- Period fields `desde` and `hasta` use ISO 8601 with a timezone, such as `2026-07-01T00:00:00-05:00`; `hasta` must not precede `desde`.
- Vehicle `transmision` is `mechanical`, `automatic`, `robotic`, or `variator`; `combustible` is `petrol`, `methane`, `propane`, or `electricity`; statuses and category/amenity codes must remain untranslated.

### Limits And Token Economy

- Prefer flat Spanish parameters exposed by the tool. Do not construct raw nested Yango request bodies.
- Use `detalle: "resumen"` by default. Use `detalle: "completo"` only when the user needs fields absent from the compact result.
- Start list calls with `limite` between 3 and 10. Increase only when needed. Continue with `siguiente_offset`/`offset` or `cursor_siguiente`/`cursor` instead of requesting an unbounded result.
- Always add date filters for orders or transactions when the user provides or implies a period. If no period is known and the query could be broad, ask for the smallest useful range.
- For order tracks, start with `limite_puntos` of 25 or 50; the tool preserves the beginning and end while sampling long routes.
- Summarize results for the user instead of repeating raw JSON. State pagination when more results exist and ask whether to continue only when additional pages are useful.

### Safety And Error Handling

- Treat `create_driver`, `update_driver`, `create_car`, `update_car`, `bind_car`, and `unbind_car` as external writes. Ensure the target and requested change are unambiguous; do not repeat a write automatically after an uncertain timeout.
- Treat `create_transaction` as financially sensitive. Require explicit user intent for the exact driver, amount, positive/negative sign, and reason before execution. Never infer a missing sign or silently convert a charge into a credit.
- Do not claim success from the request alone. Read back created/updated records where available, and always verify balance movements with `get_transaction_status`.
- If a tool returns `success: false`, report the concise message, preserve non-secret context, and correct inputs only when the error is actionable. Never expose credentials or raw authorization headers.
- IDs are authoritative. Do not use a visible driver name, license plate, order label, short order number, category label, or event ID where an exact ID is required.

## Base de datos (DataHub) Agent Tools

AI Agents use Base de datos (DataHub) MCP actions discovered through `bt_ai_agent_tools_discover`, primarily `data_hub` and, only for approved admin work, `data_hub_schema_admin`. Do not equip workflow-only nodes such as `data_hub_create_record`, `data_hub_update_record`, or other actions with `ignore_in: ["agent"]`; those belong to workflow automations.

For every planned Base de datos (DataHub) agent tool:

- Call `bt_ai_agent_tool_get_config_schema` for the exact discovered worker/action.
- Call `bt_ai_agent_prepare_item_config` and `bt_ai_agent_validate_item_config` before `bt_ai_agents_add_item`.
- When calling `bt_ai_agents_add_item`, include the same context used for preparation when it helps: `intent`, `selectedResources`, `dataContext`, and `moduleContext`. For Base de datos this lets the MCP complete or repair `dataHub`, `globalPermissions`, and `modelPermissions` instead of saving an incomplete tool.
- Configure `dataHub`, `globalPermissions`, `modelPermissions`, `includeSensitiveFields`, `restrictRecordsByContext`, and `maxDefaultRows` when those schema fields are present.
- When the desired tool is `data_hub`, pass `selectedResources.dataHubId` plus `selectedResources.modelIds` or `selectedResources.models` whenever the app context has them. If all models in the Hub are approved, pass only `dataHubId` and let `bt_ai_agent_prepare_item_config` generate `modelPermissions` from the Hub.
- Never call `bt_ai_agents_add_item` for `data_hub` when `bt_ai_agent_prepare_item_config.readyToAdd` is false or when `initialConfig.modelPermissions` is missing, empty, has no enabled model, or leaves a selected model without explicit `read`, `create`, and `update` decisions. A Base de datos tool with `0 habilitados` or unchecked model permissions is not configured.
- If the Base de datos tool already exists on the agent but its action instance has empty or incomplete `modelPermissions`, repair it with `bt_action_instances_update_config` using a prepared and validated config before reporting success.
- Treat the DataHub permission matrix as an execution gate. For each model, record whether the agent may:
  - Leer (`read`): needed for lookup, duplicate checks, validation, relations, summaries, and context-aware updates.
  - Crear (`create`): needed when the agent can create new records in that model.
  - Editar (`update`): needed only when the agent can modify existing records; do not enable it for pure intake/capture unless correction or lifecycle updates are approved.
- Use least privilege: grant `read`, `create`, and `update` only for the models and fields the agent actually needs. If a model is selected but none of Leer/Crear/Editar is justified, remove that model from `modelPermissions` instead of leaving it enabled without useful access.
- Grant `manage_schema` only through `data_hub_schema_admin` and only when the approved plan explicitly requires model, field, or relation administration.
- Verification must include a read-back with `bt_ai_agents_get`, `bt_ai_agents_list_items`, or `bt_action_instances_get_details`; summarize the enabled model count and per-model permissions instead of only saying the tool was added.

Runtime guidance for agent prompts and tool plans:

- Prefer model-specific tools when generated, such as `mcp_data_hub_create_<modelo>_record` and `mcp_data_hub_update_<modelo>_record`, before generic tools like `mcp_data_hub_create_record` or `mcp_data_hub_update_record`.
- Search before create when stable identifiers exist, such as email, phone, document, sourceRefs, or unique fields, to avoid duplicates.
- Use `records[].id` or `record.id` for references and relations; never use visible names or titles as foreign keys.
- Use search/get before update when the agent does not already have the correct `recordId`.
- Keep sensitive fields hidden unless the approved plan and permissions explicitly require them.

## Conversational Channel Contract

Use this current mapping as a design aid, but only create entries returned by `bt_ai_agent_tools_discover`; discovered `workerRegistryId`, `actionKey`, schemas, and `ignore_in` constraints are authoritative.

| Channel | Required inbound input | Standard response output | Legacy/operational Actions |
| --- | --- | --- | --- |
| WhatsApp | `on_message_whatsapp` | `whatsapp_response` | `whatsapp` |
| Telegram | `on_message_telegram` | `telegram_response` | `telegram` |
| WebChat | `on_webchat_message` | `webchat_response` | `webchatactions` |
| Instagram | `on_message_instagram` | `instagram_response` | `instagram` |
| Messenger | `on_message_messenger` | `messenger_response` | `messenger` |

### Human Response Timing

Current Response outputs for WhatsApp, Telegram, WebChat, Instagram, and Messenger may expose an optional human response simulation. This setting belongs to the Response action instance, not to `workspaceConfig.executionSettings`, an agent prompt, an input, or a channel Actions tool.

- Treat the discovered Response schema as authoritative. Configure this feature only when the schema exposes `simulate_human_response_delay` and `human_response_max_delay_seconds`; do not invent these fields on an older backend.
- `simulate_human_response_delay` maps to “Simular tiempo de respuesta humano”. It defaults to `false`; enable it only when the user explicitly asks for human-like response timing or approves it as part of the agent design.
- `human_response_max_delay_seconds` maps to “Tiempo máximo de respuesta (segundos)”. Use the discovered validation limits; the current supported range is 3–45 seconds and the default cap is 30 seconds. If the user asks to enable simulation without choosing a cap, keep the schema default instead of asking an unnecessary question.
- The runtime calculates each delay from customer-visible text or captions, adds small timing variation, applies a short minimum for media-only responses, and never exceeds the configured cap. Describe it as a fast human typing simulation, not as an exact promise of delivery time.
- Typing indicators are best effort and provider-dependent. Do not claim that every client will render them, and do not add or expose an internal typing tool to the agent workspace.
- A newer incoming message can cancel an obsolete delayed response; the active execution recalculates timing from its own outgoing content. Do not implement this behavior with workflow waits, prompt instructions, schedulers, or duplicated Actions nodes.
- When updating an existing Response, read its current action-instance config first, merge only these requested fields, preserve credentials and all unrelated send-capability flags, validate the resulting config, update it through `bt_action_instances_update_config`, and verify it with `bt_action_instances_get_details` or an agent workspace read-back.
- Configure the setting separately on each channel Response that should use it. A Response shared by multiple inputs/accounts of the same channel shares this timing configuration while continuing to inherit credentials from the input that received the message.

For each conversational channel:

1. Add the incoming-message action as an `input`, then read back the workspace. Current backends create one Response for the first input and reuse it for additional accounts of that channel; do not add another output.
2. Discover the Response schema. Text is already enabled by the presence of Response and has no switch. Configure only the additional sending capabilities and human response timing requested by the user, then verify the saved action instance.
3. On older backends, add the missing same-channel Response and equip Actions for capabilities that output cannot expose. Preserve existing configurations without a requested migration.
4. Verify that every input references the shared channel Response, that each input retains its own connection, and that capabilities and scope are correct. Do not report a channel complete when an input lacks a usable matching output, unless the user requested receive-only operation.

An agent may expose several channel contracts at once. Do not reuse one channel's response output for another channel, and do not assume that credentials or conversation identifiers are interchangeable.

When the production channel is WhatsApp, Telegram, Instagram, or Messenger, offer WebChat as an optional testing channel before execution: ask whether the user wants to add WebChat input plus WebChat response to test the same agent without using the production channel. Do not add it automatically, do not replace the production contract, and configure rich-message capabilities on WebChat Response when supported. Use WebChat Actions only for a legacy backend that requires it.

BotTasker's browser test channel is **WebChat**. If the user says **WeChat**, interpret it as WebChat only when the surrounding context clearly refers to BotTasker's browser chat; otherwise verify the intended external channel and its discovered support instead of silently renaming it.

Message and call contracts are separate. WhatsApp or WebChat call inputs/outputs may be added only when discovery confirms call support and the approved solution actually requires voice calls.

## Expected MCP Tools

Core discovery and planning:

- `bt_context_get_profile`
- `bt_ai_agent_tools_discover`
- `bt_ai_agent_tool_get_config_schema`
- `bt_ai_agent_prepare_item_config`
- `bt_ai_agent_validate_item_config`
- `bt_ai_agent_blueprint_plan`
- `bt_mcp_list_skills`
- `bt_mcp_load_skill`

Execution tools:

- `bt_ai_agents_create`
- `bt_ai_agents_update`
- `bt_ai_agents_add_item`
- `bt_ai_agents_get`
- `bt_action_instances_update_config`
- `bt_action_instances_get_details`
