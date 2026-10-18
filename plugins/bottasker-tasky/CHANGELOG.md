# Changelog

## 0.2.15

- Added the portable Agent Plugins manifest and Streamable HTTP MCP configuration alongside the supported Codex and Claude compatibility files.
- Declared OAuth with CIMD preference, safe initial scopes, and the existing connection guide as the onboarding skill.
- Corrected public legal/support URLs, shortened the directory subtitle, and removed the unsupported implication that Tasky already renders interactive MCP UI.
- Included five positive and three negative review scenarios; these are reviewer instructions, not claims of completed acceptance tests.
- Added separate submission and registered-app package builds. A connected build requires the personal plugin's exact technical ID; it never assumes the old private registration is available.
- Kept portable Local manifests and OAuth resources aligned with the separate localhost runtime.

## 0.2.14

- Fixed the companion in-app Tasky runtime so an explicitly closed execution phase is not rejected as a progress-only final reply. Verified writes and the real completed/partial/blocked/failed phase result survive without replaying write tools.
- This companion Core fix supports multi-phase creation and configuration of native Clientes apps; the shared skill instructions and client permissions remain unchanged.

## 0.2.13

- Added the Clientes specialist for building apps around native prospects, contacts, states, custom fields, history, tasks, segments, imports and contextual AI follow-up.
- Connected Clients routing with App Builder and AI Agent Architect; the equipped Clients tool automatically supplies follow-up instructions without an extra administrator prompt.
- The companion Core change exposes app-scoped Clients tools through the canonical MCP authorization/approval chain and synchronizes the internal Tasky prompt. It preserves one next pending task, contextual stop/reply rules and non-retroactive activation.

## 0.2.12

- Updated the Codex and Claude Code package versions together to track Tasky's first-app onboarding release.
- The companion onboarding UI is implemented in BotTasker Web ([frontend PR #400](https://github.com/BotTasker/frontend-web/pull/400)): a generic first-app invitation, template selection on the existing creation screens, blue popovers with white text and letter-by-letter narration, a sequential wave across template cards, and a draggable mascot, pointer and popover.
- The web guide asks for confirmation before closing, can be minimized and restored, and pauses while a user reviews template details without losing the current step or reading position.
- After creating a Ventas B2C app, Tasky presents a short introduction inside Configurar app before showing its configuration steps.
- This package update changes release metadata only. Skills, prompts, MCP configuration and runtime capabilities are unchanged; updating the plugin alone does not enable the web onboarding UI.

## 0.2.8

- Taught Tasky how to design and create Base de datos `sequence` fields with flat MCP parameters, supported pattern variables, reset rules, timezone behavior, and verification steps.
- Marked sequence values as server-generated and read-only so agents, workflows, forms, and record writes never attempt to supply them manually.

## 0.2.7

- Removed the ineligible private App mapping from the active Codex package so it cannot suppress the bundled MCP server.
- Kept the hosted BotTasker MCP and all 14 Tasky skills as the development package runtime surface.
- Deferred connected-account UI until the registered Tasky App is eligible for the current Codex account.

## 0.2.6

- Made the private registered Tasky App an optional dependency during development.
- Preserved the bundled MCP server when the registered App is not yet eligible or available to the current Codex account.

## 0.2.5

- Declared the Codex MCP transport and OAuth resource explicitly so Tasky is surfaced as an authenticated plugin server.
- Kept the registered App mapping, hosted MCP endpoint, and bundled skills in the same plugin package.

## 0.2.4

- Linked the Codex plugin to the registered Tasky App so Codex can manage and display connected BotTasker accounts.
- Kept the bundled MCP server and all Tasky skills available alongside the registered App.
- Prevented generated local-development plugins from inheriting the production App registration.

## 0.2.3

- Taught Tasky how to discover, configure, preserve, and verify optional human response timing on WhatsApp, Telegram, WebChat, Instagram, and Messenger Response outputs.
- Documented the dynamic content-based delay, configurable cap, best-effort typing indicators, and cancellation of obsolete delayed responses.

## 0.2.2

- Added app-scoped conversation lookup, activity, and recent-message guidance for AI Agents and workflows.
- Documented ambiguity handling, pagination, sanitization, and the separation between agent tools and workflow nodes.
- Required every Tasky capability, skill, prompt, instruction, or agent-metadata change to increment the plugin patch version for Codex and Claude Code and to synchronize the internal DeepAgent prompts.

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
