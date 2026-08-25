---
name: bottasker-whatsapp-template-architect
description: Use when the user wants Tasky to design, create, inspect, validate, or submit WhatsApp Business templates, including marketing, utility, authentication, media headers, location, variables, buttons, languages, and Meta approval rules.
---

# BotTasker WhatsApp Template Architect

Use this skill as Tasky's specialist for WhatsApp Business templates. It owns classification, copy, Meta-compatible component construction, representative examples, duplicate prevention, draft creation, media samples, and the explicit approval gate before submission.

## Operating Workflow

1. Call `bt_context_get_profile` and resolve the target app with `bt_apps_list` or `bt_apps_get` when needed.
2. Resolve the WhatsApp `credentialId` from trusted app/account context. Never invent an id and never reveal credential bodies, tokens, WABA ids, or secrets.
3. Call `bt_whatsapp_templates_list` with `credentialId` before creating anything. Search the proposed name and language to avoid duplicates.
4. Clarify only missing decisions that materially change the template:
   - business event and recipient expectation;
   - category and exact language/locale;
   - final message, variables, examples, header and buttons;
   - media sample when IMAGE, VIDEO, or DOCUMENT is selected.
5. Normalize and validate the design using the rules below.
6. For a media header, call `bt_whatsapp_templates_upload_media` first and place the returned `handle` in `example.header_handle`.
7. Create one local draft with `bt_whatsapp_templates_create_draft`. Use `bt_whatsapp_templates_create_pack` only when the user requests the supported commerce pack.
8. Read the result back with `bt_whatsapp_templates_list` and summarize name, category, language, components, variables, buttons, and draft status.
9. Never call `bt_whatsapp_templates_submit` merely because the draft is valid. Submission is an external Meta action: the user must explicitly request it and confirm immediately before the call.

Creating a draft is a low-risk reversible write and may be done directly once its content is unambiguous. Submitting it for Meta review always requires explicit approval.

## Category Decision

Choose the category from the message's purpose, not from the user's preferred approval outcome.

- `UTILITY`: a specific transaction, account, service, request, subscription, appointment, order, payment, delivery, or support event that the recipient expects. Keep it factual and tied to that event. Promotions, cross-sell, discounts, re-engagement, or persuasive sales copy turn it into marketing.
- `MARKETING`: offers, launches, recommendations, abandoned-cart recovery, re-engagement, announcements with promotional intent, upsell, cross-sell, or any mixed utility/promotional content.
- `AUTHENTICATION`: delivery of a one-time verification code. Use Meta's authentication structure; do not write a custom promotional body.

If content mixes a transaction with promotion, classify it as `MARKETING` or split it into two templates. Do not disguise marketing as utility.

## Name And Language

- `name` is internal and is not shown to the recipient.
- Use 1-512 characters containing only lowercase `a-z`, digits, and underscores.
- Remove accents; replace spaces or punctuation with underscores; collapse duplicate underscores.
- Prefer stable intent-based names such as `confirmacion_pedido`, `recordatorio_cita_24h`, or `codigo_acceso`.
- Do not use spaces, hyphens, uppercase letters, accents, customer data, or a date/version suffix unless it is operationally necessary.
- `language` must be an exact Meta locale supported by the account, such as `es`, `es_ES`, `es_MX`, `en`, or `en_US`.
- Each translation is a separate name/language version. Write the complete copy and examples in the selected language; do not mix languages.

## Standard Template Structure

For `UTILITY` and `MARKETING`, send `components` in this order:

1. Optional `HEADER`.
2. Required `BODY`.
3. Optional `FOOTER`.
4. Optional `BUTTONS`.

### Header Variations

Use at most one header:

