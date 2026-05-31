---
name: bottasker-ai-agent-architect
description: Use when the user wants Codex to design or create AI Agents inside an existing or approved BotTasker app: agents, subagents, dynamic tools, tool configuration, inputs, and outputs.
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
   - Review discovered workers/actions and call `bt_ai_agent_tool_get_config_schema` for any tool that will be attached to an agent.
   - Ask only important unresolved questions.
4. Ask for explicit approval:
   - Do not call create/update/add/remove/archive tools until the user clearly approves.
   - Valid approval includes "apruebo", "continua", "crealo", "ejecuta el plan", or an equivalent direct approval.
5. Execute:
   - Create the main AI Agent.
   - Add subagents with `bt_ai_agents_add_item` using `itemType: "agent"`.
   - Add tools to subagents with `bt_ai_agents_add_item` using `itemType: "tool"` and `agentTargetId`.
   - Configure each tool using `initialConfig` or `bt_action_instances_update_config`.
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
- Inputs y outputs por agente
- Riesgos
- Plan de ejecucion

For each tool, include:

- Para que sirve.
- Worker/action usado.
- Parametros requeridos.
- Como se configurara.
- Riesgos.
- Que input recibe el agente.
- Que output produce.

## Dynamic Discovery Rules

- Do not assume the full list of modules, workers, actions, or schemas.
- Treat `bt_ai_agent_tools_discover` as the source of truth for available agent tools.
- Treat `bt_ai_agent_tool_get_config_schema` as the source of truth for configuration fields.
- If a new BotTasker module or worker appears later, use the discovery results instead of local knowledge.
- Respect `ignore_in: ["agent"]`: do not equip tools that discovery excludes.
- Never include API keys, credential values, tokens, cookies, or authorization headers in plans, configs, or messages.
- Do not choose app modules here. Module selection belongs to `bottasker-app-builder`.
- Do not design Data Hub models here. Request `bottasker-data-architect` output as `dataContext`.
- Do not design dashboards, boards, conversations, catalogs, files, or knowledge here. Request `bottasker-ops-builder` output as module context.

## Agent Design Rules

- Prefer one main coordinator agent plus focused subagents.
- Use subagents for separate responsibilities such as capture, validation, enrichment, execution, reporting, or escalation.
- Give each subagent clear inputs, outputs, and allowed tools.
- Add tools incrementally and configure them with the exact schema returned by MCP.
- For tools that write data, map every required parameter to either user input, model IDs created earlier, app context, or a fixed approved value.
- For communication tools, confirm channel, audience, and message behavior before execution.

## Expected MCP Tools

Core discovery and planning:

- `bt_context_get_profile`
- `bt_ai_agent_tools_discover`
- `bt_ai_agent_tool_get_config_schema`
- `bt_ai_agent_blueprint_plan`
- `bt_mcp_list_skills`
- `bt_mcp_load_skill`

Execution tools:

- `bt_ai_agents_create`
- `bt_ai_agents_add_item`
- `bt_ai_agents_get`
- `bt_action_instances_update_config`
- `bt_action_instances_get_details`
