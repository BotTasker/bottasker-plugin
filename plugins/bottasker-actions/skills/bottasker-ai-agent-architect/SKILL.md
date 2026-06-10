---
name: bottasker-ai-agent-architect
description: "Use when the user wants Codex to design or create AI Agents inside an existing or approved BotTasker app: agents, subagents, dynamic tools, tool configuration, inputs, and outputs."
---

# BotTasker AI Agent Architect

Use this skill only as the specialist for the BotTasker `ai-agents` module. It does not own complete app design, module selection, Data Hub modeling, dashboards, conversations, or workflows unless App Builder has delegated that part of an approved app blueprint.

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
3. Build a plan before writing:
   - Use `bt_ai_agent_blueprint_plan` for the AI Agents module plan only.
   - Use `bt_ai_agents_get_create_schema` and `bt_ai_agents_validate_create_payload` before `bt_ai_agents_create` unless using `bt_ai_agents_create_simple`.
   - Review discovered workers/actions and call `bt_ai_agent_tool_get_config_schema` for any tool that will be attached to an agent.
   - Call `bt_ai_agent_prepare_item_config` for every planned input, output, subagent tool, and agent item.
   - Call `bt_ai_agent_validate_item_config` for every prepared `initialConfig`.
   - Ask only important unresolved questions.
4. Ask for explicit approval:
   - First present a visual blueprint of all app/agent components using Mermaid plus tables.
   - Do not call create/update/add/remove/archive/configuration tools until the user clearly approves the visual blueprint.
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

Before writing, always show:

- A Mermaid diagram with the data flow: user/channel -> input -> main agent -> subagents -> tools -> outputs.
- A component table listing modules, Data Hubs/models, agents, subagents, inputs, outputs, tools, and dashboards/ops modules referenced by App Builder.
- A configuration matrix for every item to be added.
- Pending parameters and risks.

If the user has not approved this visual blueprint after seeing it, stop. Do not create the AI Agent, add items, configure action instances, or update existing agents.

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
- Do not design Data Hub models here. Request `bottasker-data-architect` output as `dataContext`.
- Do not design dashboards, boards, conversations, catalogs, files, or knowledge here. Request `bottasker-dashboard-architect` output for dashboard/control context, `bottasker-board-architect` output for board/source/widget/security context, and `bottasker-ops-builder` output for other operational module context.

## Agent Design Rules

- Prefer one main coordinator agent plus focused subagents.
- Use subagents for separate responsibilities such as capture, validation, enrichment, execution, reporting, or escalation.
- Give each subagent clear inputs, outputs, and allowed tools.
- Add tools incrementally and configure them with the exact schema returned by MCP.
- Never add an input/output/tool with empty config when the schema has required fields.
- Inputs are triggers/channels such as Telegram or WhatsApp; configure credentials, auto conversation registration, transcription, scheduler/timezone, filters, and human handoff options when present in schema.
- Outputs are external responses or delivery actions; confirm channel, recipient/audience, message/template behavior, and communication risk.
- For tools that write data, map every required parameter to either user input, model IDs created earlier, app context, or a fixed approved value.
- For Data Hub MCP tools, configure least-privilege `globalPermissions` and `modelPermissions` per model. Do not grant `update` or `manage_schema` unless the approved plan requires it.
- For Data Hub `date` fields, agents must output `YYYY-MM-DD` exactly, for example `2026-05-31`; convert natural language dates before tool calls.
- For Data Hub `datetime` fields, agents must output ISO 8601, preferred `YYYY-MM-DDTHH:mm`, for example `2026-05-31T14:30`.
- For communication tools, confirm channel, audience, and message behavior before execution.

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
