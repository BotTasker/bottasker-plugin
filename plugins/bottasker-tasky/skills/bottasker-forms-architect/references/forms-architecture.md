# BotTasker Forms Architecture

Use this reference when designing or operating BotTasker Forms. Keep user-facing answers compact; use this detail to make correct decisions before tool calls.

## Form Lifecycle

- `draft`: safe for editing; not publicly usable unless explicitly published later.
- `published`: usable by public form routes when `publicConfig.enabled` is true.
- `disabled`: intentionally unavailable without deleting history.
- `archived`: hidden from normal lists and should not be used for new submissions.

Public access is controlled by the backend. Do not manually construct tokens, public URLs, hashed access codes, or salts. To publish a form publicly, use the proper Forms tool and request explicit user confirmation if the operation changes external availability.

## Visual Form Definition

The canonical form definition shape is:

```json
{
  "version": "1.0",
  "settings": {
    "columns": 12,
    "rowHeight": 48,
    "spacing": [12, 12]
  },
  "fields": [],
  "layout": []
}
```

Every interactive field needs:

- `id`: stable visual id.
- `key`: stable technical key used in submissions and mappings.
- `label`: visible label.
- `type`: supported field type.
- Optional: `required`, `placeholder`, `helpText`, `defaultValue`, `options`, `optionsSource`, `validation`.

The backend ignores required validation for content fields whose type starts with `content_`. Use content fields to explain sections, not to capture data.

## Supported Field Types

Data fields:

- `text`, `textarea`, `email`, `phone`, `url`, `number`
- `date`, `datetime`
- `select`, `multiselect`, `radio`
- `checkbox`, `switch`
- `json`, `hidden`

Content fields:

- `content_text`
- `content_image`
- `content_divider`
- `content_spacer`
- `content_html`

Use `select`, `multiselect`, or `radio` only when choices are known. For dynamic options coming from Base de datos (Data Hub) or Dynamic Tables, use `optionsSource` when target fields provide it.

## Field Design Wisdom

- Ask for one concept per field.
- Avoid duplicate meanings: do not ask both "nombre" and "nombre completo" unless there are two different actors.
- Prefer `email`, `phone`, `url`, `date`, and `number` over generic `text` when format matters.
- Use `textarea` for notes, explanations, and descriptions.
- Use `hidden` for fixed context carried into mappings, not for secrets.
- Use `helpText` to explain why a field matters or how it will be used.
- Use `defaultValue` sparingly; defaults become real submitted values.
- Keep technical `key` values lowercase, stable, and descriptive.
- Do not rename keys casually after submissions exist because mappings and historic data depend on them.

## Validation Rules

Supported validation keys include:

- `min`, `max`
- `minLength`, `maxLength`
- `pattern`

For dates, prefer clear field help text with exact expected meaning. For Base de datos (Data Hub) `date` targets, use `YYYY-MM-DD` conventions from the Data Architect skill.

## Layout Guidance

- Use 12 columns.
- Put most mobile-critical fields at width 12.
- Group related fields with `content_text` headings or dividers.
- Place consent, legal, or optional notes near the relevant fields.
- Put high-friction fields later unless the workflow requires early qualification.
- Keep public forms short enough to complete on a phone.

## Connectors

### submissionOnly

Use when the form is only an intake or review surface. It stores submissions and target results without creating another operational record.

Good for:

- surveys
- temporary forms
- human-reviewed requests
- drafts before the final data model is approved

### dataHub.createRecord

Use when the submission should become a durable business record.

Before creating or updating:

1. Resolve `dataHubId` and `modelId`.
2. Read target fields with `bt_forms_get_connector_target_fields`.
3. Ensure required target fields have a form field or static mapping.
4. Use Base de datos (Data Hub) specialist rules for complex relations, uniqueness, lookups, and dates.

The connector calls Base de datos (Data Hub) record creation and adds `sourceRefs` with the form and submission. This is the right choice for candidates, leads, orders, applications, requests, assets, documents, and other operational entities.

### dynamicTable.createRecord

Use for simpler table-backed records where Base de datos (Data Hub) modeling is not needed.

Before mapping:

1. Resolve `tableId`.
2. Read table target fields.
3. Map form fields to table fields.
4. Keep reference fields as select/multiselect when the table field exposes a dynamic option source.

### workflow.trigger

Use when submission should start automation.

Before configuring:

1. Resolve `workflowId`.
2. Resolve `triggerActionInstanceId` using connector options.
3. Decide whether the workflow should receive mapped values or raw form data.

The workflow input includes `submissionId`, `formId`, `formData`, `rawFormData`, and `metadata`.

## Mapping Details

Mappings are arrays of simple objects. Use:

- `targetFieldName`: the field in the target system.
- `sourceType`: `formField` or `static`.
- `formFieldKey`: source field key when `sourceType` is `formField`.
- `staticValue`: fixed value when `sourceType` is `static`.

Prefer static mappings for values such as:

- source = `form`
- initial status = `nuevo`
- channel = `public_form`
- priority = `normal`
- stage = `captura`

Do not pass organization from user input. BotTasker MCP resolves organization from credentials.

## Public Form Rules

Public forms are externally reachable. Ask for explicit confirmation before:

- enabling public access
- publishing a form
- regenerating public token
- adding or changing access code
- disabling access for an already shared form

Use confirmation config to explain what happens after submission:

- `title`
- `message`
- `buttonLabel`
- optional `redirectUrl`
- optional `autoRedirectSeconds`

## Submissions

Use submissions for troubleshooting and audits:

- `bt_forms_list_submissions` to inspect incoming records by form.
- `bt_forms_get_submission` to inspect data, target results, and error.

If a submission is `failed`, inspect `targetResults` and `error` before claiming the form is broken. Failures often come from invalid connector config, missing required target fields, invalid mapping values, permissions, or downstream workflow errors.

## Blueprint Template

When a user asks for a new form, produce a compact blueprint before writing unless the request is trivial and all IDs are known:

- Purpose: what the form captures and why.
- Audience: who fills it.
- Fields: label, key, type, required, help text.
- Destination: submission only, Base de datos (Data Hub), Dynamic Table, or workflow.
- Mapping: form field or static value to target field.
- Publication: draft/private/public/access code.
- Confirmation: title, message, redirect if needed.
- Risks/questions: only unresolved decisions that block correct execution.

## Common Mistakes

- Creating a form before checking whether one already exists.
- Publishing publicly without confirmation.
- Mapping visible labels instead of technical keys.
- Inventing Base de datos (Data Hub) or workflow ids.
- Claiming `webhook/http` or `notification` exists when connector discovery does not return them.
- Overusing required fields and making public forms hard to finish.
- Duplicating Base de datos (Data Hub) modeling inside Forms instead of delegating complex model design.
