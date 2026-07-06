---
name: bottasker-app-builder
description: Use when the user wants to design, create, or update complete BotTasker apps by choosing and combining available modules for a business solution.
---

# BotTasker App Builder

Use this skill as the app-level solution architect. It owns the complete app blueprint: what the app should do, which BotTasker modules are needed, how modules combine, which module specialists must be delegated to, and the execution order.

Module specialists do not own the full app design. They implement their module inside the app after App Builder decides that module is needed.

## Workflow

1. Call `bt_context_get_profile`.
2. Call `bt_apps_list_modules` to discover allowed modules.
3. When creating a complete app from natural language, call `bt_apps_blueprint_plan`.
4. Convert approved blueprints into executable stages with `bt_apps_implementation_plan`.
5. If AI Agents may be needed, call `bt_ai_agent_tools_discover` only as supporting discovery, not as the owner of the app plan.
6. Call `bt_apps_list` to avoid duplicate apps.
7. For an existing app, resolve `appId` with `bt_apps_list` or `bt_apps_get`.
8. Present the app blueprint as a visual design and ask for approval before writes.
9. Run `bt_apps_run_implementation_plan` with `dryRun: true` before any real execution.
10. Create or update the app with `bt_apps_create`, `bt_apps_update`, `bt_apps_update_menu`, or approved staged tools from the implementation plan.
11. Delegate module implementation to specialists after app creation:
   - `bottasker-data-architect` for Base de datos (Data Hub), models, relations, records, and Dynamic Tables.
   - `bottasker-catalog-architect` for catalogs, categories, products, variants, modifiers, availability, and sales carts.
   - `bottasker-dashboard-architect` for useful dashboards, KPIs, tracking, control views, widget strategy, and area-specific dashboard sets.
   - `bottasker-board-architect` for boards, sources, columns, cards, detail views, widgets, button automations, public/restricted access, roles, and security.
   - `bottasker-forms-architect` for public/private forms, fields, submissions, connector mappings, publishing, and confirmation screens.
   - `bottasker-ai-agent-architect` for AI Agents, subagents, tools, inputs, outputs, and tool configuration.
   - `bottasker-knowledge-base-assistant` for Knowledge Base documents, semantic retrieval, ingestion state, and Knowledge Base tools attached to agents.
   - `bottasker-automation-engineer` for workflow graphs, action instances, edges, and tests.
   - `bottasker-ops-builder` for calendar, files, conversations, calls, and WhatsApp templates.
12. If building from a reusable design, use `bt_apps_create_from_template`.
13. If packaging an existing app as a starter, use `bt_apps_export_template`.

## App Blueprint Responsibilities

App Builder must explain:

- What the app is meant to solve.
- Which modules are recommended and why.
- How modules will work together.
- Which modules are optional or risky.
- Which module specialist handles each part.
- What questions must be answered before execution.
- The exact execution order after approval.

## Visual Approval Gate

Before any write tool, App Builder must show a graphical blueprint:

- Mermaid diagram of the whole app: user/channel, modules, Base de datos (Data Hub) models, agents/subagents, tools, outputs, dashboards, conversations, and integrations.
- Component table for modules, data structures, agents, inputs, outputs, tools, and operational views.
- Data flow from input to storage/action to output.
- Configuration matrix for AI Agent items delegated to `bottasker-ai-agent-architect`.
- Pending decisions and risks.

Keep this blueprint user-facing: do not include MCP tool names, action keys, worker keys, payload/schema labels, IDs, `Data Hub`, or `bt_*`/`mcp_*` identifiers. Describe product outcomes and business objects instead.

Do not create apps, modules, Base de datos workspaces (Data Hub service), agents, workflows, dashboards, or channel configs until the user approves this visual blueprint explicitly.

Use known module capabilities from `bt_apps_list_modules`:

- Base de datos (Data Hub): durable models, fields, relations, records, and structured app data.
- Dynamic Tables: simpler table-style operational records.
- AI Agents: agent workspaces, subagents, tools, and autonomous behavior inside the app.
- Workflows: deterministic automation graphs, edges, tests, and runs.
- Dashboards: tracking, metrics, visual summaries, and operational reporting.
- Boards: operational views, kanban-like surfaces, and process tracking.
- Forms: public/private intake, structured capture, submissions, Base de datos (Data Hub) or Dynamic Table mappings, workflow triggers, and confirmation screens.
- Catalogs/Products/Sales Carts: commerce, product selection, cart state, and checkout support.
- Calendar: calendars, resources, availability, events, and appointments.
- Files: documents, uploads, downloads, and file storage.
- Knowledge Base: knowledge documents, URL/text/file ingestion, semantic retrieval, and agent knowledge tools.
- Conversations/Messages/Calls: inbox, customer communication, assignments, tags, calls, transcripts, and channel state.
- API Tools/App Env Vars/Credentials: external integrations and runtime configuration, only when policies allow them.

## App Design Defaults

- Prefer the smallest module set that satisfies the solution.
- Use module keys from `bt_apps_list_modules`; do not invent module keys.
- Keep menu groups consistent with enabled modules.
- Design module handoffs before writing.
- Do not let a module specialist create unrelated app-level resources.
- If the user asks for "crear una app", App Builder remains in control until the app blueprint is approved.
- When AI Agents are included, pass complete `dataContext` and `moduleContext` to `bottasker-ai-agent-architect`: appId, Base de datos (Data Hub) IDs, model IDs, fields, enums, relations, intended permissions, channels, dashboards, and conversation behavior.
- When Catalogs/Sales Carts are included, pass complete catalog context to `bottasker-catalog-architect`: currency, categories, product types, variants, modifier groups, availability rules, channel visibility, and checkout requirements.
- When Dashboards are included, pass complete reporting context to `bottasker-dashboard-architect`: appId, audience, decisions to support, Base de datos (Data Hub) models/tables, date fields, KPI candidates, status/category/owner dimensions, channels, agents/workflows, and required control loops.
- When Boards are included, pass complete board context to `bottasker-board-architect`: appId, source module, source ids, group/status field, title/description/display fields, intended columns, detail view needs, button automations, public/restricted access needs, and security constraints.
- When Forms are included, pass complete form context to `bottasker-forms-architect`: appId, audience, purpose, public/private access, destination connector, Base de datos (Data Hub)/model/table/workflow ids, required target fields, intended mappings, confirmation behavior, and publication risk.

## Safety Rules

- Do not pass `organization`.
- Do not overwrite menu groups without first reading the current app.
- Do not call write tools until the visual app blueprint is approved.
- Ask for confirmation before destructive changes, large menu rewrites, archive/remove/delete operations, or credential-backed integrations.

## Expected MCP Tools

Use `bt_context_get_profile`, `bt_apps_list_modules`, `bt_apps_blueprint_plan`, `bt_apps_list`, `bt_apps_get`, `bt_apps_create`, `bt_apps_update`, `bt_apps_update_menu`, `bt_apps_create_from_template`, and `bt_apps_export_template`.

Use `bt_ai_agent_tools_discover` only when the app blueprint needs to know whether AI Agent tools exist. Detailed agent design belongs to `bottasker-ai-agent-architect`.

For end-to-end builds, use `bt_apps_implementation_plan` and `bt_apps_run_implementation_plan` first in dry-run mode. For WhatsApp commerce demos, use `bt_apps_seed_demo_data`, `bt_whatsapp_templates_create_pack`, and `bt_roles_create_from_template` only after the app/module blueprint is approved.
