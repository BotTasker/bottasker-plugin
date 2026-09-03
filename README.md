# Tasky Assistant Plugin

Tasky Assistant plugin for building and operating BotTasker apps through the BotTasker external MCP.

This repository is intentionally standalone so it can become its own git repository. It contains local marketplaces plus the `bottasker-tasky` plugin for Codex and Claude Code.

## Prerequisites

- BotTasker external MCP reachable at `https://api.bottasker.ai/mcp`.
- A BotTasker API key.
- Codex or Claude Code installed.

Do not commit API keys. Codex reads the API key from `BOTASKER_API_KEY`; Claude Code prompts for it as sensitive plugin configuration.

## Configure Auth For Codex

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
codex plugin add bottasker-tasky@bottasker-local
```

Open a new Codex session after installing so Codex reloads plugin skills and MCP servers.

## Install In Claude Code

Claude Code uses the official plugin marketplace flow. From this repository root:

```bash
claude plugin marketplace add .
claude plugin install bottasker-tasky@bottasker-local
```

When Claude Code enables the plugin, enter the BotTasker API key in the sensitive configuration prompt. The key is substituted into the plugin MCP header at runtime and is not stored in this repository.

If you are already inside a Claude Code session, you can use the equivalent slash commands:

```text
/plugin marketplace add .
/plugin install bottasker-tasky@bottasker-local
/reload-plugins
```

## Verify Codex

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

## Verify Claude Code

Check plugin and MCP registration:

```bash
claude plugin list
claude plugin details bottasker-tasky@bottasker-local
claude mcp list
```

In Claude Code, verify the BotTasker MCP tools:

```text
Use BotTasker to run bt_context_get_profile.
Use BotTasker to run bt_apps_list_modules.
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
  /Users/this/Documents/projects/bottasker/app/bottasker-tasky/plugins/bottasker-tasky
```

For Claude Code:

```bash
claude plugin validate /Users/this/Documents/projects/bottasker/app/bottasker-tasky
claude plugin validate /Users/this/Documents/projects/bottasker/app/bottasker-tasky/plugins/bottasker-tasky
```

## Included Skills

- `bottasker-router`: entrypoint and workflow router.
- `bottasker-app-builder`: complete app design, module selection, specialist handoffs, apps, modules, menus, and templates.
- `bottasker-data-architect`: Base de datos (Data Hub) and Dynamic Tables.
- `bottasker-ai-agent-architect`: AI Agents module specialist for agents, subagents, dynamic tools, tool schemas, inputs, and outputs inside an app.
- `bottasker-knowledge-base-assistant`: Knowledge Base specialist for documents, URL/text sources, semantic queries, ingestion state, and Knowledge Base tools attached to agents.
- `bottasker-automation-engineer`: AI agents, workflows, workers, and tests.
- `bottasker-dashboard-architect`: useful dashboards for tracking, control, KPIs, reporting, and area-specific follow-up.
- `bottasker-board-architect`: boards, data sources, columns, per-user push/sound alerts, card details, widgets, button automations, public/restricted sharing, roles, users, and security.

Tasky, Codex, and Claude can inspect and manage the authenticated user's board-column alerts through `bt_boards_get_column_alerts`, `bt_boards_configure_column_alert`, and `bt_boards_remove_column_alert`. The browser remains responsible for granting notification permission and registering its Firebase installation; MCP clients never receive Firebase installation identifiers.
- `bottasker-whatsapp-template-architect`: Meta-compatible WhatsApp templates covering marketing, utility, authentication, variables, media/location headers, buttons, drafts, and controlled submission.
- `bottasker-ops-builder`: operational modules such as calendar, files, conversations, and calls.
- `bottasker-catalog-architect`: catalogs, products, variants, properties, modifiers, availability, and sales carts.

## References

- Claude Code MCP: https://code.claude.com/docs/en/mcp
- Claude Code plugins: https://code.claude.com/docs/en/plugins
- Claude Code plugin reference: https://code.claude.com/docs/en/plugins-reference
- Claude Code plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
