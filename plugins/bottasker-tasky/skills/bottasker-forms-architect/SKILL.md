---
name: bottasker-forms-architect
description: "Use when the user wants to design, create, publish, connect, troubleshoot, or operate BotTasker Forms: public/private forms, Visual Form definitions, form fields, validations, submissions, Base de datos (Data Hub) or Dynamic Table mappings, workflow triggers, confirmation screens, access codes, and `bt_forms_*` MCP tools."
---

# BotTasker Forms Architect

Use this skill as the specialist for BotTasker Forms. Forms capture structured information from users, store submissions, optionally create records in Base de datos (Data Hub) or Dynamic Tables, and can trigger workflows.

For detailed design rules, field schemas, connector behavior, mappings, and failure modes, read `references/forms-architecture.md`.

## Mandatory Flow

1. Call `bt_context_get_profile`.
2. Resolve `appId` before working with app-scoped forms.
3. Use `bt_mcp_find_tools` or `bt_mcp_list_skills`/`bt_mcp_load_skill` before assuming a concrete Forms tool exists.
4. List existing forms with `bt_forms_list` before creating a new one.
5. List connector definitions with `bt_forms_list_connector_definitions` before choosing a target.
6. For Base de datos (Data Hub), Dynamic Table, or Workflow targets, read target fields/options before creating mappings.
7. Ask for explicit confirmation before archive/delete, public publishing, token regeneration, access changes, or broad rewrites.

## Core Concepts

- Form status is `draft`, `published`, `disabled`, or `archived`.
- A form can be internal/private or public through `publicConfig.enabled`.
- Public forms have a generated token and `publicUrl`; never invent or hand-write either.
- Access codes are stored hashed by the backend. Do not expose or recover existing codes.
- Submissions have `received`, `processing`, `completed`, or `failed` status and may include `targetResults`.
- Form definitions use Visual Form `version: "1.0"`, a 12-column layout, fields, and layout items.
- The current field limit is 200 fields per form.

## Design Rules

- Start with the business purpose, not with fields.
- Prefer the fewest fields needed to move the process forward.
- Use clear labels and stable technical `key` values.
- Use `required` only when the process truly cannot continue without the field.
- Add `helpText` for confusing fields, legal consent, formats, or operational consequences.
- Avoid sensitive personal data unless the user explicitly needs it and the process justifies it.
- Design for mobile first: short labels, single-column critical flows, and grouped sections.
- Use Base de datos (Data Hub) for durable operational records and relations. Use Forms submissions for intake/review-only flows.

## Connector Guidance

Only use connectors returned by `bt_forms_list_connector_definitions`. Current supported connectors are:

- `submissionOnly`: stores each submission without creating another record.
- `dataHub.createRecord`: creates a Base de datos (Data Hub) record with mapped values.
- `dynamicTable.createRecord`: inserts a row into a Dynamic Table.
- `workflow.trigger`: starts a workflow from a submission.

Do not present `webhook/http` or `notification` as available unless discovery shows that the connector registry exposes them.

## Mapping Rules

- Use `formField` mappings for captured values.
- Use `static` mappings for fixed values such as status, source, stage, or channel.
- Read target fields before mapping. Do not invent Base de datos (Data Hub) model ids, table ids, workflow ids, or trigger action instance ids.
- Preserve existing mappings unless the user asks to change them.
- For select/reference options, prefer dynamic `optionsSource` when target fields expose it.
- Verify with `bt_forms_get` after creates or updates.

## Delegation

- Complex Base de datos (Data Hub) modeling: delegate to `bottasker-data-architect`.
- Workflow graph design or trigger setup: delegate to `bottasker-automation-engineer`.
- Forms as part of a complete app blueprint: delegate through `bottasker-app-builder`.
- Agents that consume, create, or explain forms: coordinate with `bottasker-ai-agent-architect`.
- Files, Knowledge Base, conversations, messages, and calls: delegate to `bottasker-ops-builder`.

## Expected MCP Tools

Use `bt_forms_list`, `bt_forms_get`, `bt_forms_list_connector_definitions`, `bt_forms_get_connector_target_fields`, `bt_forms_get_connector_config_options`, `bt_forms_create_from_wizard`, `bt_forms_create`, `bt_forms_update`, `bt_forms_regenerate_public_token`, `bt_forms_archive`, `bt_forms_delete`, `bt_forms_list_submissions`, and `bt_forms_get_submission`.

For app discovery use `bt_apps_list`, `bt_apps_get`, and `bt_apps_list_modules`. For Base de datos (Data Hub) and Dynamic Table dependencies use the relevant specialist tools before creating or mapping forms.
