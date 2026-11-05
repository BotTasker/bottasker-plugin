# Tasky 0.2.42: native MCP release

This release uses direct Streamable HTTP MCP with the host's native OAuth and tool discovery. It retains all 353 public operations and 16 skills. It does not ship the experimental local executor or depend on Cloudflare execution. Existing registered-app package profiles remain separate.

## Release contents

- Three manifests move together from 0.2.41 to 0.2.42; the changelog and native version headers match.
- Every skill explains deferred native loading while preserving in-app Tasky's supplied runtime tools. The router distinguishes native schema loading from BotTasker semantic capability discovery.
- Preserve the Files operational guidance already deployed in Core when synchronizing the newer solution terminology from plugin `testing`.
- Native transport declarations keep the endpoint and OAuth discovery. Only `x-bottasker-native-protocol: 1` and `x-bottasker-plugin-version: 0.2.42` are static headers. They are compatibility identifiers, never credentials or proof of approval.
- The default package profile is `direct`; `submission` still imports the portal's explicit OAuth declaration, and registered-app packages exclude duplicate MCP servers.

## Companion Core change

Core publishes `bottasker/operation` metadata and `anthropic/requiresUserInteraction: true` for the existing 120 sensitive tools. Their public descriptors also set `destructiveHint: true`, which native Codex uses for consent under its automatic tool policy. Five explicitly sensitive writes previously lacked that hint: process approval, payment evidence, marking a cart paid, removing a cart item and submitting a WhatsApp template. Effects, scopes, input/output schemas and business handlers remain unchanged.

All authorization remains server-side: OAuth scopes, authenticated organization, resource/solution checks, service policies and seeded roles. Native approval is an additional client control; the plugin does not alter the user's or administrator's permission settings.

Incompatible declared native versions/protocols receive an actionable `MCP_PLUGIN_UPDATE_REQUIRED` error before any business handler. The message is provided in English, Spanish or Portuguese. It is text plus MCP error metadata, avoiding strict successful output-schema validation of an error envelope.

Existing standard MCP clients without Tasky transport headers remain compatible. The previous local executor remains usable until an operator explicitly enables `BOTTASKER_MCP_ENFORCE_NATIVE_PLUGIN=true` in Core after the native rollout. Once enabled, every call from that retired transport returns the update instruction. Do not enable the flag before publishing and verifying the native package.

## Validation and production gates

Validated native clients: Codex app runtime 0.165.0-alpha.1.2 and Claude Code 2.1.318. Native code-mode search is experimental in the tested Codex runtime. Do not claim support for all older versions or unlimited tool catalogs.

The acceptance checks cover native inventory/search for 353/353 names, OAuth profile reads, explicit human acceptance/rejection, candidate skill loading, and denial of a no-effect local sensitive fixture. Business writes/destructive operations are checked offline or against fake services; no real business mutation is needed to validate the release. Core also checks all 353 incompatible calls over local HTTP and the three scope combinations (1,059 decisions).

Before promoting:

1. Review and merge both feature PRs into `testing`; their source branches originate independently from each repository's `testing` base.
2. Deploy the companion Core candidate to the intended test environment with the cutover flag absent/false. Verify 353 tools, 120 native approval descriptors and the expected authenticated organization/permissions.
3. Publish/distribute the 0.2.42 native plugin only through the existing selected channel after its review. A generated ZIP or a local Codex marketplace does not update ChatGPT's cloud plugin. Native client identity/configuration changes can require one normal OAuth reauthorization; never copy tokens between connections.
4. Pilot both clients with native discovery, a read and acceptance/rejection of a no-effect diagnostic. Confirm approval settings were not relaxed. For broader Codex rollout, verify the installed client provides native search; retain fallback for unsupported clients.
5. Prepare the repository's normal `testing` → production promotion after those checks. Merging the feature PRs does not deploy production by itself.
6. Retire the old local transport only after users have an update path, by explicitly enabling the cutover flag. Recheck that a rejected/obsolete call performs no business action.

Rollback: disable the cutover flag first; retain the prior installed plugin/worktrees and authenticated connections. Revert the plugin release or companion Core commit through normal reviewed deployment if necessary. There are no database migrations or policy/role seed changes to undo. Do not automatically uninstall another Tasky variant or change an unrelated plugin.

## Maintainer checks

```sh
node scripts/validate-plugin.mjs
node --test scripts/codex-package.test.mjs scripts/environment/environment.test.mjs
node scripts/build-codex-package.mjs direct
claude plugin validate plugins/bottasker-tasky
```

Core skill synchronization must use `BOTTASKER_TASKY_SKILLS_DIR` pointing to this exact source checkout, with one patch increment for each of the 16 changed skill manifests. The generated prompt strings must match the plugin's `SKILL.md` files byte for byte.