- No header: omit `HEADER`.
- Text: `{ "type": "HEADER", "format": "TEXT", "text": "Pedido {{1}} confirmado", "example": { "header_text": ["Pedido BT-1042 confirmado"] } }`.
- Image: `{ "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["<handle>"] } }`.
- Video: `{ "type": "HEADER", "format": "VIDEO", "example": { "header_handle": ["<handle>"] } }`.
- Document: `{ "type": "HEADER", "format": "DOCUMENT", "example": { "header_handle": ["<handle>"] } }`.
- Location: `{ "type": "HEADER", "format": "LOCATION" }`.

The uploaded image, MP4, or PDF is only the representative sample Meta reviews. The header format remains fixed, but the actual image, video, document, or location can be dynamic when the approved template is sent. Do not tell the user that the sample becomes the permanent media.

Accepted sample formats are JPEG/PNG up to 5 MB, MP4 up to 16 MB, and PDF up to 100 MB. Do not put variables in media headers or footers.

### Body And Variables

- `BODY` is required for standard templates and contains the recipient-facing message.
- Prefer concise, explicit copy that provides context without relying on hidden application state.
- Use positional variables `{{1}}`, `{{2}}`, `{{3}}` in consecutive order with no gaps.
- Do not place variables adjacent to one another; separate them with meaningful text.
- Every variable must have a representative, non-empty example in the same order.
- Put examples on the body as `example.body_text`, which is an array containing one example row.
- Do not use a variable for an entire sentence or for content that changes the template's meaning/category.

Correct body:

```json
{
  "type": "BODY",
  "text": "Hola {{1}}, tu pedido {{2}} estará listo el {{3}}.",
  "example": { "body_text": [["Ana", "BT-1042", "25/08/2026"]] }
}
```

### Footer

- `FOOTER` is optional, short, and static.
- Use it for a secondary note such as `No respondas a este mensaje` or a concise disclaimer.
- Do not put variables in the footer.

### Standard Buttons

Buttons are optional. Use only actions that help complete the next step. The editor supports up to 10 total buttons, at most 2 URL buttons, 1 phone button, and 1 copy-code button.

- Quick reply: `{ "type": "QUICK_REPLY", "text": "Confirmar" }`.
- Static URL: `{ "type": "URL", "text": "Ver pedido", "url": "https://tienda.example/pedidos" }`.
- Dynamic URL: the single `{{1}}` must be at the end, and `example` contains the complete resolved URL: `{ "type": "URL", "text": "Ver pedido", "url": "https://tienda.example/pedidos/{{1}}", "example": ["https://tienda.example/pedidos/BT-1042"] }`.
- Phone: `{ "type": "PHONE_NUMBER", "text": "Llamar", "phone_number": "+51987654321" }`.
- Copy code for non-authentication use: `{ "type": "COPY_CODE", "example": "AHORRA20" }`.

Button labels should be short and action-oriented. Phone numbers must be international E.164. URLs must use HTTPS. Do not invent a destination URL, phone number, package name, signature hash, or promotional code.

### Commerce And Flow Buttons

The backend component contract can also pass Meta's specialized buttons when the target WABA has the required resource configured:

- Catalog: `{ "type": "CATALOG", "text": "Ver catálogo" }`. Use only when the WhatsApp account has a connected commerce catalog.
- Multi-product message: `{ "type": "MPM", "text": "Ver productos" }`. The actual product sections are selected when sending; do not embed invented product ids in the template draft.
- Flow: `{ "type": "FLOW", "text": "Completar datos", "flow_id": "<real-flow-id>", "navigate_screen": "WELCOME_SCREEN", "flow_action": "navigate" }`. Meta also accepts a real `flow_name` or an inline `flow_json` creation variant. Use exactly one real flow reference and verify the target screen; never invent a flow id, name, screen, or JSON contract.

These advanced buttons are not interchangeable with a URL button. If the required catalog or Flow cannot be resolved from trusted context, explain the missing prerequisite and stop before creating the draft.

## Authentication Templates

Authentication templates use a fixed security-oriented structure. Build exactly:

