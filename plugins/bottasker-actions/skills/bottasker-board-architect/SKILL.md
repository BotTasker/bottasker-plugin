---
name: bottasker-board-architect
description: Use when the user wants to design, create, configure, share, secure, or operate BotTasker boards, kanban/pipeline views, board data sources, item detail views, board widgets, public board links, restricted access, board roles, board users, or button widgets that invoke automations.
---

# BotTasker Board Architect

Use this skill as the specialist for the BotTasker `boards` module. It owns board source design, columns, card fields, detail views, widgets, button automations, public/restricted access, permissions, file fields, and operational safety.

If the user asks to create a complete app, route to `bottasker-app-builder` first. Return here after App Builder selects boards as part of the approved app blueprint.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` with `bt_apps_list` or `bt_apps_get`.
3. Read current boards before writing:
   - `bt_boards_list`
   - `bt_boards_get`
   - `bt_boards_get_board_data`
4. Discover the source before designing:
   - Data Hub: `bt_data_hub_list_hubs`, `bt_data_hub_list_models`, `bt_data_hub_list_fields`.
   - Dynamic Tables: `bt_dynamic_tables_list`, `bt_dynamic_tables_get`.
   - Existing board source: `bt_boards_get_source_fields`, `bt_boards_get_available_columns`.
5. Build a visual board blueprint and ask for approval before writes.
6. After approval, create or update board, display config, detail view, widgets, public/restricted access, and verification reads.

## Visual Approval Gate

Before any write tool, show:

- Mermaid diagram: source data -> board columns -> card fields -> detail view -> widgets/buttons -> automations/public access.
- Source mapping table: source type, source id, groupByField, titleField, descriptionField, displayFields, filters.
- Column and card table: column ids/labels, hidden columns, card title/description/visible fields, create form fields.
- Detail view table: widgets, layout intent, field bindings, button actions, automation trigger, response mode.
- Access/security table: public mode, roles, users, global permissions, column permissions, sensitive fields excluded.
- Pending decisions and risks.

Do not call create, update, move, delete, public link, role, user, file, or automation tools until the user explicitly approves the visual blueprint.

## Source Design

Prefer structured sources:

- `data-hub-model`: best for durable app entities, relationships, app records, and AI-written data.
- `dynamic-table`: best for simple table-backed operational tracking.
- `manual`: only for small standalone boards or legacy use; avoid for apps that need reporting or automation.

For source-backed boards:

- `groupByField` defines columns and must be groupable: select, multiselect, boolean, tags, or equivalent status/pipeline fields.
- `titleField` must be text-like and should identify the card quickly.
- `descriptionField` is optional but should summarize why the card matters.
- `displayFields` should be concise: owner, due date, priority, amount, customer, status, channel, or next action.
- `filters` should narrow the operational scope when one source feeds multiple boards.

If the source lacks a good status/group field, hand off to `bottasker-data-architect` before creating the board.

## Board Patterns

Choose the pattern based on the work:

- Pipeline: lead, deal, onboarding, ticket, task, case, order, request.
- Approval: submitted, reviewing, approved, rejected, completed.
- Dispatch: new, assigned, in progress, blocked, delivered.
- Support: open, waiting customer, escalated, resolved.
- Sales/cart: inquiry, quote, cart ready, paid, fulfilled.
- AI review: captured, needs validation, auto-processed, human review, done, failed.

Boards are for control and action. Do not create a board when a dashboard or table is the better surface.

## Display Config

Use `bt_boards_update_display_config` for:

- `titleField`
- `descriptionField`
- `displayFields`
- `hiddenColumns`
- `privateFormFields`
- `publicFormFields`

Rules:

- Keep cards scannable; avoid showing too many fields.
- Hide terminal or internal columns from public users when they are not actionable.
- Keep public form fields minimal and non-sensitive.
- Use exact source field keys, not labels.

## Detail View And Widgets

Use `bt_boards_update_detail_view_config` with a complete `detailViewConfig`:

- `version`
- `settings`: responsive columns, row height, margins.
- `layout`: grid items keyed by widget id.
- `widgets`: `field`, `text`, `image`, `button`.

Widget rules:

- `field`: use for source fields; include label/format when needed.
- `text`: use for section labels, instructions, or context.
- `image`: use for image/file preview when source field supports it.
- `button`: use for explicit actions only.

Button widget action:

- `action.type`: `invoke_automation`.
- `workflowId`: automation/workflow to invoke.
- `triggerActionInstanceId`: specialized trigger to call.
- `inputSchema`: expected trigger input.
- `inputBindings`: bind static values, item fields, objects, or arrays.
- `responseMode`: `async` for background actions, `wait` when the user needs the result.
- `waitTimeoutMs`: only when `responseMode` is `wait`.

Before configuring a button:

1. Call `bt_boards_list_invocable_automations`.
2. Call `bt_boards_list_invocable_automation_triggers`.
3. Call `bt_boards_get_invocable_automation_trigger_schema`.
4. Map each required trigger input from item fields or static values.

## Public Link And Security

Use public sharing only after explicit approval.

Prefer `restricted` mode for operational boards:

- Create roles with least privilege.
- Add users with only needed permissions.
- Use column permissions for stage-specific access.
- Hide sensitive columns and fields.
- Do not expose tokens, credentials, private notes, payment data, medical/legal sensitive fields, or internal agent traces.

Permission meanings:

- `canView`: base access.
- `canViewColumn`: can see a column.
- `canViewItemDetails`: can open detail view.
- `canEditItem`: can update item fields.
- `canMoveItem`: can move items.
- `canAddItem`: can create items.
- `canReorderColumns`: can reorder columns.

Sensitive tools require `confirmation: "APPROVED"` after user approval:

- `bt_boards_generate_public_link`
- `bt_boards_set_public_access_mode`
- `bt_boards_remove`
- `bt_boards_delete_item`
- `bt_boards_delete_public_role`
- `bt_boards_revoke_allowed_user`
- `bt_boards_delete_allowed_user`
- `bt_boards_delete_item_field_file`

## AI Agent Handoff

When an AI Agent needs board capabilities, hand off to `bottasker-ai-agent-architect` with:

- boardId, sourceType, sourceConfig;
- columns and allowed transitions;
- source fields and writable fields;
- detail buttons and their automation contracts;
- intended least-privilege worker action: `read_board`, `manage_items`, or `invoke_board_action`.

Agents must not change public access, roles, users, or sharing settings unless the app blueprint explicitly approves an administrative tool.

## Expected MCP Tools

Use:

- `bt_boards_list`, `bt_boards_get`, `bt_boards_create`, `bt_boards_update`, `bt_boards_remove`
- `bt_boards_create_from_dynamic_table`, `bt_boards_create_from_data_hub_model`, `bt_boards_update_source_config`
- `bt_boards_get_source_fields`, `bt_boards_get_available_columns`, `bt_boards_get_board_data`
- `bt_boards_get_items`, `bt_boards_get_item`, `bt_boards_create_item`, `bt_boards_update_item`, `bt_boards_move_item`, `bt_boards_delete_item`
- `bt_boards_update_display_config`, `bt_boards_update_column_order`, `bt_boards_update_detail_view_config`
- `bt_boards_list_invocable_automations`, `bt_boards_list_invocable_automation_triggers`, `bt_boards_get_invocable_automation_trigger_schema`, `bt_boards_invoke_detail_widget_action`
- `bt_boards_generate_public_link`, `bt_boards_set_public_access_mode`
- `bt_boards_list_public_roles`, `bt_boards_add_public_role`, `bt_boards_update_public_role`, `bt_boards_delete_public_role`
- `bt_boards_list_allowed_users`, `bt_boards_add_allowed_user`, `bt_boards_update_allowed_user`, `bt_boards_revoke_allowed_user`, `bt_boards_restore_allowed_user`, `bt_boards_delete_allowed_user`
- `bt_boards_init_item_field_file_upload`, `bt_boards_complete_item_field_file_upload`, `bt_boards_get_item_field_file_download_url`, `bt_boards_delete_item_field_file`
