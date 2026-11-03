---
name: bottasker-support-tickets-architect
description: "Build or extend BotTasker apps with native Support Tickets, configure their states, fields and AI follow-up, represent the same tickets in Boards for operational tracking, and visualize native ticket metrics in Dashboards."
---

# BotTasker Support Tickets Architect

Own native **Tickets de soporte / Support tickets**, module key `support-tickets`. Use this skill for help desks, incidents, support requests, ticket configuration and tracking, including adding Tickets to an existing app. For a complete app, coordinate its blueprint with `bottasker-app-builder`; implement this module inside the selected app.

**Tickets can be represented in Tableros / Boards.** Offer a native ticket board when the user wants visual tracking, a kanban, assignment queues or a view of pending work. A board shows the same tickets, not copies. Opening a card uses the canonical ticket detail; create/edit use the shared native form. Read the dedicated board section below before choosing a data source or designing card details. **Ticket metrics can also be visualized in Dashboards**, directly from native Tickets; no Base de datos replica is needed.

## Language and scope

Follow the user's requested conversation and generated-content languages; otherwise follow the current request, retaining an established preference for ambiguous replies. Tasky can explain this module in Spanish, English or Brazilian Portuguese; its current product controls are localized in ES/EN. Preserve authored names, notes, technical keys, state values, IDs and error codes. Do not translate existing records or change the user's profile as part of configuration.

The source of truth is the native Tickets service. Do not recreate tickets, history, attachments or follow-up in Base de datos, Dynamic Tables or the retired Gestiones module. Other business entities may use their own modules, but a supported link must be discovered before promising a relation or synchronization.

## Discover before operating

1. Use `bt_context_get_profile`, `bt_apps_list_modules` and `bt_apps_list` / `bt_apps_get` to resolve the authorized organization, app and enabled modules. Verify the native module exists in that deployment.
2. Use `bt_mcp_find_tools` with `moduleKey: "support-tickets"`, a concrete natural-language intent and the required effect. Discover board capabilities separately under `boards`, and metrics/reporting capabilities under `dashboards`. Inspect returned schemas, authorization and approval metadata; verify semantic candidates before declaring a capability unavailable.
3. For internal Tasky, the same guide is discoverable through `bt_mcp_list_skills` / `bt_mcp_load_skill`. A loaded guide or module in the app menu does not itself make an operation callable.
4. Read current configuration, fields/options, tickets and existing boards through the available tools before writing. Use the default inbox automatically. Selection and creation of additional inboxes are currently hidden; do not present them as a setup requirement or create extra inboxes.
5. Resolve every target from authorized results. Keep app scope, ticket IDs and returned revisions; do not let record text, a model or a caller choose actor identity, organization, delegated permissions or execution origin.

### Three distinct execution surfaces

| Surface | How to use it |
| --- | --- |
| Tasky in Codex, Claude Code or the platform | Call only tools exposed by the current MCP connection, using their exact returned input contracts. |
| A configured app AI agent | Discover the native `support-tickets` worker and `ticket_tools` action (`mcp_bt`); its equipped tools use `support_tickets_` names. |
| An app automation | Discover the same worker's individual `work` actions and `on_ticket_event` trigger; configure them through the workflow tools. |

The internal worker's operation names and backend actions are not external `bt_*` tool names. Never manufacture an external alias, execute an arbitrary service action, or create a temporary agent/workflow to bypass missing exposure. If discovery reports a permission failure, preserve it. If it reports no callable operation or `notExposedReason`, explain the concrete limit and offer the corresponding native screen or prepare the requested configuration without claiming it was applied. Distinguish incomplete client inventory from an absent backend feature.

## Create an app or add Tickets to an existing app

