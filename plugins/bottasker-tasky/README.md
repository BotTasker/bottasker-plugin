# Tasky by BotTasker

Tasky combines BotTasker skills with the hosted MCP at `https://api.bottasker.ai/mcp` for Codex and Claude Code.

Tasky's skills follow the user's conversation in Spanish, Brazilian Portuguese or English, including explicit language changes. Content can use a separately requested language. Existing resource names, technical identifiers and stored values remain unchanged unless the user requests their translation. The package includes listing translations for `en-US`, `es-PE` and `pt-BR`; their display in the directory depends on OpenAI's localization support. BotTasker web pages use their own UI translations.

The default OpenAI installation is **App + 15 skills**, including installations sourced from GitHub. The package builder defaults to `connected`, requires the actual identity of an app available to the current account, and removes all bundled direct-MCP declarations. Without an accessible registration, resolve that prerequisite instead of falling back to MCP. Direct MCP remains an explicit compatibility route for Claude Code, other agents, or users who specifically request it.

For client-specific commands and an installation prompt for Codex, ChatGPT, Claude Code and other agents, read the [repository installation guide](https://github.com/BotTasker/bottasker-plugin#instalación-para-codex-chatgpt-claude-code-y-otros-agentes). Choose one Tasky variant per client. The connected OpenAI package should resolve one registered app, 15 enabled skills and its OAuth account; an MCP-only client does not automatically install the skills or provide that account UI. A deleted app requires a new accessible registration before rebuilding the connected package.

Installing a local Codex package does not update ChatGPT's cloud plugin. For ChatGPT, download the existing plugin ZIP from its page, generate `chatgpt-update --existing-plugin-zip=/absolute/path/plugin.zip` with the repository's packaging script, and upload that output through **More actions → Upload new version** on the same plugin. This preserves its technical name and registered OAuth app while adding the 15 skills. Verify **Apps 1**, **Skills 15**, the current release version and the connected account in ChatGPT itself. Do not infer cloud skill installation from a description or local files. The separate `submission` ZIP is for the official **With MCP** application and must not contain personal app references.

OpenAI repository installations use the generated App + skills package and the registered app's OAuth. Direct-MCP compatibility installations use native OAuth discovery. The explicit `submission` ZIP includes the MCP endpoint and OAuth registration settings required by OpenAI's portal; it is not the default desktop installation package.

After installing from the client plugin catalog, sign in to BotTasker, select an organization, and approve **Trabajo seguro**. No repository clone, terminal setup, environment variable, or API key is required.

Codex and Claude Code renew the short-lived access token automatically with a rotating refresh token. A browser login should reappear only for the initial connection, permission elevation, revocation, or a terminal refresh-token failure. The initial browser consent must finish before Tasky-dependent work begins; an open or expired consent page is not an authenticated connection.

The initial connection includes reading, planning, and reversible writes allowed by the user's BotTasker role. Destructive tools stay hidden until a separate permission elevation and still require explicit confirmation before use.

Authentication, permission, module, validation, and tool failures remain explicit errors. Tasky does not silently fall back to an API key or report simulated progress or success.

The Clientes skill covers native client apps, prospects, contacts, history, tasks, segments, imports and contextual AI follow-up. Its canonical `bt_clients_*` tools are shared with in-app Tasky and require the companion backend release. Updating the plugin alone does not add tools to an older MCP server. Existing organization/app roles remain authoritative; configuration does not start retroactive campaigns.

- Website: https://bottasker.ai
- Support: https://bottasker.ai/es/contacto/
- Privacy: https://bottasker.ai/es/politica-privacidad/
- Terms: https://bottasker.ai/es/terminos-condiciones/
