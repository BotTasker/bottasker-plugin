---
name: bottasker-data-architect
description: Use when the user wants to design Base de datos module (Data Hub service), models, fields, relations, records, Dynamic Tables, or data-backed app structures in BotTasker.
---

# BotTasker Data Architect

Use this skill to build durable data structures for BotTasker apps.

## Naming

The user-facing module name is **Base de datos**. At the service/API level it is still the Data Hub module, so keep technical identifiers such as `data-hub`, `data_hub`, `dataHubId`, and `bt_data_hub_*` unchanged.

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
   - models/tables; before model creation, call `bt_data_hub_get_model_schema` and `bt_data_hub_validate_create_model_payload`
   - fields
   - relations
   - record links with `bt_data_hub_link_record`, `bt_data_hub_unlink_record`, and `bt_data_hub_list_record_links`
   - seed records only when useful for verification.
6. For relation-heavy work, run `bt_data_hub_rebuild_relation_cache` after relation or record changes when appropriate.

## Modeling Rules

- Prefer stable, explicit field keys.
- The canonical `bt_data_hub_*` tools use flat top-level parameters. Do not build generic `payload` objects or internal objects such as `uiConfig`, `validation`, `permissions`, or `computed`.
- Use `label` for the visible field name and `name` for the technical key. Treat `key` as a legacy alias only.
- Use `dataHubId` as the canonical Base de datos (Data Hub) identifier. Treat `hubId` as a legacy alias only.
- For `select` and `multiselect` fields, send `options: [{ label, value, color? }]`; the MCP layer transforms that to the backend shape.
- Use relations instead of duplicated foreign data when records need to stay connected.
- Add required fields only when the user requirement is clear.
- For every Base de datos (Data Hub) field with `type: "date"`, set or update `description` with the exact agent/API format: `YYYY-MM-DD`, example `2026-05-31`. Tell agents not to send natural language dates such as `31 de mayo de 2026`.
- For every Base de datos (Data Hub) field with `type: "datetime"`, set or update `description` with ISO 8601 guidance: preferred `YYYY-MM-DDTHH:mm`, example `2026-05-31T14:30`; ISO with timezone is also acceptable.
- When an agent or workflow writes records, convert user text dates into the field format before calling `bt_data_hub_create_record` or `bt_data_hub_update_record`.
- For expense-like models, a field named `fecha` should usually be `type: "date"` and its description must include `YYYY-MM-DD`.
- Avoid deleting models, fields, relations, or records without confirmation.

## Domain Modeling Pass

Before creating or changing models, analyze the solution being built and produce a compact entity map:

- Identify the main operational entities, transactional entities, actors, documents/events, and lookup/catalog concepts.
- For every candidate property, decide whether it is a scalar field, a closed enum/select, a lookup model, or a relation to another operational model.
- Infer relation cardinality from the business workflow, not only from field names. Decide which side owns the reference before calling `bt_data_hub_create_relation`.
- Check whether the same concept already exists in the Hub before adding a field, model, or relation.
- Identify uniqueness rules before writes: single-field unique values and composite uniqueness across several fields.

## Relations, Lookup Models, Selects, And Uniqueness

