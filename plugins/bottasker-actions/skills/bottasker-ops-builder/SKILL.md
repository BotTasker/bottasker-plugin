---
name: bottasker-ops-builder
description: Use when the user wants to build or operate BotTasker calendar, files, knowledge, conversations, messages, calls, WhatsApp templates, or general operational modules.
---

# BotTasker Ops Builder

Use this skill for operational modules after the app and data foundation are known.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` for app-scoped modules.
3. List existing resources before creating new ones.
4. Use the module-specific tools:
   - dashboards, tracking, KPIs, control, reporting: delegate to `bottasker-dashboard-architect`
   - boards: delegate to `bottasker-board-architect`
   - catalogs/products/categories/variants/sales carts: delegate to `bottasker-catalog-architect`
   - calendar: `bt_calendar_*`
   - files: `bt_files_*`
   - knowledge: `bt_knowledge_*`; use `bt_knowledge_create_document` for text or markdown knowledge and `bt_knowledge_add_web_url` for URLs.
   - conversations/messages/calls: `bt_conversations_*`, `bt_messages_*`, `bt_calls_*`
   - WhatsApp templates: `bt_whatsapp_templates_*`
5. Preview or run query tools before committing dashboard or reporting structures when tools are available.

## Operating Rules

- Use Data Hub or Dynamic Tables as the source of truth when dashboards and boards need structured records.
- Use `bottasker-dashboard-architect` for dashboards, tracking, KPIs, control views, reporting, widget strategy, and area-specific dashboard sets.
- Use `bottasker-board-architect` for boards, board sources, columns, detail views, widgets, button automations, public links, roles, and access security.
- Prefer creating a minimal board or operational resource first, then iterating.
- Use `bottasker-catalog-architect` for product catalogs, categories, variants, modifier groups, properties, availability, product search, and sales cart behavior.
- Do not submit WhatsApp templates for approval unless the user explicitly asks.
- For WhatsApp template packs, use `bt_whatsapp_templates_create_pack` to create business drafts, then ask before submit.
- Check required credentials before WhatsApp template actions; if unavailable, explain the missing `credentialId` instead of retrying payload shapes.
- Ask for confirmation before archive/remove/delete tools or broad status changes.

## Expected MCP Tools

Use operational module tools plus `bt_apps_list`, `bt_apps_get`, `bt_mcp_list_skills`, and `bt_mcp_load_skill` for discovery.
