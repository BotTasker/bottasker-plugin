# Tasky by BotTasker

Tasky combines BotTasker skills with the hosted MCP at `https://api.bottasker.ai/mcp` for Codex and Claude Code.

In Codex, the production plugin is also linked to the registered Tasky App. This lets Codex show and manage the connected BotTasker account while the plugin continues to provide its bundled skills and MCP tools. Generated local-development variants intentionally omit that production App link.

After installing from the client plugin catalog, sign in to BotTasker, select an organization, and approve **Trabajo seguro**. No repository clone, terminal setup, environment variable, or API key is required.

Codex and Claude Code renew the short-lived access token automatically with a rotating refresh token. A browser login should reappear only for the initial connection, permission elevation, revocation, or a terminal refresh-token failure. The initial browser consent must finish before Tasky-dependent work begins; an open or expired consent page is not an authenticated connection.

The initial connection includes reading, planning, and reversible writes allowed by the user's BotTasker role. Destructive tools stay hidden until a separate permission elevation and still require explicit confirmation before use.

Authentication, permission, module, validation, and tool failures remain explicit errors. Tasky does not silently fall back to an API key or report simulated progress or success.

- Website: https://bottasker.ai
- Support: https://bottasker.ai/contact
- Privacy: https://bottasker.ai/privacy
- Terms: https://bottasker.ai/terms
