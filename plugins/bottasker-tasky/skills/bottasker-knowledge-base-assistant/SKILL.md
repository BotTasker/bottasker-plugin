---
name: bottasker-knowledge-base-assistant
description: "Use when the user wants to create, inspect, configure, query, troubleshoot, or attach BotTasker Knowledge Base to AI Agents: knowledge documents, text or URL knowledge sources, uploads, semantic search, `bt_knowledge_*` MCP tools, `knowledge_documents`, `knowledge-worker`, and the Knowledge Base tool that is added to agents."
---

# BotTasker Knowledge Base Assistant

Use this skill as the specialist for BotTasker Knowledge Base. Knowledge Base has two related surfaces: the operational module that stores/processes knowledge sources, and the AI Agent tool that lets an agent query one configured knowledge source through semantic search.

For implementation details and failure modes, read `references/knowledge-base-architecture.md`.

## Mandatory Flow

1. Call `bt_context_get_profile`.
2. Resolve `appId` when the work is app-scoped.
3. Use `bt_mcp_find_tools` or `bt_mcp_list_skills`/`bt_mcp_load_skill` before assuming concrete MCP tool availability.
4. List existing knowledge documents before creating new ones or attaching one to an agent.
5. If configuring an AI Agent, also route through `bottasker-ai-agent-architect` rules: discover the Knowledge Base agent item, prepare config, validate config, add the item, then verify with a read-back.
6. Ask for explicit confirmation before removing a knowledge document, deleting embeddings, or removing an agent item.

## Core Concepts

- The backend knowledge module stores organization/app-scoped records and processes each source into embeddings.
- A knowledge record state can be `pending`, `processing`, `ready`, or `error`. Treat only `ready` records as usable by agents.
- Creation paths include uploaded files, text/markdown documents, and URLs.
- Runtime retrieval uses semantic search over embeddings, not keyword-only lookup.
- Adding or uploading knowledge does not automatically give an AI Agent access. The agent must have the Knowledge Base tool equipped.
- The Knowledge Base agent tool is implemented by `knowledge-worker`, action key `knowledge`, action type `mcp_bt`.
- The required config key for the agent tool is `knowledge_documents`; its selected value must be the knowledge id.
- The runtime tool exposed to the agent is usually `mcp_knowledge_queryKnowledge`, with `query` and optional `limit`.

## Operational Tasks

Use these tool families when available:

- `bt_knowledge_list` to inspect existing knowledge.
- `bt_knowledge_create_document` to create text or markdown knowledge.
- `bt_knowledge_add_web_url` to add URL knowledge.
- `bt_knowledge_query` to test retrieval against a knowledge source.

For file uploads, use the app/API upload path exposed by the active environment; in the web app this is `/upload-document-knowledge`.

After creating knowledge, verify state before using it:

- `pending` or `processing`: report that ingestion is still running and do not attach as ready.
- `ready`: safe to query or attach.
- `error`: inspect/report the processing error and do not pretend the source is searchable.

## Attaching Knowledge To Agents

1. Resolve the target app and target AI Agent.
2. List current agent items to avoid duplicates.
3. Discover available agent tools with `bt_ai_agent_tools_discover`; search terms such as `knowledge` or `base de conocimiento` should reveal Knowledge Base if available.
4. Get the tool config schema with `bt_ai_agent_tool_get_config_schema`.
5. Prepare config with `bt_ai_agent_prepare_item_config`, passing the selected knowledge id for `knowledge_documents`.
6. Validate with `bt_ai_agent_validate_item_config`.
7. Add with `bt_ai_agents_add_item` using `itemType: "tool"` and the correct `agentTargetId`.
8. Verify with `bt_ai_agents_get`, `bt_ai_agents_list_items`, or `bt_action_instances_get_details` when available.

Do not pass the visible document label where the id is required. Do not claim the agent can search all knowledge records unless the discovered schema supports that; the current worker binds the tool to the selected `knowledge_documents` value.

## Runtime Guidance

When an agent has Knowledge Base equipped, instruct it to query before answering questions likely covered by manuals, policies, FAQs, internal instructions, or uploaded documents. After querying, respond naturally and briefly; do not expose raw JSON unless the user asks for diagnostics.

If no result is found, say that the configured knowledge source did not contain enough information and ask for a follow-up or escalation path instead of inventing an answer.

## Safety Rules

- Never invent organization, app, agent, action instance, or knowledge ids.
- Preserve app and organization scoping; BotTasker MCP resolves organization from credentials.
- Do not use Knowledge Base for transactional state. Use Base de datos (Data Hub) for records and mutable process data.
- Confirm before remove/delete operations.
- Treat knowledge content as sensitive business data and summarize only what the user is allowed to access.

## Common Errors

- `Need actionKey`: the worker was called without the action key.
- `Knowledge ID is required`: `knowledge_documents.value` is missing.
- Empty retrieval: wrong organization/app scope, wrong knowledge id, missing embeddings, document not `ready`, or vague query.
- Agent configured but not querying: item not attached to the correct target agent, config validation was skipped, or the agent prompt does not tell it to use tools for source-specific answers.