- Use `select` or `multiselect` only for small, stable, closed sets such as status, priority, source channel, or approval state.
- Every `select` or `multiselect` field must include explicit `options` with all known allowed values. Do not create an option field without options; ask one focused question if the allowed values are unknown.
- If a property can grow over time, needs its own metadata, permissions, reporting, ordering, lifecycle, translations, owners, or reuse across models, create a lookup/nomenclator model instead of a select field.
- Common lookup/nomenclator examples: department, location, skill, tag catalog, rejection reason, job category, product family, cost center, document type, approval level.
- Connect lookup/nomenclator models with Base de datos (Data Hub) relations. Do not duplicate the lookup label as free text in many models when records must stay consistent.
- For one owner with many children, use `one_to_many` from owner to child. Example: Vacancy -> Application creates the FK on Application.
- For many records selecting one catalog item, use `many_to_one` from the record model to the lookup model. Example: Candidate -> Source, Expense -> Cost Center.
- Before calling `bt_data_hub_create_relation`, choose user-facing `name` and `inverseName` for how the relation appears from both sides in the Builder/detail panel. `name` is shown when the current record is on the relation `to` side; `inverseName` is shown when the current record is on the `from` side. Leave either blank when the default related model name is clearer.
- Do not let a relation label point back to the current model. For `Postulante -> Documentos` as `one_to_many`, the `Postulante` detail should show `Documentos` or `Documentos del postulante`, not `Postulante`.
- If an existing relation label is ambiguous or names the same model being viewed, edit the relation `name`/`inverseName` in the Builder instead of creating duplicate fields or duplicate relations.
- For many-to-many concepts such as candidates with many skills or employees in many projects, use `many_to_many` unless the link needs attributes; if the link needs attributes, create a join model such as CandidateSkill with its own fields.
- Mark a field `unique: true` when a single value must not repeat inside the model, such as email, document number, SKU, or external id.
- Use model `uniqueKeys: [{ name, fieldNames }]` when uniqueness depends on a combination, such as candidate + vacancy, employee + period, sku + warehouse, email + organization, or documentType + documentNumber.
- If a uniqueness rule is important but one of the fields is optional or not known yet, state the assumption and ask before writing records that could create duplicates.

## Handoff To AI Agent Architect

When Base de datos (Data Hub) will be used by AI Agents, return a `dataContext` that includes:

- Base de datos (Data Hub) id/name.
- Model ids/names and any `uniqueKeys`.
- Field names, labels, types, required flags, `unique`, enums/options, date/time formats, sensitive flags, and relation targets.
- Recommended least-privilege permissions per model: `read`, `create`, `update`, or `manage_schema`.
- Fields that should be hidden from agents.
- Which model each agent tool should read or write.

For a write-only capture agent, prefer `read/create` on target models and avoid `update` unless the approved app flow requires correction/editing.

## Handoff To Automation Engineer

When Base de datos (Data Hub) will be used by workflow automations, return a `dataContext` that includes:

- `dataHubId` and Base de datos (Data Hub) name.
- Model IDs/names for every workflow node that will search, create, update, or trigger.
- Field names, labels, types, required/optional flags, enum/options, date/time formats, sensitive flags, and relation targets.
- Which Base de datos (DataHub) events should trigger workflows: `record.created`, `record.updated`, `record.deleted`, `record.status_changed`, `record.linked`, or `record.unlinked`.
- Which workflow nodes should be used: `on_data_hub_event`, `data_hub_search_records`, `data_hub_get_record`, `data_hub_create_record`, `data_hub_update_record`, `data_hub_archive_record`, `data_hub_delete_record`, `data_hub_link_records`, `data_hub_unlink_records`, or `data_hub_list_record_links`.
- Which fields should be written in `values` or `filters`, using technical field names from Base de datos (Data Hub).

For workflows, prefer `data_hub_search_records` or `data_hub_get_record` before updates or destructive actions when the exact `recordId` is not already known. Use `data_hub_archive_record` instead of `data_hub_delete_record` unless the user explicitly approves deletion. Normalize `date` and `datetime` values before writing so automation nodes can pass `values` directly.

## Handoff To Forms Architect

When a form will create Base de datos (Data Hub) records or write to Dynamic Tables, return a `formContext` that includes:

- Base de datos (Data Hub) id/name, model ids/names, or Dynamic Table ids/names.
- Target field names, labels, types, required flags, options, relation targets, and date/time formats.
- Recommended form fields with stable keys and labels.
- Required static mappings such as source, initial status, channel, stage, or priority.
- Fields that should not be exposed in a public form.

Do not let the form duplicate model design. Use Forms for capture and mappings; keep durable structure, relations, uniqueness, and reporting fields in Base de datos (Data Hub) or Dynamic Tables.

## Expected MCP Tools

Use `bt_data_hub_*`, `bt_dynamic_tables_*`, and `bt_dynamic_records_*` tools. For app discovery use `bt_apps_list` and `bt_apps_get`.
