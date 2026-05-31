---
name: bottasker-ops-builder
description: Use when the user wants to build or operate BotTasker dashboards, boards, catalogs, products, sales carts, calendar, files, knowledge, conversations, messages, calls, or WhatsApp templates.
---

# BotTasker Ops Builder

Use this skill for operational modules after the app and data foundation are known.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` for app-scoped modules.
3. List existing resources before creating new ones.
4. Use the module-specific tools:
   - dashboards: `bt_dashboards_*`
   - boards: `bt_boards_*`
   - catalogs/products/categories: `bt_catalogs_*`, `bt_products_*`, `bt_product_categories_*`
   - sales carts: `bt_sales_carts_*`
   - calendar: `bt_calendar_*`
   - files: `bt_files_*`
   - knowledge: `bt_knowledge_*`
   - conversations/messages/calls: `bt_conversations_*`, `bt_messages_*`, `bt_calls_*`
   - WhatsApp templates: `bt_whatsapp_templates_*`
5. Preview or run query tools before committing dashboard or reporting structures when tools are available.

## Operating Rules

- Use Data Hub or Dynamic Tables as the source of truth when dashboards and boards need structured records.
- Prefer creating a minimal dashboard or board first, then iterating.
- Do not submit WhatsApp templates for approval unless the user explicitly asks.
- Ask for confirmation before archive/remove/delete tools or broad status changes.

## Expected MCP Tools

Use operational module tools plus `bt_apps_list`, `bt_apps_get`, `bt_mcp_list_skills`, and `bt_mcp_load_skill` for discovery.

