---
name: bottasker-data-architect
description: Use when the user wants to design Data Hubs, models, fields, relations, records, Dynamic Tables, or data-backed app structures in BotTasker.
---

# BotTasker Data Architect

Use this skill to build durable data structures for BotTasker apps.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` when the data belongs to an app.
3. Call `bt_mcp_list_skills` and `bt_mcp_load_skill` for `data-hub` when model design is complex.
4. Read current data structures first:
   - `bt_data_hub_list_hubs`
   - `bt_data_hub_list_models`
   - `bt_data_hub_list_fields`
   - `bt_data_hub_list_relations`
   - `bt_dynamic_tables_list`
5. Create or update the data layer incrementally:
   - hub
   - models/tables
   - fields
   - relations
   - seed records only when useful for verification.
6. For relation-heavy work, run `bt_data_hub_rebuild_relation_cache` after relation or record changes when appropriate.

## Modeling Rules

- Prefer stable, explicit field keys.
- Use relations instead of duplicated foreign data when records need to stay connected.
- Add required fields only when the user requirement is clear.
- For every Data Hub field with `type: "date"`, set or update `description` with the exact agent/API format: `YYYY-MM-DD`, example `2026-05-31`. Tell agents not to send natural language dates such as `31 de mayo de 2026`.
- For every Data Hub field with `type: "datetime"`, set or update `description` with ISO 8601 guidance: preferred `YYYY-MM-DDTHH:mm`, example `2026-05-31T14:30`; ISO with timezone is also acceptable.
- When an agent or workflow writes records, convert user text dates into the field format before calling `bt_data_hub_create_record` or `bt_data_hub_update_record`.
- For expense-like models, a field named `fecha` should usually be `type: "date"` and its description must include `YYYY-MM-DD`.
- Avoid deleting models, fields, relations, or records without confirmation.

## Handoff To AI Agent Architect

When Data Hub will be used by AI Agents, return a `dataContext` that includes:

- Data Hub id/name.
- Model ids/names.
- Field names, labels, types, required flags, enums/options, date/time formats, sensitive flags, and relation targets.
- Recommended least-privilege permissions per model: `read`, `create`, `update`, or `manage_schema`.
- Fields that should be hidden from agents.
- Which model each agent tool should read or write.

For a write-only capture agent, prefer `read/create` on target models and avoid `update` unless the approved app flow requires correction/editing.

## Expected MCP Tools

Use `bt_data_hub_*`, `bt_dynamic_tables_*`, and `bt_dynamic_records_*` tools. For app discovery use `bt_apps_list` and `bt_apps_get`.
