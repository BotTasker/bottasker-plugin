---
name: bottasker-automation-engineer
description: Use when the user wants to create BotTasker AI agents, equip tools, build workflows, connect edges, configure action instances, or run workflow tests.
---

# BotTasker Automation Engineer

Use this skill to build AI agents and workflow automations in BotTasker.

For complex AI Agent systems with subagents, dynamically discovered tools, tool configuration schemas, or natural-language app blueprints, delegate planning to `bottasker-ai-agent-architect` first. Continue here when the approved plan needs workflow graphs, action instances, edges, or test runs.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` when the workflow or agent belongs to an app.
3. Discover automation building blocks:
   - `bt_ai_agent_tools_discover`
   - `bt_registry_list_workers`
   - `bt_registry_get_worker_actions`
   - `bt_ai_agents_list`
   - `bt_workflows_list`
4. Create or update AI agents with `bt_ai_agents_*`.
5. Before workflow creation, call `bt_workflows_get_create_schema` and `bt_workflows_validate_create_payload`.
6. Create workflows with explicit `bt_workflows_create` payload: `appId`, `name`, optional `timezone`, `folderPath`, `status`, and `workflowData: {nodes: [], edges: []}`.
7. Prefer `bt_workflows_create_from_template` for common patterns such as incoming message to order, voucher review, board change notification, or repurchase follow-up.
8. Add nodes with `bt_workflows_add_action`.
9. Configure action instances with `bt_action_instances_update_config`.
10. Connect graph edges with `bt_workflows_add_edges`.
11. Test with `bt_workflows_start_testing`, `bt_workflows_run_trigger_test`, and inspect with `bt_workflow_runs_get_events`.

## Design Rules

- Use `bottasker-ai-agent-architect` for agent/subagent/tool architecture before writing complex agent changes.
- Use `bottasker-forms-architect` when the workflow starts from a Forms submission or when a form must trigger a workflow.
- Discover worker actions before adding workflow nodes.
- Use explicit `actionKey` values from worker registry results.
- For AI Agent inputs, outputs, and tools, require prepared and validated `initialConfig` from `bt_ai_agent_prepare_item_config` and `bt_ai_agent_validate_item_config` before adding items.
- Keep workflow graphs small and testable in the first pass.
- Add agent tools incrementally and test after each major capability.
- Ask for confirmation before removing agents, workflows, nodes, or edges.

## Base de datos (DataHub) Workflow Nodes

For workflow automations, use the Base de datos (DataHub) `actionType: "work"` nodes returned by `bt_registry_get_worker_actions`. Do not use the MCP actions `data_hub` or `data_hub_schema_admin` in workflows; those are for AI Agents and schema/admin tool exposure.

Workflow Base de datos (DataHub) action keys:

- `on_data_hub_event`: trigger for `record.created`, `record.updated`, `record.deleted`, `record.status_changed`, `record.linked`, and `record.unlinked`.
- `data_hub_search_records`: find records in a model.
- `data_hub_get_record`: load one record by `recordId`.
- `data_hub_create_record`: create a record.
- `data_hub_update_record`: update an existing record.
- `data_hub_archive_record`: archive an existing record.
- `data_hub_delete_record`: delete an existing record.
- `data_hub_link_records`: create a relation between two records.
- `data_hub_unlink_records`: remove a relation between two records.
- `data_hub_list_record_links`: list record relations.

Configuration rules:

- Always configure `dataHub`.
- Configure `dataHubModel` for `search`, `create`, and `update` nodes when the schema requests it.
- Use `recordId` for `get`, `update`, `archive`, `delete`, and `list_record_links`.
- Use `relationId`, `fromRecordId`, and `toRecordId` for `link_records` and `unlink_records`.
- When schema fields use `data_hub_record_fields`, configure them with the visual field selector; do not ask the user for free-form JSON for `values` or `filters`.
- For `create`, required model fields are expected in `values`; optional fields can be added only when needed.
- For `update`, send only the fields to change.
- Use variables such as `{{1.record.id}}` or prior node outputs for dynamic IDs and values.

Safety rules:

- If the record ID is unknown, add `data_hub_search_records` and/or `data_hub_get_record` before `update`, `archive`, or `delete`.
- Prefer `data_hub_archive_record` over `data_hub_delete_record`; use delete only when the user explicitly approves destructive removal.
- For date and datetime fields, normalize values before writing: `YYYY-MM-DD` for `date`, preferred `YYYY-MM-DDTHH:mm` for `datetime`.

## Yango Fleet Workflow Nodes

When a workflow must interact with Yango Fleet:

- Discover `Yango Fleet` through `bt_registry_list_workers` and inspect its current actions with `bt_registry_get_worker_actions` before adding nodes.
- Use the individual workflow actions, normally `yango_fleet_list_drivers`, `yango_fleet_get_driver`, `yango_fleet_create_driver`, `yango_fleet_update_driver`, `yango_fleet_list_cars`, `yango_fleet_get_car`, `yango_fleet_create_car`, `yango_fleet_update_car`, `yango_fleet_list_work_rules`, `yango_fleet_list_orders`, `yango_fleet_get_order_track`, `yango_fleet_list_park_transactions`, `yango_fleet_list_driver_transactions`, `yango_fleet_list_order_transactions`, `yango_fleet_list_transaction_categories`, `yango_fleet_get_supply_hours`, `yango_fleet_get_blocked_balance`, `yango_fleet_bind_car`, `yango_fleet_unbind_car`, `yango_fleet_create_transaction`, and `yango_fleet_get_transaction_status`. The registry result is authoritative if names change.
- Configure every node with the validated Custom API credential and fixed `park_id`. Never expose `X-Client-ID` or `X-Api-Key` values in workflow labels, mappings, prompts, or summaries.
- Map the flat fields exposed by the action schema; do not build raw nested Yango API bodies. Use outputs from list/get nodes to supply exact driver, vehicle, order, category, and transaction IDs to later nodes.
- Keep list limits and date ranges small. Paginate deliberately and avoid loops without a maximum page/run count.
- Before update, load the current driver or vehicle when existing values must be preserved. For a v3 balance movement, map only `driver_id`, non-zero signed decimal `importe`, and `descripcion`; do not pass `categoria_id`. After creation, map the returned `id` and integer `version` into a bounded status-check path.
- Put financially sensitive movements and ambiguous fleet writes behind an explicit approval or review step. Make retries idempotent-aware and never blindly repeat a create or balance operation after a timeout.
- Test read-only nodes first, then each write path with a controlled record. Verify the final Yango state and inspect workflow events before enabling production traffic.

## Expected MCP Tools

Use `bt_ai_agent_tools_discover`, `bt_registry_*`, `bt_ai_agents_*`, `bt_workflows_*`, `bt_action_instances_*`, and `bt_workflow_runs_get_events`.

For workflows triggered by forms, provide the target workflow id and trigger action instance id back to `bottasker-forms-architect`, then let Forms configure the `workflow.trigger` connector and submission mapping.
