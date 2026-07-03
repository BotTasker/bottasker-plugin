# BotTasker Knowledge Base Architecture

## Backend Service

Canonical source in the main BotTasker codebase: `bottasker-core/src/services/records/knowledge.service.ts`.

The service name is `knowledge`. It stores organization/app-scoped knowledge records with fields such as `fileName`, `fileType`, optional `fileSize`, storage fields (`bucket`, `bucketPath`, `url`), `state`, optional `error`, required `organization`, optional `appId`, and optional `crawlOptions`.

Valid processing states are:

- `pending`
- `processing`
- `ready`
- `error`

Reads and writes are scoped by organization and, when available, by app. Creation requires a scoped app id.

## Creation Paths

Uploaded files use the web/API upload path `/upload-document-knowledge`, which calls the backend upload flow. The service validates the file type, stores the object in the configured GCP documents bucket, creates a `pending` record, and emits `knowledge.process.document`.

Text documents use `knowledge.createTextDocument`. The MCP-facing tool is `bt_knowledge_create_document`. It accepts `title`, `content`, and optional `format`.

Web URLs use `knowledge.addWebUrl`. The MCP-facing tool is `bt_knowledge_add_web_url`. It accepts `url`, `title`, optional `crawlSubpages`, and optional `maxPages`.

The MCP-facing registry also exposes:

- `bt_knowledge_list` -> `knowledge.list`
- `bt_knowledge_create_document` -> `knowledge.createTextDocument`
- `bt_knowledge_add_web_url` -> `knowledge.addWebUrl`
- `bt_knowledge_query` -> `knowledge.queryKnowledge`

## Processing And Embeddings

The `knowledge.process.document` event handler resolves the document, marks it `processing`, processes the content by source type, and marks it `ready`. On failure, it marks the record `error` and stores the error message.

Files are downloaded from GCP and text is extracted from TXT, PDF, or DOCX. Text documents use the provided content. URLs can crawl the root page and, when configured, subpages.

Content is split with `RecursiveCharacterTextSplitter` using chunk size 1000 and overlap 200. Chunks are embedded with OpenAI `text-embedding-3-small`.

Embeddings are stored in MongoDB collection `embeddings` with fields such as `organizationId`, `knowledgeId`, `sourceType`, `fileName`, `chunkIndex`, `text`, `embedding`, `createdAt`, `version`, and optional `page`.

Deleting a knowledge record also deletes embeddings by `knowledgeId`. File-backed records can also delete the object from GCP.

## Querying

`knowledge.queryKnowledge` requires `query`, `organizationId`, and `knowledgeId`; `limit` defaults to 5.

Querying embeds the user query with `text-embedding-3-small`, filters embeddings by `organizationId` and `knowledgeId`, computes dot-product similarity, sorts descending, limits results, and returns projected chunks including `knowledgeId`, `fileName`, `text`, optional `page`, `chunkIndex`, and `similarity`.

When diagnosing weak answers, check:

- the knowledge record exists in the same organization and app scope;
- the record state is `ready`;
- embeddings exist for the selected `knowledgeId`;
- the runtime sends the correct organization id;
- the agent tool config uses the knowledge id, not the label;
- the query is specific enough for semantic retrieval.

## AI Agent Worker

Canonical source in the main BotTasker codebase: `bottasker-core/src/services/mcp-workers/knowledge/knowledge.service.ts`.

The service name is `knowledge-worker`, with worker key `knowledge`, type `knowledge`, and action `Knowledge Base`.

Important metadata:

- `actionKey`: `knowledge`
- `actionType`: `mcp_bt`
- icon: `/assets/knowledge/icons/knowledge.svg`
- schema key: `knowledge_documents`
- schema type: `server_choice`
- schema action: `v1.knowledge-worker.availableDocuments`
- target handle joins with `addon`

`availableDocuments` requires `organization`, accepts optional `appId`, and returns documents as `{ id, label, value }`, where `label` is the file name and `value` is the knowledge id.

`getTools` requires `actionKey`. For action `knowledge`, it reads `params.config.knowledge_documents.value`. If missing, it throws `Knowledge ID is required`.

The runtime tool is `mcp_knowledge_queryKnowledge` unless a custom prefix is provided. It accepts:

- `query`: required string;
- `limit`: optional number, default 5.

The tool calls `knowledge.queryKnowledge` with `query`, `limit`, selected `knowledgeId`, and workflow organization id. It returns a JSON string with the results or an error object.

## Discovery And Attachment

Canonical source in the main BotTasker codebase:

- `bottasker-core/src/services/bottasker-mcp/tool-registry.ts`
- `bottasker-core/src/services/bottasker-mcp/tool-registry.spec.ts`

The tool registry can discover Knowledge Base as an AI Agent item. Tests verify that searches for `knowledge` and `base de conocimiento` can return the Knowledge Base item with:

- `itemType`: `tool`
- related module key `knowledge`
- contract target resource `ai_agents`
- required config key `knowledge_documents`

When adding Knowledge Base to an agent, identify the target agent, select a valid knowledge document/base, prepare and validate config, add the tool to the correct `agentTargetId`, and verify by reading back the agent items.

## Frontend

Canonical path in the main BotTasker codebase: `bottasker-web/src/app-modules/knowledge/`.

The list view displays document cards and includes search. The basic create drawer uploads one file with `multipart/form-data` to `/upload-document-knowledge`. The web drawer submits URL and title through `knowledge.addWebUrl` when that UI is enabled. Document cards use websocket actions such as `knowledge.remove` for deletion.

## Voice Runtime

Canonical source in the main BotTasker codebase: `bottasker-core/src/services/communication/call-media.service.ts`.

When runtime tool names include `knowledge`, voice-call tool instructions tell the assistant to query Knowledge Base first when the user asks for information that may be in the configured knowledge source. The assistant should then answer briefly and naturally, not by reading raw JSON.
