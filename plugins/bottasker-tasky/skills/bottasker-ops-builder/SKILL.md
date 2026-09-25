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
   - forms: delegate to `bottasker-forms-architect`
   - catalogs/products/categories/variants/sales carts: delegate to `bottasker-catalog-architect`
   - calendar: `bt_calendar_*`
   - files: `bt_files_*`
   - knowledge: delegate to `bottasker-knowledge-base-assistant` for Knowledge Base documents, queries, ingestion state, and agent attachments.
   - conversations/messages/calls: `bt_conversations_*`, `bt_messages_*`, `bt_calls_*`
   - WhatsApp templates: delegate to `bottasker-whatsapp-template-architect` for classification, content, components, examples, media, buttons, draft creation, and Meta submission.
5. Preview or run query tools before committing dashboard or reporting structures when tools are available.

## Operating Rules

- Use Base de datos (Data Hub) or Dynamic Tables as the source of truth when dashboards and boards need structured records.
- Use `bottasker-dashboard-architect` for dashboards, tracking, KPIs, control views, reporting, widget strategy, and area-specific dashboard sets.
- Use `bottasker-board-architect` for boards, board sources, columns, detail views, widgets, button automations, public links, roles, and access security.
- Use `bottasker-forms-architect` for public/private forms, submissions, form fields, connector mappings, publishing, and confirmation screens.
- Prefer creating a minimal board or operational resource first, then iterating.
- Use `bottasker-catalog-architect` for product catalogs, categories, variants, modifier groups, properties, availability, product search, and sales cart behavior.
- Use `bottasker-knowledge-base-assistant` for Knowledge Base creation, querying, troubleshooting, and adding Knowledge Base tools to AI Agents.
- Use `bottasker-whatsapp-template-architect` for every WhatsApp template request. It owns Meta rules and the exact tool contracts.
- Ask for confirmation before archive/remove/delete tools or broad status changes.
- Treat conversation tags as app-scoped labels with a reusable catalog. List the catalog before filtering or removing a tag; adding by name creates or reuses the label and assigns its generated color automatically when it is new.
- Filter conversations with tag IDs, not visible names. Multiple tag IDs use OR semantics: a conversation matches when it has at least one selected label.
- Use `bt_conversations_get_tags` before changing a conversation when its current labels are unknown. Use `bt_conversations_add_tags` with `names` to create/reuse and assign labels, and `bt_conversations_remove_tag` to unassign them. `bt_conversations_add_tag` remains only as the legacy single-label alias. Removing a label from a conversation does not delete it from the app catalog.
- AI Agents that receive WhatsApp, Telegram, or WebChat input with automatic conversation registration enabled receive `manage_conversation_tags` at runtime. This tool is already bound to the current conversation; never ask for or invent an internal conversation ID.

## Conversation Read Capabilities

Use the Conversaciones worker when an agent or workflow must inspect customer conversations without changing them. This capability is always scoped to the current organization and `appId`; never ask the user for organization scope and never try to override either scope through tool input. The app role needs both `conversations:read` and `messages:read`.

For AI Agents, discover and equip the single `conversation_tools` action. It exposes these runtime tools:

- `conversations_find`: search by phone, `chat_id`, `contact_id`, `contact_handle`, or `contact_record_id`, with optional channel and a limit of 1-20.
- `conversations_get`: load a safe conversation summary from an exact `conversation_id`.
- `conversations_get_activity`: return total, inbound, outbound, and unread counts plus first/last activity and the latest customer, human-agent, and AI-agent message dates.
- `conversations_get_recent_messages`: load 1-100 recent messages in chronological order, optionally filtered by direction, sender type, or an exclusive ISO 8601 `before` cursor.

When the exact conversation ID is unknown, call `conversations_find` first. Phone lookup normalizes common formats and checks stored WhatsApp aliases. If the result says `ambiguous: true`, present the candidates or narrow by channel and ask the user/agent context to choose; never select a candidate automatically. Use the returned `nextBefore` only when `hasMore` is true. Returned messages intentionally omit raw external payloads, internal metadata, and attachment URLs; do not claim those fields are unavailable in the underlying channel, only that this read tool does not expose them.

For deterministic workflows, use the corresponding work actions `find_conversations`, `get_conversation`, `get_conversation_activity`, and `get_recent_messages`. Do not attach those workflow-only actions to an AI Agent, and do not add the agent-only `conversation_tools` action to a workflow.

## Expected MCP Tools

Use operational module tools plus `bt_conversation_tags_list`, `bt_conversations_get_tags`, `bt_conversations_add_tags`, `bt_conversations_remove_tag`, `bt_apps_list`, `bt_apps_get`, `bt_mcp_list_skills`, and `bt_mcp_load_skill` for discovery.
