---
name: bottasker-connection-guide
description: Use when connecting Tasky to BotTasker, selecting an organization, handling OAuth scopes, reauthorizing, revoking access, or diagnosing MCP authentication and permission errors in Codex or Claude Code.
---

# BotTasker Connection Guide

Use the client's native OAuth flow. The normal connection requires only installing Tasky, signing in to BotTasker, selecting an organization, and approving the requested access. Never ask a nontechnical user to copy an API key, configure an environment variable, clone a repository, or edit an MCP configuration file.

## Permission Model

- `mcp:read` allows reading and planning.
- `mcp:write` allows non-destructive, reversible writes.
- `mcp:destructive` is not part of the initial safe grant. Request it only when a destructive operation is necessary and the user has explicitly agreed to that operation.
- BotTasker roles and app permissions still apply after OAuth scope checks. A scope never overrides tenant, role, app, or module authorization.

## Error Handling

- Diagnose from the exact transport or MCP error before explaining the cause. Do not infer endpoint availability from an authentication failure.
- `401`, `AuthorizationRequired`, `invalid_token`, `invalid_grant`, `invalid_target`, and refresh-token resource mismatches mean the installed MCP connection must be authenticated or reauthenticated. They do not mean the BotTasker server is stopped.
- `ECONNREFUSED`, connection refused, DNS resolution failures, and transport timeouts mean the configured endpoint could not be reached. Only these reachability errors justify saying the local or hosted server appears unavailable.
- `403` with `INSUFFICIENT_SCOPE` means the connection is valid but needs the returned scope. Explain the requested elevation and let the client run the OAuth step-up flow.
- A BotTasker policy or module error is not an OAuth failure. Preserve its code and message and explain the missing role, app, module, or resource prerequisite.
- Reauthenticate the same installed environment. If the active plugin or MCP server is `bottasker-tasky-local` or its visible name contains `(Local)`, keep the user on local and use the client's native reconnect action or `codex mcp login bottasker-tasky-local`. Do not recommend uninstalling it or switching to production merely because OAuth failed.
- For the hosted `bottasker-tasky` server, reauthenticate that same hosted connection. Never claim that a hosted/public plugin exists or is available in a catalog unless the current client catalog has verified it.
- Never retry with an API key after OAuth fails unless the user explicitly configured a legacy service-account integration.
- Never describe an error as feedback, progress, or success. Do not fabricate a module, credential, resource, write, submission, or verification result.
- Retry only after applying a concrete correction. If the result remains ambiguous, read back the resource; if that also fails, report the verification error and leave the state unknown.

## Client Recovery

- In Codex, use the MCP connection's native **Authenticate** action or run `codex mcp login <installed-server-name>`. After successful authentication, retry the original operation before proposing any environment change.
- In Claude Code, reconnect the same installed MCP server through its native authentication flow, then retry the original operation.
- Ask the user to open a new conversation only when the client has authenticated successfully but the current conversation still has a stale tool snapshot.
- When recovery succeeds, continue the user's original request. Do not require a ceremonial confirmation such as “listo” unless the client genuinely needs a new user turn to refresh its tools.

## Revocation

The user can revoke Tasky under BotTasker **Conexiones → Asistentes de IA** or clear authentication in the client. Revocation invalidates the grant for the next MCP request.
