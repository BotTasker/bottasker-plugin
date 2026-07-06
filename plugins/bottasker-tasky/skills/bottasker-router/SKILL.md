---
name: bottasker-router
description: Use as the main BotTasker workflow router when the user wants Codex to create, inspect, or operate BotTasker apps through the BotTasker MCP.
---

# BotTasker Router

Use this skill as the first stop for BotTasker work. It decides which narrower BotTasker skill should handle the request and establishes the active organization, app, modules, and MCP capability context.

## Required First Steps

1. Call `bt_context_get_profile`.
2. Call `bt_apps_list_modules`.
3. Call `bt_mcp_find_tools` with the target `moduleKey`, `intent`, and expected `effect` before assuming a concrete tool exists.
4. If the user asks to create a complete app or solution from natural language, route to `bottasker-app-builder` and call `bt_apps_blueprint_plan`.
5. If the user asks specifically for AI Agents inside an existing or already-approved app, route to `bottasker-ai-agent-architect` and call `bt_ai_agent_tools_discover`.
6. If the user asks for a module-specific operation, call `bt_mcp_list_skills` and load the relevant MCP skill with `bt_mcp_load_skill`.
7. If the user mentions an existing app but not an `appId`, call `bt_apps_list` and resolve the app by name. If multiple matches are plausible, ask for the target app.

## Capability Discovery

- Use the user's natural-language intent as the discovery query. Do not rely only on literal names, visible labels, or memory of known tools.
- Capability discovery has two layers: first select/load the relevant BotTasker skill, then search real MCP tools, workers, actions, and automation nodes. A skill match alone is not proof that a concrete capability exists or does not exist.
- When calling `bt_mcp_find_tools`, pass a specific `intent` sentence that describes the desired capability and the expected `effect`.
- When working with AI Agents, call `bt_ai_agent_tools_discover` with `search` set to the user's capability intent, not only with empty filters.
- Treat semantic matches returned as `semanticTools`, `matchType: "semantic"`, `matchedBy`, or `semanticScore` as real candidates. Inspect the candidate with the relevant schema/configuration tools before saying the capability is unavailable.
- If keyword discovery and semantic discovery disagree, prefer the discovered candidate as a possibility and validate it. Only report that a capability is missing after discovery returns no usable exact or semantic candidate for the requested module/scope.
- Do not ask the user for permission to explore available capabilities. If the user asks whether Tasky can do something, run discovery directly and answer from verified skills + tools/nodes.

## Risk-Based Execution Rule

For simple, low-risk requests, do the work directly after discovery and validation. A request is simple when it targets an existing app/resource, has the required IDs or can resolve them from context, uses non-destructive write tools, has no unresolved human decision, and no external-send/public-access/credential/security impact.

Examples of simple requests: add an already validated Knowledge Base tool to an existing agent, create one field, add one record, update a label, attach an existing document/tool, or make an idempotent create/update where duplicate checks are available.

For simple low-risk requests:

1. Discover capabilities first.
2. Read current state to avoid duplicates.
3. Run the validated non-destructive `bt_*` tool directly.
4. Verify with a read-back when available.
5. Respond with a compact execution summary: what existed before, what changed, and current state.

Use a visual plan/blueprint only for complex, broad, ambiguous, or risky work:

1. Discover capabilities first.
2. Build a clear plan: use `bt_apps_blueprint_plan` for complete apps and `bt_ai_agent_blueprint_plan` only for AI Agents inside an app.
3. Show a visual blueprint before writes: Mermaid diagram plus component/configuration tables.
4. Ask only relevant unresolved questions.
5. Wait for explicit user approval after the visual blueprint before calling risky or broad write tools.

Explicit approval is required before remove, delete, archive, submit-for-approval, public sharing, credential changes, external-message/template submission, broad multi-resource rewrites, or any plan with non-empty risks that the user has not already accepted. If the validated risk is none/low and the operation is non-destructive, execute directly and summarize instead of asking for approval.

## Routing

- App creation, module enablement, menu structure, templates: use `bottasker-app-builder`.
- Complete app design from natural language, including module selection and specialist delegation: use `bottasker-app-builder`.
- Base de datos (Data Hub), models, fields, relations, records, Dynamic Tables: use `bottasker-data-architect`.
- Catalogs, product categories, products, variants, modifier groups, product properties, availability, and sales carts: use `bottasker-catalog-architect`.
- Dashboards, KPIs, tracking, control views, reporting, widget strategy, and area-specific dashboards: use `bottasker-dashboard-architect`.
- Boards, kanban/pipeline views, board sources, card detail views, board widgets, public/restricted sharing, roles, users, and button automations: use `bottasker-board-architect`.
- Forms, public/private intake forms, submissions, form fields, connector mappings, and form publishing: use `bottasker-forms-architect`.
- AI agents inside an app, subagents, tool discovery, and tool config: use `bottasker-ai-agent-architect`.
- Workflows, action instances, graph edges, and workflow tests: use `bottasker-automation-engineer`.
- Knowledge Base, knowledge documents, semantic search, and attaching knowledge to agents: use `bottasker-knowledge-base-assistant`.
- Calendar, files, conversations, messages, calls, and WhatsApp templates: use `bottasker-ops-builder`.

## Safety Rules

- Never send `organization` from user input. BotTasker MCP resolves organization from the API key.
- Use explicit `appId` for app-scoped work.
- List relevant existing resources before creating new ones.
- Ask for explicit confirmation before using remove, delete, archive, submit-for-approval, or broad update tools.
- Do not expose API keys, credential bodies, tokens, cookies, or authorization headers.

## User-Facing Communication

- Keep tool names, action keys, worker keys, payload fields, service identifiers, IDs, and MCP names internal. Do not show names like `bt_*`, `mcp_*`, `data_hub`, `Data Hub`, `worker`, `payload`, or `schema` in user-facing plans, summaries, risks, questions, or button descriptions.
- Translate internal work into product language: "crear el tablero", "configurar la Base de datos", "agregar el dashboard", "preparar la vista", "verificar el resultado".
- In visible plans, describe the outcome and business object, not the tool that will execute it. For example, say "Crear un tablero kanban para Driver agrupado por etapa actual", not "Usar bt_boards_create_from_data_hub_model".
- If technical identifiers are necessary for execution, use them only inside MCP tool inputs or internal context, not in the message shown to the user.

## Expected MCP Tools

Core tools include `bt_context_get_profile`, `bt_apps_list_modules`, `bt_apps_blueprint_plan`, `bt_apps_list`, `bt_apps_get`, `bt_ai_agent_tools_discover`, `bt_ai_agent_blueprint_plan`, `bt_mcp_list_skills`, and `bt_mcp_load_skill`.

For AI Agent item configuration also use `bt_ai_agent_prepare_item_config` and `bt_ai_agent_validate_item_config` before `bt_ai_agents_add_item`.

Use `bt_mcp_find_tools` whenever discovery/listing looks inconsistent. If a module has write permissions but no matching MCP tool, report the `notExposedReason` instead of guessing payloads.