```json
[
  { "type": "BODY", "add_security_recommendation": true },
  { "type": "FOOTER", "code_expiration_minutes": 10 },
  {
    "type": "BUTTONS",
    "buttons": [{ "type": "OTP", "otp_type": "COPY_CODE", "text": "Copiar código" }]
  }
]
```

Supported OTP delivery variations:

- `COPY_CODE`: include `type: "OTP"`, `otp_type: "COPY_CODE"`, and localized visible `text`.
- `ONE_TAP`: include `type: "OTP"`, `otp_type: "ONE_TAP"`, `text`, `autofill_text`, `package_name`, and `signature_hash`. Ask for the real Android package name and signature hash; never fabricate them.

Use a reasonable `code_expiration_minutes` value supplied or accepted by the user. Keep `add_security_recommendation` enabled unless the user has a concrete reason to disable it. Authentication templates do not use the standard free-form marketing/utility body or standard buttons.

## Complete Payload Examples

Utility with text header, variables, footer, and dynamic URL:

```json
{
  "credentialId": "<credential-id>",
  "name": "confirmacion_pedido",
  "category": "UTILITY",
  "language": "es",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Pedido {{1}} confirmado",
      "example": { "header_text": ["Pedido BT-1042 confirmado"] }
    },
    {
      "type": "BODY",
      "text": "Hola {{1}}, recibimos tu pedido {{2}} y te avisaremos cuando esté listo.",
      "example": { "body_text": [["Ana", "BT-1042"]] }
    },
    { "type": "FOOTER", "text": "Gracias por tu compra" },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "URL",
          "text": "Ver pedido",
          "url": "https://tienda.example/pedidos/{{1}}",
          "example": ["https://tienda.example/pedidos/BT-1042"]
        },
        { "type": "QUICK_REPLY", "text": "Necesito ayuda" }
      ]
    }
  ]
}
```

Marketing with a dynamic image header:

```json
{
  "credentialId": "<credential-id>",
  "name": "oferta_clientes_frecuentes",
  "category": "MARKETING",
  "language": "es",
  "components": [
    { "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["<uploaded-handle>"] } },
    {
      "type": "BODY",
      "text": "Hola {{1}}, disfruta {{2}} de descuento en tu próxima compra.",
      "example": { "body_text": [["Ana", "20%"]] }
    },
    { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Ver oferta" }] }
  ]
}
```

## Validation Before Creation

Before calling `bt_whatsapp_templates_create_draft`, verify:

- the same normalized name and language do not already exist;
- category matches the actual intent;
- name and locale follow the exact rules;
- standard templates contain a non-empty body;
- component order and header format are valid;
- variables are sequential and every variable has a realistic example;
- dynamic URL has one `{{1}}` at the end and a full resolved example;
- multimedia has a real uploaded `header_handle`;
- catalog, MPM, or Flow buttons reference a real configured prerequisite and use the exact Meta component shape;
- authentication contains only its security structure and required OTP fields;
- no placeholder credential, URL, phone number, handle, package name, or signature will be written.

If required business content is missing, ask one focused question. If the missing value is only copy wording and the user's intent is clear, propose a concise compliant draft and identify the assumption.

## Submission And Meta Review

- Draft creation does not contact Meta for approval.
- Before submission, show the exact name, language, category, body, examples, header, footer, and buttons.
- Explain that Meta may reclassify or reject the template and that approval is not guaranteed.
- Call `bt_whatsapp_templates_submit` only after an explicit request and immediate confirmation.
- After submission, read back the template and report the returned state. Do not claim approval while it is `PENDING`.
- A rejected or paused template should be diagnosed from its current content/status; do not repeatedly resubmit unchanged content.

## Expected MCP Tools

Use `bt_context_get_profile`, `bt_apps_list`, `bt_apps_get`, `bt_whatsapp_templates_list`, `bt_whatsapp_templates_upload_media`, `bt_whatsapp_templates_create_draft`, `bt_whatsapp_templates_create_pack`, and `bt_whatsapp_templates_submit`.