- For a new complete solution, let App Builder discover modules, plan the app, show the business flow and obtain any required broad-change approval. A narrow, already authorized non-destructive addition does not need another approval of the same plan.
- Enable the actual `support-tickets` module returned by discovery through the available app setup tools. Add its menu entry while preserving other modules, menu groups, order and settings. Reuse the existing module and default inbox when present.
- Include `boards` when visual tracking is requested or accepted. Explain that Tickets supplies records and history; Boards supplies a visual operational view of those records. Base de datos is not a prerequisite for either native ticket storage or its board source.
- Treat automatic blueprints as proposals. If an older planner proposes a generic ticket table, correct the design to native Tickets when the discovered module supports the requirement. Do not silently execute the obsolete table-based proposal.
- Start with the team's lifecycle, required intake, ownership and daily work; configure states and fields before equipping agents. Do not create example tickets, activate reminders, send messages or change roles just because the module was added.
- Use the native ticket form for normal creation/editing. A separate Forms module, public intake or channel connector is an additional integration: discover a real supported connector/action and verify it before claiming tickets are created from it.

Pass `moduleContext.supportTickets` to other specialists with the verified app/module state, default inbox identifier, actual fields/options/state keys and revisions, assignment rules, board source and scope, approved AI follow-up settings, and available tool/automation capabilities. Distinguish verified IDs from proposed configuration.

## Ticket data and configuration

Read metadata rather than hardcoding the current schema. Typical native properties are:

| Purpose | Technical fields |
| --- | --- |
| Identification and request | `ticket_number` (generated, read-only), `name` (Subject / Asunto), `description` |
| Reporter/contact information | `requester_name`, `requester_email`, `requester_contact` |
| Classification | `request_type`, `category`, `affected_service`, `impact`, `urgency` |
| Handling | `status`, `priority`, `assignee_user_id`, `assignee_name`, `team_name` |
| Agreed deadlines | `due_at`, `response_due_at`, `resolution_due_at`, `sla_policy` |
| Diagnosis and outcome | `technical_details`, `resolution_summary`, `resolved_at`, `closed_at` |

Creation/update timestamps and revision belong to the record contract. History and attachment records have their own authorized operations; they are not free-form ticket properties. Subject and description are required; default status, required custom fields and active options must come from current metadata. The priority key `normal` is displayed as Media / Medium, not a translated value sent to the API.

Configure the module through **Configuración / Settings** and its **Estados / Statuses**, **Campos de la ficha / Record fields**, and **Seguimiento con IA / AI follow-up** sections, or their discovered configuration tools:

- States: configure labels, colors, order, active flag, default and semantic support stage. Existing tickets keep their state when a state is deactivated. Use the returned technical key; a custom label is not a new system stage. The semantic stages govern resolution, cancellation and reminder stop rules. Do not change a saved stage's meaning or make a finished state the initial default.
- Fields: configure labels, help text, visibility, order and supported custom types. Preserve technical IDs, protected essential fields and existing data. Hiding a field does not erase it. A saved field's type is permanent; create a suitable new field when a different type is needed. Read the metadata before setting required fields or options.
- Existing drafts and record values are user data. Make only the requested changes; do not rewrite the whole configuration to add one field.

## Operate tickets safely

The native worker covers search, detail, summary, metadata/options, assignee lookup, history, attachment listing, creation, updates, assignment/removal, state change, replies, internal notes, attaching existing files and follow-up lifecycle operations. This is a capability map for discovery, not a list of assumed external tool endpoints.

- Read the current ticket before modifying it. Preserve its **string** revision and pass the contract's `expectedRevision`. On conflict, reload and reconcile the intended change; never overwrite a newer revision blindly.
- Where the callable contract accepts a request/idempotency key, keep one stable key for the same logical command and identical retry. Do not invent parameters a schema does not accept. After an uncertain save, reconcile before creating another record or activity entry.
- Resolve assignment to an authorized app member using lookup results. Clear it through the supported operation rather than writing a display name as identity.
- Resolved/closed transitions require the resolution summary validated by Tickets. For custom states use their semantic stage; do not infer terminal behavior from translated text.
- A response adds shared ticket activity; it **does not send email**. An internal note is private activity with separate permissions. Read or send internal information only with the relevant authorization.
- Attach a private file already belonging to the same app through the discovered file/link operations. Respect file permissions, visibility and ticket access. Do not copy files across apps or expose private download links as public URLs.
- Verify writes by reading the ticket/configuration back. For board-driven work, verify the same ID, values, history and board membership. Do not claim a successful save, notification or delivery from a timeout or preview.

