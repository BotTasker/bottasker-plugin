---
name: bottasker-dashboard-architect
description: Use when the user wants to design, create, improve, duplicate, or operate BotTasker dashboards for tracking, control, KPIs, operational monitoring, executive views, area-specific reporting, or data-backed decision making.
---

# BotTasker Dashboard Architect

Use this skill as the specialist for BotTasker dashboards. It owns dashboard strategy, useful KPI selection, source mapping, widget design, filters, layouts, area-specific views, and verification.

If the user asks to create a complete app, route to `bottasker-app-builder` first. Return here after App Builder selects dashboards as part of the approved app blueprint.

## Purpose

Dashboards must help the user follow up, control, and decide. Avoid vanity dashboards that only display data. Every dashboard should answer:

- What needs attention now?
- What changed over time?
- Who or what is responsible?
- Which action should the user take next?
- Which data source proves it?

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` with `bt_apps_list` or `bt_apps_get`.
3. Discover enabled modules and available data:
   - `bt_apps_list_modules`
   - `bt_data_hub_list_hubs`
   - `bt_data_hub_list_models`
   - `bt_data_hub_list_fields`
   - dashboard source/field discovery tools when available, for example `bt_dashboards_list_sources` or `bt_dashboards_list_available_fields`.
4. Read existing dashboards before writing:
   - `bt_dashboards_list`
   - `bt_dashboards_get` when modifying or duplicating.
5. Build a dashboard blueprint with purpose, audience, KPIs, source models, filters, widgets, layout, risks, and pending questions.
6. Show a visual blueprint and ask for approval before create/update/archive tools.
7. After approval, create/update dashboards, preview/run widgets where available, then verify with read tools.

## Visual Approval Gate

Before any write tool, show:

- Mermaid diagram: source data -> transformations/filters -> dashboard views -> decisions/actions.
- Dashboard catalog table: dashboard name, audience, purpose, refresh expectation, data sources, risks.
- Widget matrix: widget title, question answered, source model/table, metric, dimensions, filters, chart type, drill-down target.
- Area split when useful: executive, operations, sales, finance, support, agents/workflows, data quality, or custom areas.
- Pending decisions and assumptions.

Do not call create, update, duplicate, archive, remove, or broad configuration tools until the user explicitly approves the visual blueprint.

## Dashboard Types

Choose one or more dashboard types based on the app goal:

- Executive control: health summary, revenue/cost, pipeline, SLA, risks, exceptions, trend.
- Operational control: today queue, overdue items, stage counts, throughput, bottlenecks, owner workload.
- Financial control: income, expenses, margin, category breakdown, payment method, budget variance, cash timing.
- Sales and commerce: orders, carts, conversion, top products, stock risk, abandoned carts, channel performance.
- Customer support: conversations by status, response time, resolution time, tags, assigned agents, unresolved issues.
- AI Agents and automation: runs, success/failure rate, tool errors, pending human review, cost/consumption, workflow latency.
- Data quality: missing required fields, invalid statuses, duplicates, stale records, records created by source.
- Area-specific views: separate dashboards for departments or roles when each area needs different decisions.

## KPI Design Rules

- Start from decisions, not chart types.
- Prefer actionable KPIs with threshold, owner, time window, and next action.
- Include both leading and lagging indicators when possible.
- Always include filters for the dimensions users will use to investigate: date range, owner, status, category, channel, location, agent, source, or customer segment.
- Add drill-down paths when a summary number needs investigation.
- Include exception widgets: overdue, failed, blocked, missing data, high amount, low stock, unanswered, unassigned.
- Use comparative widgets when control matters: current period vs previous period, target vs actual, category share, stage conversion.
- Keep each dashboard focused. Create multiple dashboards when one screen would mix audiences or decisions.

## Widget Selection

Use widgets according to the question:

- KPI card: single health number with target, delta, and status.
- Time series: trend over days/weeks/months.
- Bar chart: compare categories, owners, channels, products, or statuses.
- Donut/pie only for small share breakdowns with few categories.
- Table: investigation queue, exceptions, recent records, high-value items, failed runs.
- Funnel: stage conversion or sales/process steps.
- Heatmap/calendar: workload, appointments, demand by time, recurring activity.
- Map/location only when location changes the decision.

Avoid chart clutter. If the user needs control, prioritize KPI cards, exception tables, and drillable trend widgets.

## Source Mapping

Use the app's real source of truth:

- Data Hub models for durable structured data.
- Dynamic Tables for simpler operational tables.
- Catalogs/products/sales carts for commerce metrics.
- Conversations/messages/calls for communication metrics.
- AI Agents/workflows/runs for automation metrics.
- Calendar/appointments for availability and scheduling metrics.

Before proposing a widget, identify:

- source module and source id;
- model/table/entity;
- metric field and aggregation;
- date field for time filters;
- required dimensions;
- required filters;
- whether data quality is sufficient.

If the required source field does not exist, hand off to `bottasker-data-architect` before creating the dashboard.

## Multi-Dashboard Strategy

Create several dashboards when roles, decisions, or data cadence differ:

- "Resumen Ejecutivo" for owners/managers.
- "Control Operativo" for daily work and bottlenecks.
- "Finanzas" for money, budget, margin, and payment controls.
- "Ventas y Catálogo" for products, orders, carts, and inventory.
- "Atención y Conversaciones" for service queues and SLA.
- "Agentes y Automatización" for AI agent performance, tool errors, workflows, and human review.
- "Calidad de Datos" when agents or imports write records and data must be monitored.

Do not create multiple dashboards just to split charts. Split only when each dashboard has a different audience or control loop.

## Common Patterns

Expense app:

- Executive/finance dashboard: total expenses, monthly trend, category share, payment method, largest expenses, budget variance, missing category/date records.
- Operational dashboard: recent expenses, pending review, suspicious high amounts, expenses captured by channel/agent.

Sales/catalog app:

- Sales control: carts created, completed checkouts, abandoned carts, revenue, conversion by channel.
- Product control: top products, low stock, unavailable variants, products missing image/price/category.

Support app:

- Inbox control: open conversations, overdue responses, assigned workload, tags, channel distribution.
- Quality control: resolution time, reopened cases, unresolved high-priority issues.

AI automation app:

- Agent control: runs, success rate, tool validation errors, human handoff count, cost/consumption.
- Workflow control: failed nodes, latency, pending retries, volume by trigger.

## Operating Rules

- List existing dashboards before creating new ones.
- Use clear business names, not generic names like "Dashboard 1".
- Prefer read/preview/run tools before saving complex widget configs.
- If dashboard schemas expose available fields, use exact field keys and enum values.
- Ask before archive/delete/remove or replacing a dashboard layout.
- Do not expose credentials, tokens, API keys, raw secrets, or private message contents in dashboards.
- Keep dashboards app-scoped with `appId`.

## Expected MCP Tools

Use dashboard tools when available:

- `bt_dashboards_list`
- `bt_dashboards_get`
- `bt_dashboards_create`
- `bt_dashboards_update`
- `bt_dashboards_duplicate`
- `bt_dashboards_archive`
- `bt_dashboards_generate_from_data_hub`
- `bt_dashboards_preview_widget`
- `bt_dashboards_run_widget`
- `bt_dashboards_list_sources`
- `bt_dashboards_list_available_fields`

For app and source context use `bt_apps_list`, `bt_apps_get`, `bt_apps_list_modules`, `bt_data_hub_*`, `bt_dynamic_tables_*`, `bt_catalogs_*`, `bt_sales_carts_*`, `bt_conversations_*`, `bt_ai_agents_*`, and `bt_workflows_*` read tools as needed.
