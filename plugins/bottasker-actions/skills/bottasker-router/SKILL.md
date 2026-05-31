---
name: bottasker-router
description: Use as the main BotTasker workflow router when the user wants Codex to create, inspect, or operate BotTasker apps through the BotTasker MCP.
---

# BotTasker Router

Use this skill as the first stop for BotTasker work. It decides which narrower BotTasker skill should handle the request and establishes the active organization, app, modules, and MCP capability context.

## Required First Steps

1. Call `bt_context_get_profile`.
2. Call `bt_apps_list_modules`.
3. If the user asks for a module-specific operation, call `bt_mcp_list_skills` and load the relevant MCP skill with `bt_mcp_load_skill`.
4. If the user mentions an existing app but not an `appId`, call `bt_apps_list` and resolve the app by name. If multiple matches are plausible, ask for the target app.

## Routing

- App creation, module enablement, menu structure, templates: use `bottasker-app-builder`.
- Data Hub, models, fields, relations, records, Dynamic Tables: use `bottasker-data-architect`.
- AI agents, worker registry, workflows, action instances, tests: use `bottasker-automation-engineer`.
- Dashboards, boards, catalogs, sales carts, calendar, files, knowledge, conversations: use `bottasker-ops-builder`.

## Safety Rules

- Never send `organization` from user input. BotTasker MCP resolves organization from the API key.
- Use explicit `appId` for app-scoped work.
- List relevant existing resources before creating new ones.
- Ask for explicit confirmation before using remove, delete, archive, submit-for-approval, or broad update tools.
- Do not expose API keys, credential bodies, tokens, cookies, or authorization headers.

## Expected MCP Tools

Core tools include `bt_context_get_profile`, `bt_apps_list_modules`, `bt_apps_list`, `bt_apps_get`, `bt_mcp_list_skills`, and `bt_mcp_load_skill`.