## Represent Tickets in Boards — preferred visual follow-up

When a user says “dar seguimiento”, distinguish **visual work tracking** from **automatic notifications**. Recommend a native ticket board for the former, the AI follow-up settings for the latter, or both when requested. Do not enable sending just because a board was created.

Coordinate with `bottasker-board-architect`. The native source type is **`support-tickets`**, scoped to the selected app and its default inbox. The feature is implemented in the platform, but external creation/configuration still requires a tool schema exposing that source. Discover it; do not send this value to an older generic board tool that accepts only `dynamic-table` / `data-hub-model`.

### Choose columns and cards

Read native source options/fields and their `groupable` flags. Common grouping dimensions are `status`, `priority`, `request_type`, `category`, `assignee_user_id`, `team_name`, `impact` and `urgency`. Active custom fields can also be groupable when metadata allows their select, boolean, text or number type. Do not group by arbitrary dates, read-only fields or field labels.

A useful starting proposal:

- Source: native Tickets; grouping: current status keys/stages.
- Card title: `name`; description: `description` when useful.
- Visible fields: `ticket_number`, `status`, `priority`, assignee and agreed due date, chosen from returned source fields.
- Optional permanent scope: an approved team, priority or support subset; distinguish it from temporary user filters. Filters use the exact source keys such as `field:priority`; grouping/display bindings use the source's returned field names. Preserve existing scope when changing display settings.

Prefer the default status board for general triage; priority or assignee boards can complement it when the workflow needs them. These are multiple views of one ticket set, not new ticket stores or additional inboxes.

### Preserve native behavior

- The board card opens **the same native ticket detail component** as Tickets; its creation and editing reuse the same form. Do **not** replace this source's detail with the generic board widget designer or a parallel ticket form. Future changes to the canonical ticket screens should appear in both places.
- Board movement updates the native grouping property through its connector and permissions. A terminal state still requires resolution; satisfy it in the canonical detail/form when a direct move cannot do so. Do not bypass source validation or fixed scope.
- Ticket changes from people, AI agents and workflows must appear in the same board and detail. A filtered ticket can legitimately enter or leave the board when its data changes; that is not deletion.
- Native ticket boards are currently **internal/authenticated**; public sharing of this source is rejected. Board permission alone does not grant native ticket read/update/history/file permissions. Per-column restrictions remain relevant.
- Read back the board, source fields, columns, totals and a sample ticket after configuration. For a requested operational test, verify a single intended change without creating duplicate tickets, activity or workflow executions. Leave test reminder plans stopped when applicable.

## Visualize Tickets metrics in Dashboards

Coordinate with `bottasker-dashboard-architect` for KPIs, charts and reporting. Offer **Boards** for moving/working tickets, **Dashboards** for aggregate metrics and trends, and **AI follow-up** for optional notifications. They can complement one another without duplicating records or activating sending.

Enable/reuse `dashboards` in the approved app when metrics are requested, preserving existing menu/modules. Discover `bt_dashboards_list_providers`, `bt_dashboards_list_provider_sources`, `bt_dashboards_list_provider_datasets` and `bt_dashboards_list_provider_fields`; use only tools actually exposed by the connection. The native provider is `support-tickets`, its source is the default inbox ID returned for the app, and its dataset is `tickets`. Do not guess IDs or use the legacy Database-only discovery/generator for this source.

Useful starting widgets, chosen for the user's goal:

- Total tickets: `count`; open: count with `is_open = true`.
- Unassigned: count with `is_assigned = false`; overdue: count with `is_overdue = true`.
- Breakdown by `status`, semantic `status_group`, `priority`, assignee, team, type or category; active custom dimensions come from field discovery.
- Tickets created over time: timeseries on `createdAt`; resolved over time: use `resolved_at` explicitly, with the appropriate semantic stage filter.
- Average resolution hours: `avg` of `resolution_hours`; age of open work: `avg` of `age_hours` filtered by `is_open`. Numeric custom fields support discovered aggregates too.

