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
- Avoid deleting models, fields, relations, or records without confirmation.

## Expected MCP Tools

Use `bt_data_hub_*`, `bt_dynamic_tables_*`, and `bt_dynamic_records_*` tools. For app discovery use `bt_apps_list` and `bt_apps_get`.

