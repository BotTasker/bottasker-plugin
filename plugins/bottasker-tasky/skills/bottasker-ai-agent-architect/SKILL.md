---
name: bottasker-ai-agent-architect
description: "Use when the user wants Codex to design or create AI Agents inside an existing or approved BotTasker app: agents, subagents, dynamic tools, tool configuration, inputs, and outputs."
---

# BotTasker AI Agent Architect

Use this skill only as the specialist for the BotTasker `ai-agents` module. It does not own complete app design, module selection, Base de datos (Data Hub) modeling, dashboards, conversations, or workflows unless App Builder has delegated that part of an approved app blueprint.

If the user asks to create a complete app, route to `bottasker-app-builder` first. Return here only after App Builder has selected AI Agents as a required module and has provided the app context.

## Mandatory Flow

1. Discover context:
   - Call `bt_context_get_profile`.
   - Call `bt_ai_agent_tools_discover`.
   - Call `bt_mcp_list_skills` and load relevant dynamic skills with `bt_mcp_load_skill`.
2. Resolve `appId`:
   - If the user names an existing app, call `bt_apps_list` and choose the exact app.
   - If multiple apps match, ask the user which one to use.
   - If this is a new app, stop and ask App Builder to create or approve the app first.
3. Decide whether this is simple or plan-worthy:
   - If the user asks for a narrow, existing-agent change (for example, add one already existing Knowledge Base/document/tool, update the agent prompt, or attach one validated input/output/tool), do not build a visual blueprint. For Knowledge Base/document/tool work, load or delegate to `bottasker-knowledge-base-assistant`; for form design or form-linked agent behavior, load or delegate to `bottasker-forms-architect`; inspect current items, prepare/validate the config, execute the non-destructive write, verify, and summarize.
   - Use `bt_ai_agent_blueprint_plan` only for new agent systems, multi-component changes, unclear architecture, external communication setup, credential-sensitive tools, broad rewrites, or changes with real risks/pending decisions.
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
   - Use `bt_ai_agents_list_items` before removing or reconfiguring existing items.
   - Use `bt_ai_agents_remove_item` only after explicit confirmation.
   - Use `bt_action_instances_update_config` only to repair or update an existing action instance after validation.
6. Verify:
   - Read back the agent with `bt_ai_agents_get`.
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
- Inputs are triggers/channels such as Telegram or WhatsApp; configure credentials, auto conversation registration, transcription, scheduler/timezone, filters, and human handoff options when present in schema.
- Outputs are external responses or delivery actions; confirm channel, recipient/audience, message/template behavior, and communication risk.
- For tools that write data, map every required parameter to either user input, model IDs created earlier, app context, or a fixed approved value.
- For Base de datos (Data Hub) MCP tools, configure least-privilege `globalPermissions` and non-empty `modelPermissions` per model. Do not grant `update` or `manage_schema` unless the approved plan requires it.
- For Base de datos (Data Hub) `date` fields, agents must output `YYYY-MM-DD` exactly, for example `2026-05-31`; convert natural language dates before tool calls.
- For Base de datos (Data Hub) `datetime` fields, agents must output ISO 8601, preferred `YYYY-MM-DDTHH:mm`, for example `2026-05-31T14:30`.
- For communication tools, confirm channel, audience, and message behavior before execution.
- Before creating a new agent, list existing agents in the target app and reuse an agent with the same purpose/name instead of creating duplicates. The MCP create tools are idempotent; if they return `idempotent:true` or `reusedExisting:true`, continue with that agent ID.
- Before adding subagents, inputs, outputs, or tools to an existing/reused agent, call `bt_ai_agents_list_items` and do not add an item that already exists with the same `itemType`, `workerRegistryId`, `actionKey`, and target agent.
- After adding or updating an item directly, verify with `bt_ai_agents_get` or `bt_ai_agents_list_items` and answer with a compact before/after summary.

## Workspace Concepts

- Entrada (`itemType: input`): trigger or channel that starts the agent, such as inbound WhatsApp, WebChat, call, Telegram, scheduler, or webhook. Configure credentials, filters, transcription, conversation registration, and handoff behavior. An input does not store business data by itself; it receives events and passes normalized context to the agent.
- Agente/subagente (`itemType: agent`): reasoning worker inside the workspace. The main agent coordinates; subagents handle focused responsibilities such as capture, validation, document review, catalog support, scheduling, or escalation.
- Herramienta (`itemType: tool`): capability an agent or subagent can call while reasoning. Tools read/write data, call external channels, search knowledge, manage carts, create files, or perform operational actions. Tools must be attached to the intended `agentTargetId` and configured with validated `initialConfig`.
- Salida (`itemType: output`): delivery channel for final responses or side effects, such as replying to WhatsApp/WebChat, sending a message, creating a call response, or notifying a human. Outputs should be configured with audience, channel, templates, and safety constraints.

## Tool Family Guide

