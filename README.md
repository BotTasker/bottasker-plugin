# BotTasker Actions Plugin

Codex plugin for building and operating BotTasker apps through the BotTasker external MCP.

This repository is intentionally standalone so it can become its own git repository. It contains a local Codex marketplace plus the `bottasker-actions` plugin.

## Prerequisites

- BotTasker external MCP reachable at `https://bottasker.ai/mcp`.
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
Use BotTasker to run bt_apps_blueprint_plan.
Use BotTasker to run bt_ai_agent_tools_discover.
Use BotTasker to run bt_mcp_list_skills.
```

## Plan-First Flow

For app creation or advanced automation, the plugin must discover capabilities, create a plan, resolve relevant doubts, and wait for explicit approval before calling write tools.

Expected flow:

1. `bt_context_get_profile`
2. `bt_apps_list_modules`
3. `bt_apps_blueprint_plan`
4. Specialist discovery as needed, for example `bt_ai_agent_tools_discover` when AI Agents are part of the approved app blueprint
5. Ask for approval
6. Execute with `bt_apps_*`, `bt_data_hub_*`, `bt_ai_agents_*`, `bt_action_instances_*`, `bt_workflows_*`, and module tools from the approved plan

Example prompt:

```text
Quiero una app para llevar registro de gastos por Telegram, con dashboard mensual y un agente que registre los gastos automaticamente.
```

Codex should use `bottasker-app-builder` to propose the app structure, module combination, specialist handoffs, risks, and execution plan before making changes. If AI Agents are included, `bottasker-ai-agent-architect` then designs the agent principal, subagents, tools, inputs, outputs, and required configuration inside the approved app.

## Validate Plugin

```bash
python3 /Users/this/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py \
  /Users/this/Documents/projects/bottasker/app/bottasker-actions-plugin/plugins/bottasker-actions
```

## Included Skills

- `bottasker-router`: entrypoint and workflow router.
- `bottasker-app-builder`: complete app design, module selection, specialist handoffs, apps, modules, menus, and templates.
- `bottasker-data-architect`: Data Hub and Dynamic Tables.
- `bottasker-ai-agent-architect`: AI Agents module specialist for agents, subagents, dynamic tools, tool schemas, inputs, and outputs inside an app.
- `bottasker-automation-engineer`: AI agents, workflows, workers, and tests.
- `bottasker-ops-builder`: operational modules such as dashboards, boards, catalogs, calendar, files, knowledge, and conversations.
