# Tasky by BotTasker

Tasky combines BotTasker skills with the hosted MCP at `https://api.bottasker.ai/mcp` for Codex and Claude Code.

During private development, the Codex package loads the hosted BotTasker MCP directly. The registered Tasky App will be linked only after it is eligible for the current Codex account; linking an ineligible private App can hide the otherwise valid bundled MCP server from the plugin UI.

After installing from the client plugin catalog, sign in to BotTasker, select an organization, and approve **Trabajo seguro**. No repository clone, terminal setup, environment variable, or API key is required.

Codex and Claude Code renew the short-lived access token automatically with a rotating refresh token. A browser login should reappear only for the initial connection, permission elevation, revocation, or a terminal refresh-token failure. The initial browser consent must finish before Tasky-dependent work begins; an open or expired consent page is not an authenticated connection.

The initial connection includes reading, planning, and reversible writes allowed by the user's BotTasker role. Destructive tools stay hidden until a separate permission elevation and still require explicit confirmation before use.

Authentication, permission, module, validation, and tool failures remain explicit errors. Tasky does not silently fall back to an API key or report simulated progress or success.

The Clientes skill covers native client apps, prospects, contacts, history, tasks, segments, imports and contextual AI follow-up. Its canonical `bt_clients_*` tools are shared with in-app Tasky and require the companion backend release. Updating the plugin alone does not add tools to an older MCP server. Existing organization/app roles remain authoritative; configuration does not start retroactive campaigns.

- Website: https://bottasker.ai
- Support: https://bottasker.ai/contact
- Privacy: https://bottasker.ai/privacy
- Terms: https://bottasker.ai/terms