- WhatsApp Actions: use as inputs for inbound WhatsApp messages/calls and as outputs/tools for replies, templates, notifications, or WhatsApp actions. Configure the WhatsApp account/credential, phone number, templates when needed, conversation registration, human handoff, media handling, and risk controls. Use when the agent must receive or respond through WhatsApp, not just store WhatsApp data.
- Telegram Actions: use as inputs for inbound Telegram messages and as outputs/tools for Telegram replies, notifications, or Telegram actions. Configure the Telegram bot/credential, chat targeting, conversation registration, media handling, and risk controls. Use when the agent must receive or respond through Telegram.
- To send images, documents, audio, or other media through WhatsApp, Telegram, or any channel, the agent must have that channel's Actions worker equipped with the specific media/document send tool enabled and validated. File/knowledge/storage tools can create, read, or store media, but they do not deliver it unless the matching channel action tool is attached as an output or tool.
- Base de datos (DataHub): use as a tool for durable structured data: create/read/update records, validate fields, and maintain process state. Configure the Base de datos (Data Hub), model permissions, global permissions, allowed models, and field mappings. Use least privilege: read/create for capture, update only when the approved process requires editing. Dates must be normalized before tool calls.
- Calendario: use as a tool/input/output when the agent schedules appointments, checks availability, creates events, updates meetings, or sends reminders. Configure calendar/resource, timezone, availability windows, required attendee fields, conflict behavior, and confirmation rules.
- Base de Conocimiento: use as a retrieval tool when the agent must answer from manuals, policies, FAQs, documents, or internal instructions. For this tool family, load or delegate to `bottasker-knowledge-base-assistant`. If an agent must use knowledge bases from the Base de Conocimiento module, it must have the `Base de conocimiento (knowledge)` tool equipped and validated; creating or uploading knowledge documents alone does not let the agent retrieve them. Configure the selected `knowledge_documents` value, retrieval limits when supported, citation/fallback behavior when supported, and fallback behavior when no source is found. Do not use it for transactional state; use Base de datos (DataHub) for records.
- Catálogo: use as a tool when the agent needs product/service knowledge: search products, inspect prices, variants, modifiers, availability, or present options. Configure catalog ID, visibility channels, currency, search behavior, and product fields needed by the conversation. Do not invent prices or availability.
- Carrito: use as a tool when the agent builds or updates a transaction: get/create active cart, add/remove items, apply customer data, set status, or prepare checkout. Configure catalog/cart scope, required checkout fields, currency, customer identity, and validation behavior. Always respect cart tool failures; do not confirm a sale if the cart rejects an item.
- Archivos: use as input/tool/output when the agent receives, reads, generates, stores, or shares documents/images/audio. If the agent must use files, documents, images, audio, or other assets that live in the BotTasker Files module, it must have the Archivos/Files tool equipped and validated; Base de datos (DataHub), Knowledge, or channel tools may reference file IDs or URLs, but they do not grant general access to browse/read/manage the Files module. Configure allowed file types, storage target, parsing/OCR/transcription behavior when available, size limits, and whether files become knowledge, evidence, or record attachments.

## Base de datos (DataHub) Agent Tools

AI Agents use Base de datos (DataHub) MCP actions discovered through `bt_ai_agent_tools_discover`, primarily `data_hub` and, only for approved admin work, `data_hub_schema_admin`. Do not equip workflow-only nodes such as `data_hub_create_record`, `data_hub_update_record`, or other actions with `ignore_in: ["agent"]`; those belong to workflow automations.

For every planned Base de datos (DataHub) agent tool:

- Call `bt_ai_agent_tool_get_config_schema` for the exact discovered worker/action.
- Call `bt_ai_agent_prepare_item_config` and `bt_ai_agent_validate_item_config` before `bt_ai_agents_add_item`.
- Configure `dataHub`, `globalPermissions`, `modelPermissions`, `includeSensitiveFields`, `restrictRecordsByContext`, and `maxDefaultRows` when those schema fields are present.
- When the desired tool is `data_hub`, pass `selectedResources.dataHubId` plus `selectedResources.modelIds` or `selectedResources.models` whenever the app context has them. If all models in the Hub are approved, pass only `dataHubId` and let `bt_ai_agent_prepare_item_config` generate `modelPermissions` from the Hub.
- Never call `bt_ai_agents_add_item` for `data_hub` when `bt_ai_agent_prepare_item_config.readyToAdd` is false or when `initialConfig.modelPermissions` is missing, empty, or has no enabled model.
- Use least privilege: grant `read`, `create`, and `update` only for the models and fields the agent actually needs.
- Grant `manage_schema` only through `data_hub_schema_admin` and only when the approved plan explicitly requires model, field, or relation administration.

Runtime guidance for agent prompts and tool plans:

- Prefer model-specific tools when generated, such as `mcp_data_hub_create_<modelo>_record` and `mcp_data_hub_update_<modelo>_record`, before generic tools like `mcp_data_hub_create_record` or `mcp_data_hub_update_record`.
- Search before create when stable identifiers exist, such as email, phone, document, sourceRefs, or unique fields, to avoid duplicates.
- Use `records[].id` or `record.id` for references and relations; never use visible names or titles as foreign keys.
- Use search/get before update when the agent does not already have the correct `recordId`.
- Keep sensitive fields hidden unless the approved plan and permissions explicitly require them.

## Primary Inputs And Outputs

When designing agent inputs and outputs, always consider these primary channel families and only select the ones supported by discovered workers/actions:

- WhatsApp Mensaje: inbound WhatsApp text/media messages and outbound WhatsApp replies or messages.
- WhatsApp Llamadas: inbound WhatsApp calls and outbound voice/conversation behavior when the available workers/actions support calls.
- Telegram: inbound Telegram messages and outbound Telegram replies or messages.
- WebChat Mensaje: inbound messages from BotTasker WebChat and outbound WebChat responses.
- WebChat Llamadas: inbound or active WebChat voice/call sessions and outbound voice/conversation behavior when the available workers/actions support calls.

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
- `bt_ai_agents_add_item`
- `bt_ai_agents_get`
- `bt_action_instances_update_config`
- `bt_action_instances_get_details`
