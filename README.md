# BotTasker Actions Plugin

Codex plugin for building and operating BotTasker apps through the BotTasker external MCP.

This repository is intentionally standalone so it can become its own git repository. It contains a local Codex marketplace plus the `bottasker-actions` plugin.

## Prerequisites

- BotTasker core running with the external MCP endpoint mounted at `http://localhost:3200/mcp`.
- A BotTasker API key available as `BOTASKER_API_KEY`.
- Codex installed.

Do not commit API keys. The plugin reads the API key from the environment through `bearer_token_env_var`.

## Configure Auth

For Codex Desktop on macOS:

```bash
launchctl setenv BOTASKER_API_KEY "<your-bottasker-api-key>"
```

For a shell session:

```bash
export BOTASKER_API_KEY="<your-bottasker-api-key>"
```

## Install In Codex

From this repository root:

```bash
codex plugin marketplace add .
codex plugin add bottasker-actions@bottasker-local
```

Open a new Codex session after installing so Codex reloads plugin skills and MCP servers.

## Verify

Check MCP configuration:

```bash
codex mcp list
```

In Codex, verify the BotTasker MCP tools:

```text
Use BotTasker to run bt_context_get_profile.
Use BotTasker to run bt_apps_list_modules.
Use BotTasker to run bt_mcp_list_skills.
```

## Validate Plugin

```bash
python3 /Users/this/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py \
  /Users/this/Documents/projects/bottasker/app/bottasker-actions-plugin/plugins/bottasker-actions
```

## Included Skills

- `bottasker-router`: entrypoint and workflow router.
- `bottasker-app-builder`: apps, modules, menus, and templates.
- `bottasker-data-architect`: Data Hub and Dynamic Tables.
- `bottasker-automation-engineer`: AI agents, workflows, workers, and tests.
- `bottasker-ops-builder`: operational modules such as dashboards, boards, catalogs, calendar, files, knowledge, and conversations.

