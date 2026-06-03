---
name: bottasker-router
description: Use as the main BotTasker workflow router when the user wants Codex to create, inspect, or operate BotTasker apps through the BotTasker MCP.
---

# BotTasker Router

Use this skill as the first stop for BotTasker work. It decides which narrower BotTasker skill should handle the request and establishes the active organization, app, modules, and MCP capability context.

## Required First Steps

1. Call `bt_context_get_profile`.
2. Call `bt_apps_list_modules`.
3. If the user asks to create a complete app or solution from natural language, route to `bottasker-app-builder` and call `bt_apps_blueprint_plan`.
4. If the user asks specifically for AI Agents inside an existing or already-approved app, route to `bottasker-ai-agent-architect` and call `bt_ai_agent_tools_discover`.
5. If the user asks for a module-specific operation, call `bt_mcp_list_skills` and load the relevant MCP skill with `bt_mcp_load_skill`.
6. If the user mentions an existing app but not an `appId`, call `bt_apps_list` and resolve the app by name. If multiple matches are plausible, ask for the target app.

## Plan-First Rule

For any request that can create or modify an app, data model, AI agent, workflow, dashboard, board, channel, credential-backed tool, or conversation behavior:

1. Discover capabilities first.
2. Build a clear plan: use `bt_apps_blueprint_plan` for complete apps and `bt_ai_agent_blueprint_plan` only for AI Agents inside an app.
3. Show a visual blueprint before writes: Mermaid diagram plus component/configuration tables.
4. Ask only relevant unresolved questions.
5. Wait for explicit user approval after the visual blueprint before calling write tools.

If there is no explicit approval after the visual blueprint, do not call create, update, add, configure, archive, remove, delete, or submit tools.

## Routing

- App creation, module enablement, menu structure, templates: use `bottasker-app-builder`.
- Complete app design from natural language, including module selection and specialist delegation: use `bottasker-app-builder`.
- Data Hub, models, fields, relations, records, Dynamic Tables: use `bottasker-data-architect`.
- Catalogs, product categories, products, variants, modifier groups, product properties, availability, and sales carts: use `bottasker-catalog-architect`.
- Dashboards, KPIs, tracking, control views, reporting, widget strategy, and area-specific dashboards: use `bottasker-dashboard-architect`.
- Boards, kanban/pipeline views, board sources, card detail views, board widgets, public/restricted sharing, roles, users, and button automations: use `bottasker-board-architect`.
- AI agents inside an app, subagents, tool discovery, and tool config: use `bottasker-ai-agent-architect`.
- Workflows, action instances, graph edges, and workflow tests: use `bottasker-automation-engineer`.
- Calendar, files, knowledge, conversations: use `bottasker-ops-builder`.

## Safety Rules

- Never send `organization` from user input. BotTasker MCP resolves organization from the API key.
- Use explicit `appId` for app-scoped work.
- List relevant existing resources before creating new ones.
- Ask for explicit confirmation before using remove, delete, archive, submit-for-approval, or broad update tools.
- Do not expose API keys, credential bodies, tokens, cookies, or authorization headers.

## Expected MCP Tools

Core tools include `bt_context_get_profile`, `bt_apps_list_modules`, `bt_apps_blueprint_plan`, `bt_apps_list`, `bt_apps_get`, `bt_ai_agent_tools_discover`, `bt_ai_agent_blueprint_plan`, `bt_mcp_list_skills`, and `bt_mcp_load_skill`.

For AI Agent item configuration also use `bt_ai_agent_prepare_item_config` and `bt_ai_agent_validate_item_config` before `bt_ai_agents_add_item`.
