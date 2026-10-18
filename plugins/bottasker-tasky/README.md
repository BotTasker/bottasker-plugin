# Tasky by BotTasker

Tasky combines BotTasker skills with the hosted MCP at `https://api.bottasker.ai/mcp` for Codex and Claude Code.

Tasky's skills follow the user's conversation in Spanish, Brazilian Portuguese or English, including explicit language changes. Content can use a separately requested language. Existing resource names, technical identifiers and stored values remain unchanged unless the user requests their translation. The package includes listing translations for `en-US`, `es-PE` and `pt-BR`; their display in the directory depends on OpenAI's localization support. BotTasker web pages use their own UI translations.

The standard package loads the hosted BotTasker MCP directly and declares the connection guide as its setup skill. A separate connected build links a personal registered app available to the current Codex account; linking an unavailable app can hide the bundled MCP from the plugin UI. Personal registration and button-based connection can be tested before public marketplace publication.

Repository installations use native OAuth discovery and a transport-only portable MCP declaration compatible with the current desktop loader. The portal submission ZIP separately includes explicit OAuth registration, resource and scope settings; it is intended for upload to OpenAI rather than installation as a local desktop marketplace.

After installing from the client plugin catalog, sign in to BotTasker, select an organization, and approve **Trabajo seguro**. No repository clone, terminal setup, environment variable, or API key is required.

Codex and Claude Code renew the short-lived access token automatically with a rotating refresh token. A browser login should reappear only for the initial connection, permission elevation, revocation, or a terminal refresh-token failure. The initial browser consent must finish before Tasky-dependent work begins; an open or expired consent page is not an authenticated connection.

The initial connection includes reading, planning, and reversible writes allowed by the user's BotTasker role. Destructive tools stay hidden until a separate permission elevation and still require explicit confirmation before use.

Authentication, permission, module, validation, and tool failures remain explicit errors. Tasky does not silently fall back to an API key or report simulated progress or success.

The Clientes skill covers native client apps, prospects, contacts, history, tasks, segments, imports and contextual AI follow-up. Its canonical `bt_clients_*` tools are shared with in-app Tasky and require the companion backend release. Updating the plugin alone does not add tools to an older MCP server. Existing organization/app roles remain authoritative; configuration does not start retroactive campaigns.

- Website: https://bottasker.ai
- Support: https://bottasker.ai/es/contacto/
- Privacy: https://bottasker.ai/es/politica-privacidad/
- Terms: https://bottasker.ai/es/terminos-condiciones/