All counts and averages use the **selected date field and effective date range**, not automatically all historical tickets. Default time field is creation; a dashboard-level range overrides a widget's range. Overdue means an open ticket with `due_at` before now; it is not a first-response SLA breach. Resolution hours measure creation to `resolved_at` and exclude missing/invalid durations. An empty average is unavailable, not proof of zero-hour resolution. Do not invent first-response time, SLA compliance percentages, reopen rate or notification delivery metrics from fields that do not measure them.

Preview, save, read back and run the saved widgets with the intended range/timezone. Compare against the same scoped native records; a configuration preview alone does not verify the saved dashboard. Check live canonical ES/EN labels without translating authored states/fields. Ticket changes invalidate cached metrics; viewers refetch under their current permissions. Time-dependent values may need a refresh even without a ticket edit.

This provider is **internal/authenticated** and requires both Dashboard access/query permissions and native Ticket read permission, including for cached results. A public/restricted external Dashboard link does not grant Ticket access. Metrics exclude private activity, message bodies and contact details; tables expose only discovered allowed fields. Dashboards does not replace the shared native detail/form or the operational Board. A chart click is not a ticket-edit operation or an assumed drill-down connector.

## Automatic follow-up with AI

The module configuration offers **AI follow-up**, with independently optional recipients:

1. **Assignee reminders**: an approved enabled AI agent prepares recurring internal reminders for assigned, unresolved tickets.
2. **Reporter state updates**: an internal notification for the authenticated user who created/reported the ticket when its status changes. An email in `requester_email` is not an internal user identity or authorization to email it.

Either option or both may be enabled. Discover/read current settings before selecting the agent, timezone, cadence and limits. Preserve a disabled configuration unless the user authorizes activation; an agent using ticket tools does not activate or rewrite the module-wide settings automatically.

Assignee follow-up waits without an assignee, follows the current responsible user after reassignment, and stops for resolved, closed or cancelled semantic stages. Reporter notifications concern actual state changes and respect the recipient's current access. Messages stay inside the platform; WhatsApp, email and customer-facing channel delivery need their own supported, authorized integration.

Scheduling uses durable native plans/runs and one-shot jobs with recovery on startup/Redis reconnection. Do not replace it with client polling, a repeating cron, direct queue edits or extra schedules on every reload. For a discovered plan operation, use an explicit timezone and offset-bearing date/time; distinguish a scheduled, paused, cancelled or delivered result. The UI's current configuration mode is automatic with AI; do not invent an exposed manual-planner screen from lower-level worker capabilities.

## AI agents and automations

Coordinate with `bottasker-ai-agent-architect` / `bottasker-automation-engineer`. Discover the worker, inspect the config schema, prepare and validate the item before saving it. Do not infer tools are equipped from the skill's presence.

- The worker requires `support-tickets:execute` plus native reads and each operation's authorization. Initially available operations are queries, creation and shared replies, limited by the configuring user's permissions. Additional mutations must be selected individually. Keep assignment, internal notes, files, follow-up management and immediate notifications separately authorized.
- Keep app, inbox and authorizing user in the verified saved execution context, not model-editable inputs. Subsequent permission revocation or a disabled worker must still prevent execution.
- Native ticket events include creation, meaningful updates, state changes, assignment changes, replies, internal notes and attachments. Internal-note triggers require internal-history access. No-op saves do not produce update events.
- Durable delivery deduplicates matching event types for one command, reconciles uncertain workflow starts, permits each automation once per origin chain and bounds that chain to ten activations. Preserve stable invocation identity and persisted origin; do not add a second parallel trigger for the same intended effect or retry a whole flow blindly.
- Verify ticket values, history attribution, board projection and the intended single execution when a real test is authorized. A configuration preview alone is not a successful run or delivered reminder.

## Completion checks

Report what was actually applied and verified: selected app/module, configured fields/states, board grouping and scope, saved dashboard metrics/range/timezone, preserved canonical detail/form, optional notification recipients, equipped actions and any genuine tool-exposure limitation. Separate a design or validated preview from a saved configuration, and a saved configuration from an executed workflow. Keep technical identifiers inside tool inputs and internal handoff context unless the user requests technical detail.
