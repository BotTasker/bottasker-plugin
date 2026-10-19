---
name: bottasker-router
description: Use as the main BotTasker workflow router when the user wants Codex to create, inspect, or operate BotTasker apps through the BotTasker MCP.
---

# BotTasker Router

Use this skill as the first stop for BotTasker work. It decides which narrower BotTasker skill should handle the request and establishes the active organization, app, modules, and MCP capability context.

## Response language

Support Spanish, Brazilian Portuguese, and English. Follow the user's explicitly requested response language; otherwise use the language of their current request, retaining the established preference when a short or mixed-language message is ambiguous. Apply that language to plans, questions, confirmations, summaries, and explanations of errors, even when a tool returns text in another language. Use the requested language for generated content, which may differ from the conversation language; changing the conversation language does not authorize translating or updating existing records. Preserve tool names, payload keys, enum values, identifiers, existing resource names, and error codes exactly. When referring to a visible product control, keep its actual label when needed to help the user find it.

## Required First Steps

1. Call `bt_context_get_profile`.
2. Call `bt_apps_list_modules`.
3. Call `bt_mcp_find_tools` with the target `moduleKey`, `intent`, and expected `effect` before assuming a concrete tool exists.
4. If the user asks to create a complete app or solution from natural language, route to `bottasker-app-builder` and call `bt_apps_blueprint_plan`.
5. If the user asks specifically for AI Agents inside an existing or already-approved app, route to `bottasker-ai-agent-architect` and call `bt_ai_agent_tools_discover`.
6. If the user asks for a module-specific operation, call `bt_mcp_list_skills` and load the relevant MCP skill with `bt_mcp_load_skill`.
7. If the user mentions an existing app but not an `appId`, call `bt_apps_list` and resolve the app by name. If multiple matches are plausible, ask for the target app.
8. For sign-in, revoked access, missing scopes, or connection failures, use `bottasker-connection-guide`, preserve the exact error category, and retry the same configured environment after reauthentication. Never infer that local is offline from an OAuth error or invent a hosted plugin as a fallback.

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
- Clientes, CRM, prospects/leads, person/company records, contacts, interactions, tasks, segments, CSV imports and contextual client follow-up: use `bottasker-clients-architect`.
- Catalogs, product categories, products, variants, modifier groups, product properties, availability, and sales carts: use `bottasker-catalog-architect`.
- Dashboards, KPIs, tracking, control views, reporting, widget strategy, and area-specific dashboards: use `bottasker-dashboard-architect`.
- Boards, kanban/pipeline views, permanent source scopes such as “only records for this client”, column alerts, board sources, card detail views, widgets, public/restricted sharing, roles, users, and button automations: use `bottasker-board-architect`.
- Forms, public/private intake forms, submissions, form fields, connector mappings, and form publishing: use `bottasker-forms-architect`.
- AI agents inside an app, subagents, tool discovery, and tool config: use `bottasker-ai-agent-architect`.
- Workflows, action instances, graph edges, and workflow tests: use `bottasker-automation-engineer`.
- Business process discovery, visual process maps, assumptions, validation, and process documentation: use `bottasker-process-designer`.
- Knowledge Base, knowledge documents, semantic search, and attaching knowledge to agents: use `bottasker-knowledge-base-assistant`.
- WhatsApp Business templates, Meta categories, variables, media headers, buttons, authentication, drafts, and submission: use `bottasker-whatsapp-template-architect`.
- Calendar, files, conversations, conversation tags/labels, messages, and calls: use `bottasker-ops-builder`.
- OAuth connection, organization selection, permission elevation, reauthorization, and revocation: use `bottasker-connection-guide`.

## Safety Rules

- Never send `organization` from user input. BotTasker MCP resolves organization from the authenticated OAuth grant or explicitly configured legacy API key.
- Use explicit `appId` for app-scoped work.
- List relevant existing resources before creating new ones.
- Ask for explicit confirmation before using remove, delete, archive, submit-for-approval, or broad update tools.
- Do not expose API keys, credential bodies, tokens, cookies, or authorization headers.
- Never turn a failed or ambiguous tool result into feedback, progress, or a simulated success. Preserve the structured error, retry only after a concrete correction, and verify successful writes with a read-back when one is available.
- Do not silently fall back from OAuth to an API key. Legacy API-key authentication is used only when the client was explicitly configured for it.

## User-Facing Communication

- Keep tool names, action keys, worker keys, payload fields, service identifiers, IDs, and MCP names internal. Do not show names like `bt_*`, `mcp_*`, `data_hub`, `Data Hub`, `worker`, `payload`, or `schema` in user-facing plans, summaries, risks, questions, or button descriptions.
- Translate internal work into product language: "crear el tablero", "configurar la Base de datos", "agregar el dashboard", "preparar la vista", "verificar el resultado".
- In visible plans, describe the outcome and business object, not the tool that will execute it. For example, say "Crear un tablero kanban para Driver agrupado por etapa actual", not "Usar bt_boards_create_from_data_hub_model".
- If technical identifiers are necessary for execution, use them only inside MCP tool inputs or internal context, not in the message shown to the user.

## Stable product operations and dynamic resources

The public MCP catalog describes stable product operations, not tools generated from an organization's saved resources. Use the original reusable operations `bt_api_tools_test_endpoint`, `bt_workflows_run_trigger_test`, `bt_workflows_start_testing` and `bt_boards_invoke_detail_widget_action` when available. Set workflow activation through the existing `bt_workflows_update` contract. There is no separate tool for each saved resource or process edit. Select the authorized app, resource, trigger or endpoint by IDs returned from reads. Resource names, additions and edits never create tool names or require new discovery. Editor component schemas describe configuration data; they do not add callable MCP operations.

Listing a public operation is not permission to use it. Each call enforces the OAuth scope, BotTasker policy, organization and app access. Real executions and workflow activation/test-mode changes require explicit approval of their concrete effects before requesting `mcp:destructive`; preserve the initial read/write grant. Do not fall back to an internal executor or another API after an authorization failure.

## Expected MCP Tools

Core tools include `bt_context_get_profile`, `bt_apps_list_modules`, `bt_apps_blueprint_plan`, `bt_apps_list`, `bt_apps_get`, `bt_ai_agent_tools_discover`, `bt_ai_agent_blueprint_plan`, `bt_mcp_list_skills`, and `bt_mcp_load_skill`.

For AI Agent item configuration also use `bt_ai_agent_prepare_item_config` and `bt_ai_agent_validate_item_config` before `bt_ai_agents_add_item`.

Use `bt_mcp_find_tools` whenever discovery/listing looks inconsistent. If a module has write permissions but no matching MCP tool, report the `notExposedReason` instead of guessing payloads.

Read the selected resource with `includeExecution: true`: `bt_workflows_get` for workflow revisions and trigger data schemas, `bt_api_tools_get` for endpoint revisions and parameter schemas, or `bt_boards_get` for button revisions. Copy its `execution` revision into the stable operation's `definitionRevision` argument. Pass resource IDs and business data using that operation's declared fields. On `MCP_RESOURCE_CHANGED`, reread that resource and review its changed effects before retrying; do not invent a revision or request a new tool name.
