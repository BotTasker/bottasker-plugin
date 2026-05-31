---
name: bottasker-app-builder
description: Use when the user wants to create or update BotTasker apps, enable modules, organize menus, create from templates, or export app templates.
---

# BotTasker App Builder

Use this skill to create app shells and app-level structure in BotTasker.

## Workflow

1. Call `bt_context_get_profile`.
2. Call `bt_apps_list_modules` to discover allowed modules.
3. Call `bt_apps_list` to avoid duplicate apps.
4. For an existing app, resolve `appId` with `bt_apps_list` or `bt_apps_get`.
5. Create or update the app with `bt_apps_create`, `bt_apps_update`, or `bt_apps_update_menu`.
6. If building from a reusable design, use `bt_apps_create_from_template`.
7. If packaging an existing app as a starter, use `bt_apps_export_template`.

## App Design Defaults

- Prefer a minimal first app: name, description, enabled modules, default route, and menu groups.
- Use module keys from `bt_apps_list_modules`; do not invent module keys.
- Keep menu groups consistent with enabled modules.
- When the app needs data, hand off to `bottasker-data-architect` after the app is created.
- When the app needs automations, hand off to `bottasker-automation-engineer`.

## Safety Rules

- Do not pass `organization`.
- Do not overwrite menu groups without first reading the current app.
- Ask for confirmation before destructive changes or large menu rewrites.

## Expected MCP Tools

Use `bt_apps_list_modules`, `bt_apps_list`, `bt_apps_get`, `bt_apps_create`, `bt_apps_update`, `bt_apps_update_menu`, `bt_apps_create_from_template`, and `bt_apps_export_template`.

