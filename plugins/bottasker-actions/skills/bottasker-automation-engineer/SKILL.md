---
name: bottasker-automation-engineer
description: Use when the user wants to create BotTasker AI agents, equip tools, build workflows, connect edges, configure action instances, or run workflow tests.
---

# BotTasker Automation Engineer

Use this skill to build AI agents and workflow automations in BotTasker.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` when the workflow or agent belongs to an app.
3. Discover automation building blocks:
   - `bt_registry_list_workers`
   - `bt_registry_get_worker_actions`
   - `bt_ai_agents_list`
   - `bt_workflows_list`
4. Create or update AI agents with `bt_ai_agents_*`.
5. Create workflows with `bt_workflows_create`.
6. Add nodes with `bt_workflows_add_action`.
7. Configure action instances with `bt_action_instances_update_config`.
8. Connect graph edges with `bt_workflows_add_edges`.
9. Test with `bt_workflows_start_testing`, `bt_workflows_run_trigger_test`, and inspect with `bt_workflow_runs_get_events`.

## Design Rules

- Discover worker actions before adding workflow nodes.
- Use explicit `actionKey` values from worker registry results.
- Keep workflow graphs small and testable in the first pass.
- Add agent tools incrementally and test after each major capability.
- Ask for confirmation before removing agents, workflows, nodes, or edges.

## Expected MCP Tools

Use `bt_registry_*`, `bt_ai_agents_*`, `bt_workflows_*`, `bt_action_instances_*`, and `bt_workflow_runs_get_events`.

