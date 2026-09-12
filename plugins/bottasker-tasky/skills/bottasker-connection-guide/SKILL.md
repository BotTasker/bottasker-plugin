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
- Distinguish an authorization request from an authenticated session. `expired_request` means the browser consent was not completed before its pending request expired; no access or refresh token was issued. Restart that pending login, but never describe it as an authenticated session that lost authorization.
- A short-lived access token expiring is normal. Codex and Claude Code must use the connection's refresh token automatically and replace it when BotTasker rotates it. Do not ask the user to sign in merely because an access token reached its expiry.
- On `401` or `invalid_token`, allow the native MCP client to perform its automatic refresh and retry the original operation once. Request interactive authentication only when the client reports that refresh is unavailable or failed terminally.
- `invalid_grant` from the token endpoint, a revoked connection, an expired refresh token, or a refresh-token resource mismatch requires reauthentication of the same installed environment. `invalid_target` requires correcting the configured MCP resource before retrying. None of these errors means the BotTasker server is stopped.
- `ECONNREFUSED`, connection refused, DNS resolution failures, and transport timeouts mean the configured endpoint could not be reached. Only these reachability errors justify saying the local or hosted server appears unavailable.
- `403` with `INSUFFICIENT_SCOPE` means the connection is valid but needs the returned scope. Explain the requested elevation and let the client run the OAuth step-up flow.
- A BotTasker policy or module error is not an OAuth failure. Preserve its code and message and explain the missing role, app, module, or resource prerequisite.
- Reauthenticate the same installed environment. If the active plugin or MCP server is `bottasker-tasky-local` or its visible name contains `(Local)`, keep the user on local and use the client's native reconnect action or `codex mcp login bottasker-tasky-local`. Do not recommend uninstalling it or switching to production merely because OAuth failed.
- For the hosted `bottasker-tasky` server, reauthenticate that same hosted connection. Never claim that a hosted/public plugin exists or is available in a catalog unless the current client catalog has verified it.
- Never retry with an API key after OAuth fails unless the user explicitly configured a legacy service-account integration.
- Never describe an error as feedback, progress, or success. Do not fabricate a module, credential, resource, write, submission, or verification result.
- Retry only after applying a concrete correction. If the result remains ambiguous, read back the resource; if that also fails, report the verification error and leave the state unknown.

## Client Recovery

- In Codex, use the MCP connection's native **Authenticate** action or run `codex mcp login <installed-server-name>`. Keep the login process alive, ask the user to complete the browser consent, and wait until the process exits successfully. Do not continue implementation that depends on BotTasker while authorization is still pending.
- In Claude Code, reconnect the same installed MCP server through its native authentication flow and wait for explicit success before continuing work that depends on BotTasker.
- Authentication is successful only after the native client reports success and the original MCP operation succeeds. An open consent page, a pending CLI process, or a browser callback by itself is not proof that tools are ready.
- After successful authentication, retry the original operation in the current conversation first. Do not ask the user to restart Codex or Claude Code as the normal refresh path.
- Ask the user to open a new conversation only when the client has authenticated successfully but the current conversation still has a stale tool snapshot.
- When recovery succeeds, continue the user's original request. Do not require a ceremonial confirmation such as “listo” unless the client genuinely needs a new user turn to refresh its tools.

## Revocation

The user can revoke Tasky under BotTasker **Conexiones → Asistentes de IA** or clear authentication in the client. Revocation invalidates the grant for the next MCP request.
