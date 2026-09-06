# Tasky plugin review matrix

## Installation

- Install from a clean Codex profile and a clean Claude Code profile.
- Confirm that installation does not request an API key, environment variable, repository clone, or terminal configuration.
- Complete browser OAuth, choose an organization, and return to the client.

## Authorization

- `mcp:read` exposes read and planning tools.
- `mcp:write` exposes reversible writes only.
- Destructive tools remain hidden until a separate `mcp:destructive` grant is approved.
- Revoking the connection in BotTasker makes the next MCP request return `401`.
- A token issued for another audience or organization is rejected.

## Tool behavior

- Read the authenticated profile and list available apps.
- Create one reversible test resource and verify it with a read-back.
- Attempt a destructive tool without elevation and expect `403 insufficient_scope`.
- Trigger a validation error and confirm it remains an explicit tool error rather than feedback or simulated success.
- Trigger a policy-denied operation and confirm the BotTasker permission error remains visible.

## Reviewer materials still supplied outside source control

- Verified OpenAI and Anthropic publisher accounts.
- Temporary reviewer account and organization.
- Final catalog screenshots captured from the production OAuth flow.
- Country availability and policy attestations entered in each submission portal.
