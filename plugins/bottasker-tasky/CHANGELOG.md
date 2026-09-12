# Changelog

## 0.2.1

- Distinguished expired pending consent from expiry of an authenticated access token.
- Required Codex and Claude Code to rely on native automatic refresh before requesting interactive authentication.
- Required Tasky to wait for native login completion and verify an MCP call before continuing BotTasker-dependent work.
- Prevented restart or new-conversation guidance from being used as the normal OAuth refresh path.

## 0.2.0

- Replaced manual API-key configuration with the hosted OAuth-enabled BotTasker MCP.
- Added the Tasky connection guide for login, organization selection, scopes, reauthorization, revocation, and explicit error handling.
- Aligned Codex and Claude Code identity, version, licensing, and shared skills.
- Added process design support and synchronized agent metadata.
- Declared the rule that errors remain errors and fallbacks are used only when explicitly supported and truthful.

## 0.1.1

- Added the first shared Tasky skills and local beta marketplaces for Codex and Claude Code.
