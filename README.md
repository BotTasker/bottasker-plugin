# Tasky Assistant Plugin

Tasky Assistant plugin for building and operating BotTasker apps through the BotTasker external MCP.

This repository contains the shared Tasky skills plus the platform-specific manifests for Codex and Claude Code. The local marketplaces are for beta testing; production releases are submitted to the official OpenAI and Anthropic plugin catalogs.

## Prerequisites

- BotTasker external MCP reachable at `https://api.bottasker.ai/mcp`.
- Codex or Claude Code installed.

Tasky authenticates through the client's native OAuth 2.1 flow. No API key or environment variable is required for an end user.

## Install In Codex

For public releases, find **Tasky by BotTasker** in the built-in plugin catalog and select **Install**. This repository always keeps the public plugin connected to `https://api.bottasker.ai/mcp`. For beta testing against production from this repository root:

```bash
codex plugin marketplace add .
codex plugin add bottasker-tasky@bottasker-tasky
```

Open a new Codex session after installing so Codex reloads plugin skills and the MCP server. Codex opens BotTasker in the browser when authentication is required.

## Install In Claude Code

For public releases, open `/plugin`, find **Tasky by BotTasker** in the public marketplace, and install it. For beta testing against production from this repository root:

```bash
claude plugin marketplace add .
claude plugin install bottasker-tasky@bottasker-tasky
```

When Claude Code enables the plugin, open `/mcp` if the browser sign-in does not start automatically. Claude Code stores and refreshes the OAuth tokens.

If you are already inside a Claude Code session, you can use the equivalent slash commands:

```text
/plugin marketplace add .
/plugin install bottasker-tasky@bottasker-tasky
/reload-plugins
```

## Switch Between Local And Production

Run the environment selector from this repository root (Node.js 22 or later):

```bash
node scripts/use-environment.mjs
```

The Spanish terminal menu lets you inspect the current installation or choose **Local** / **PROD**, then select **Codex**, **Claude Code**, or **both**. Only installed CLIs available in `PATH` are offered; both is the default when both are available. Choosing the environment and client applies the change without another confirmation. `0`, `q`, Ctrl+C, or EOF at either prompt cancels without changing installations. Without an interactive terminal, running without arguments only prints help.

The canonical plugin and files intended for GitHub always use `https://api.bottasker.ai/mcp`. Local uses a separate generated plugin with the same skills and a distinct plugin/MCP identifier:

| Environment | Plugin and MCP server | Endpoint |
| --- | --- | --- |
| PROD | `bottasker-tasky` | `https://api.bottasker.ai/mcp` |
| Local | `bottasker-tasky-local` | `http://localhost:3200/mcp` |

For Local, the API must run on `http://localhost:3200` and the web/OAuth consent page on `https://localhost:5185`. The helper checks API health, OAuth resource and issuer/endpoints, the unauthenticated MCP challenge, and the consent page before changing an installation. Self-signed TLS is accepted only for the fixed local consent-page check. An unreachable local server or invalid metadata stops the change; it never falls back to PROD.

Direct commands remain available:

```bash
# Apply Local to both clients.
node scripts/use-environment.mjs local --install --client=all

# Apply PROD to both clients (prod is an alias for production).
node scripts/use-environment.mjs prod --install
node scripts/use-environment.mjs production --install

# Change one client only.
node scripts/use-environment.mjs local --install --client=codex
node scripts/use-environment.mjs prod --install --client=claude

# Read actual installed manifests, enablement and MCP configuration.
node scripts/use-environment.mjs status
node scripts/use-environment.mjs status --client=codex
node scripts/use-environment.mjs status --client=claude

node scripts/use-environment.mjs --help
```

Without `--install`, `local` generates a runtime and `prod` validates the production plugin; neither changes a client's installation. Generated runtimes live in `.tasky-runtime/builds/`. The earlier `.tasky-runtime/local/` installation remains supported. These directories are excluded from Git. New builds do not overwrite an existing installation's source.

### Verification and authentication

Status shows environment, URL, version, enablement and scope for each selected client. It reports conflicting variants, missing installations and inspection errors. Codex also checks the effective MCP URL against the installed plugin. **Installation verified does not mean OAuth authenticated**: tokens remain managed by the client, separately for each server identifier. The helper neither copies tokens nor logs out. Reauthentication may still be needed if a client invalidates an installation's grant.

After a change:

- Codex: open a new session and use the native **Authenticate** action, or `codex mcp login bottasker-tasky-local` for Local / `codex mcp login bottasker-tasky` for PROD.
- Claude Code: run `/reload-plugins` or open a new session, then use `/mcp` to authenticate the matching Tasky server if necessary.
- Run the read-only `bt_context_get_profile` tool and verify the expected organization. Confirm the MCP endpoint with `status`; a profile alone may not distinguish two environments containing the same organization.

An already open conversation can retain its previous tools until it is reloaded. Authentication errors do not trigger an automatic environment change.

### Failure recovery

The helper operates only on Tasky plugins and Tasky marketplaces owned by this repository. Claude changes use `--scope user`, preserve plugin data, and reject Tasky installations in project/local/managed scopes rather than removing them. Foreign marketplaces using the same names are reported without modification. Other plugins remain untouched.

Before replacing Tasky, the helper snapshots its **installed payload**, version and enabled state in `.tasky-runtime/recovery/`. If installation or verification fails, it reinstalls that snapshot and verifies the restored state. A recovered marketplace points to the retained snapshot; the next successful switch returns it to the normal source. Do not delete a runtime/recovery directory while a client marketplace still uses it.

Installations use the native CLIs. Since the current Codex CLI has no plugin enable/disable command, restoring a disabled plugin (or enabling a selected disabled plugin) updates only that Tasky plugin's explicit `enabled` boolean in Codex's user config. An unrecognized config layout is reported as an error rather than rewritten.

If restoration also fails, the output reports the current known state, retained snapshot path and recovery commands. If state cannot be inspected, it is reported as unknown. With both clients selected, a failure in one does not undo a successful change in the other. Any failed client produces exit code `1`; full success produces `0`.

An exclusive `.tasky-runtime/environment.lock` prevents concurrent switches. If a process is interrupted after changes begin, inspect both clients with `status` and use the retained recovery snapshot as needed. Remove only the lock file after verifying that its recorded process has stopped, then rerun the selector. Snapshot directories are retained for recovery and are never committed.

### Environment-selector tests

```bash
node --test scripts/environment/environment.test.mjs
node scripts/validate-plugin.mjs
```

Tests use simulated CLIs and temporary directories. They do not access real client credentials or change your installations. CI runs these tests alongside plugin validation. For manual acceptance, use Local → PROD → Local in each client, reload/authenticate through the client, and check the read-only profile and configured endpoint after each switch.

## Verify Codex

Check MCP configuration:

```bash
codex mcp list
codex mcp login bottasker-tasky
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
claude plugin details bottasker-tasky@bottasker-tasky
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
- `bottasker-connection-guide`: OAuth sign-in, organization selection, scope elevation, explicit errors, reauthorization, and revocation.
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
