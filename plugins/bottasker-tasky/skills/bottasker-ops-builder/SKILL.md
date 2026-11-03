---
name: bottasker-ops-builder
description: Use for BotTasker Files/Archivos operations, calendars and public bookings, conversations, messages, calls, and general operational modules. Route Knowledge Base and WhatsApp templates to their specialists.
---

# BotTasker Ops Builder

Use this skill for operational modules after the app and data foundation are known.

## Response language

Support Spanish, Brazilian Portuguese, and English. Follow the user's explicitly requested response language; otherwise use the language of their current request, retaining the established preference when a short or mixed-language message is ambiguous. Apply that language to plans, questions, confirmations, summaries, and explanations of errors, even when a tool returns text in another language. Use the requested language for generated content, which may differ from the conversation language; changing the conversation language does not authorize translating or updating existing records. Preserve tool names, payload keys, enum values, identifiers, existing resource names, and error codes exactly. When referring to a visible product control, keep its actual label when needed to help the user find it.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` for app-scoped modules.
3. List existing resources before creating new ones.
4. Use the module-specific tools:
   - dashboards, tracking, KPIs, control, reporting: delegate to `bottasker-dashboard-architect`
   - boards: delegate to `bottasker-board-architect`
   - forms: delegate to `bottasker-forms-architect`
   - catalogs/products/categories/variants/sales carts: delegate to `bottasker-catalog-architect`
   - calendar, public booking links, booking rules and meeting participants: follow Calendar and public bookings below; discover `bt_calendar_*` capabilities before acting.
   - files: follow Files below; discover the concrete `bt_files_*` operations before acting.
   - knowledge: delegate to `bottasker-knowledge-base-assistant` for Knowledge Base documents, queries, ingestion state, and agent attachments.
   - conversations/messages/calls: `bt_conversations_*`, `bt_messages_*`, `bt_calls_*`
   - WhatsApp templates: delegate to `bottasker-whatsapp-template-architect` for classification, content, components, examples, media, buttons, draft creation, and Meta submission.
5. Preview or run query tools before committing dashboard or reporting structures when tools are available.

## Operating Rules

- Use Base de datos (Data Hub) or Dynamic Tables as the source of truth when dashboards and boards need structured records.
- Use `bottasker-dashboard-architect` for dashboards, tracking, KPIs, control views, reporting, widget strategy, and area-specific dashboard sets.
- Use `bottasker-board-architect` for boards, board sources, columns, detail views, widgets, button automations, public links, roles, and access security.
- Use `bottasker-forms-architect` for public/private forms, submissions, form fields, connector mappings, publishing, and confirmation screens.
- Prefer creating a minimal board or operational resource first, then iterating.
- Use `bottasker-catalog-architect` for product catalogs, categories, variants, modifier groups, properties, availability, product search, and sales cart behavior.
- Use `bottasker-knowledge-base-assistant` for Knowledge Base creation, querying, troubleshooting, and adding Knowledge Base tools to AI Agents.
- Use `bottasker-whatsapp-template-architect` for every WhatsApp template request. It owns Meta rules and the exact tool contracts.
- Ask for confirmation before archive/remove/delete tools or broad status changes.
- Treat conversation tags as app-scoped labels with a reusable catalog. List the catalog before filtering or removing a tag; adding by name creates or reuses the label and assigns its generated color automatically when it is new.
- Filter conversations with tag IDs, not visible names. Multiple tag IDs use OR semantics: a conversation matches when it has at least one selected label.
- Use `bt_conversations_get_tags` before changing a conversation when its current labels are unknown. Use `bt_conversations_add_tags` with `names` to create/reuse and assign labels, and `bt_conversations_remove_tag` to unassign them. `bt_conversations_add_tag` remains only as the legacy single-label alias. Removing a label from a conversation does not delete it from the app catalog.
- AI Agents that receive WhatsApp, Telegram, or WebChat input with automatic conversation registration enabled receive `manage_conversation_tags` at runtime. This tool is already bound to the current conversation; never ask for or invent an internal conversation ID.

## Files

Use this section for the **Archivos** module: browse/search, inspect metadata, create folders, import assets, finish an upload, rename, move or delete. This is separate from configuring an AI Agent's Files tool and from sending media through a conversation channel.

### Discover access and resolve scope

Resolve the target app, then call `bt_mcp_find_tools` with `moduleKey: "files"`, the user's natural-language intent and the required effect. Search reads with `effect: "read"`; ordinary creates/imports with `"write"`; deletion and signed upload initialization with `"destructive"`. Discovering an editor component with `bt_ai_agent_tools_discover` only explains how to equip an agent; it does not execute file operations from this chat.

Use the real callable tool inventory. If discovery returns an operation that the client did not load, distinguish **implemented/discovered** from **callable in this session**. If the discovery tool itself is unavailable, say the available inventory is incomplete/unverified; do not conclude that the backend has no Files capability. Skills explain operations but cannot load missing callable tools by themselves. Never bypass an authorization failure using a worker executor, API integration or another identity.

Use explicit `appId` for an app's files. Do not fall back to the organization root when an app result is empty or forbidden. Organization is supplied by the authenticated connection. Carry real file/folder IDs between operations; names and paths are for discovery, not invented identifiers.

### MCP operation contracts

The four historical operations retain `payload` for compatibility. New operations use top-level fields. Do not infer one shape from the other; inspect discovery's current input schema.

| Operation | Input and observable result |
| --- | --- |
| `bt_files_list` | `{ appId, payload: { parentId? } }`. Omit `parentId` for root. Returns `items`, `parent`, `breadcrumbs` for direct children only. |
| `bt_files_get` | `{ appId, id }`. Reads one file/folder's metadata; does not read the bytes or describe an image. |
| `bt_files_search` | `{ appId, search?, type?, parentId?, limit?, offset? }`. Searches literal case-insensitive names across the app, with optional `type: "file"` or `"folder"`. Omitting `parentId` searches all folders; `parentId: ""` restricts to root. Default limit 25, maximum 100. Continue with returned `nextOffset` only while `hasMore`. Searches names, not document contents. |
| `bt_files_create_folder` | `{ appId, payload: { name, parentId?, reuseExisting? } }`. Read first; `reuseExisting: true` reuses an existing same-named folder and requires read permission. |
| `bt_files_upload_from_url` | `{ appId, url, fileName?, mimeType?, parentId? }`. Downloads and copies a source into **private** Files storage, up to 50 MiB. Requires read/create/update permissions. Rejects private-network URLs and duplicate names. Returns the saved file metadata and ID; never deletes the original or sends it. |
| `bt_files_upload_init` | `{ appId, payload: { name, size, mimeType, parentId?, public? } }`. Reserves metadata and returns `file` plus a signed `uploadUrl`. Size is bytes. `public` defaults false; true is public sharing and needs explicit authorization. This operation requires destructive execution consent because its historical contract supports public uploads. |
| `bt_files_upload_complete` | `{ appId, id }`. Finalizes metadata after a successful PUT of bytes; additionally requires read/update permissions and preserves reserved visibility. It neither transfers bytes nor independently verifies object presence. |
| `bt_files_get_download_url` | `{ appId, payload: { id } }`. Returns `url` and, for private files, `expiresAt` (currently 15 minutes). Does not download, parse or send the file. |
| `bt_files_rename` | `{ appId, id, newName }`. Renames the entry; folder descendant paths change, IDs/bytes remain. Read back the new name/path. |
| `bt_files_move` | `{ appId, id, newParentId? }`. Moves within the same app; omit the destination for root. Folder descendant paths change. Cycles and duplicate destination names are rejected. |
| `bt_files_delete` | `{ appId, ids }`, 1–100 real IDs. Permanent: folder deletion includes descendants and stored bytes. Requires explicit approval/destructive consent. Returns only deleted `ids`; compare with the request and report partial results. Folder deletion is not atomic: an interrupted attempt can already have removed some descendant objects. |

Read/get/search/download need Files read permission; create/import/upload need create (imports and upload finalization also need read/update), rename/move need update, delete needs remove. Backend app/organization authorization remains authoritative. Respect returned pending actions and OAuth scope errors; do not claim that confirmation grants permissions.

### Browse and share existing assets

List root or search by the business name (for example a clinic), inspect candidate folders/files and resolve ambiguous names using actual IDs and paths. Browse the matching folder to locate each intended asset. Metadata is not evidence of image contents. Keep file IDs as durable references and request a fresh download URL when needed; signed links expire and must not be persisted as permanent agent instructions.

To let an agent use these assets, discover, prepare and validate the Files component through `bottasker-ai-agent-architect`. Configure only fields actually exposed by the component: current Files settings include `base_folder`, `enable_list_folder`, `enable_create_folder`, `enable_upload_from_url`, `enable_get_download_url`, `enable_move_entry`, `enable_delete_files`, and `enable_delete_folder`. For a read/send agent, enable listing and download links, and disable unneeded create/import/move/delete capabilities. The base folder is the default starting folder; do not present it as a verified security sandbox. Do not promise OCR, transcription or content parsing unless independently discovered.

Storage is separate from delivery. Sending an image/document needs the appropriate channel's enabled Response or legacy Actions sending tool. A download URL, equipped Files tool, final chat reply or saved prompt alone does not prove a message was delivered.

### Copy assets from Base de datos or a URL

For a migration such as three images per clinic, read the existing record references and agent configuration first. Build a source-to-destination mapping (record/clinic, original reference, destination folder, destination file ID and verification state). Search/list the destination to avoid duplicates and reuse verified existing files; a matching name alone does not prove identical contents.

When the source is a durable file ID, resolve it in its authorized source context; when it is an expiring link, obtain a fresh authorized source URL. Use `bt_files_upload_from_url` to copy each supported source, then reread the destination and obtain its download URL. Preserve original records/assets unless the user separately requested removal. Do not rewrite the agent's instructions to require files that have not been verified. After the required copies are verified, update only the intended tool configuration and file references; preserve the agent's existing active/inactive state.

For a local binary, use signed upload initialization only when the client has an authorized HTTP PUT/file-transfer capability. PUT the actual bytes with the reserved MIME type to the returned upload URL, require HTTP success, then complete the upload. Initialization alone is not an uploaded file. If this client cannot transfer bytes, report that precise remaining step rather than claiming completion or constructing a public source URL.

On `FILE_DUPLICATE_NAME`, inspect the existing destination; do not overwrite or invent a new filename silently. On `FILE_IMPORT_INCOMPLETE`, retain the returned `fileId` and `uploadPerformed`, reconcile the destination before retrying, and report the partial state. Do not automatically delete reserved entries or repeat a failed batch. A failed/expired source, denied permission or unsupported format is a real failure, not a successful migration.

## Calendar and public bookings

Use the native Calendario module and an existing authorized calendar. One public booking page belongs to one calendar; do not create an unrelated Forms page or treat the meeting's invited people as additional calendars. Resolve the calendar, app scope, connected provider and current configuration before proposing changes. For a new calendar, use the discovered create tool and supported provider connection; never invent a connected account or credential.

### Tools and configuration access

Call `bt_mcp_find_tools` with `moduleKey: "calendar"` and the requested intent. Use `bt_calendar_list` to resolve the existing calendar, then manage its public booking page with these dedicated tools:

| Tool | Inputs and effect |
| --- | --- |
| `bt_calendar_get_booking_settings` | `calendarId`, plus `appId` for an app calendar. Reads complete `config`, current `version`, provider capabilities, publication state, `publicPath` and `publicUrl` when the application base URL is configured. A new page has version 0, defaults and no link. |
| `bt_calendar_save_booking_settings` | Same target, latest `version`, complete reviewed `config` and `confirmation: "APPROVED"`. Saves the rules without changing publication state. Editing a published page updates its live rules; saving a new page leaves it in draft. |
| `bt_calendar_set_booking_state` | Same target, latest `version`, `state: "published"` or `"paused"`, and `confirmation: "APPROVED"`. Publishes/resumes or pauses the saved page. |
| `bt_calendar_regenerate_booking_link` | Same target, latest `version` and `confirmation: "APPROVED"`. Invalidates the previous link, returning the new server-issued link without cancelling reservations or changing publication state. |

Administration requires `calendars:manage-booking` and access to the calendar's organization/app. Reads require `mcp:read`; saving requires `mcp:write`; publication/pause and link regeneration require `mcp:destructive`. Honor existing user authorization and the pending-action approval flow for writes. Confirmation does not grant permissions or consent. Never include `organization`, credentials, tokens, or runtime identity in tool input.

Read before editing, preserve untouched fields, and submit the whole configuration from that read. Use each response's new `version` for the next mutation. On `BOOKING_SETTINGS_CHANGED`, read again and reconcile the requested edits; do not overwrite someone else's changes or blindly retry a link rotation. Report provider validation/permission errors as returned. `bt_calendar_create_event` and `bt_calendar_find_available_slots` remain ordinary event tools; they do not replace public booking configuration or confirmation.
### Configuration to establish

Read existing values and preserve fields the user did not ask to change. Cover these groups when designing a booking page; ask only for unresolved choices that affect the requested result:

| Group | Configuration and behavior |
| --- | --- |
| Presentation | Meeting title, description, public organization name, location or meeting instructions, and timezone. A location label alone does not create a video meeting. |
| Booking rules | Meeting duration (`durationMinutes`), start-time interval (`stepMinutes`, not the duration), separation between meetings (`bufferMinutes`), minimum notice (`minimumNoticeMinutes`) and how many days ahead clients may book (`horizonDays`). |
| Weekly availability | `businessHours`: enabled weekdays and one or more `start`/`end` ranges per day in the configured timezone. Split morning/afternoon ranges to exclude breaks; closed days offer no slots. |
| Date exceptions | `blockedDates`: whole unavailable dates in `YYYY-MM-DD`. Do not promise per-date custom hours or recurring exception rules beyond what the current booking contract supports. |
| Guest form | Name and email are required; `collectPhone` and `collectComments` control the optional phone and comments fields. |
| Notifications | `sendEmailInvites` is enabled by default. Keep it enabled unless the user requests otherwise. Only the client and the people actually assigned to that event are invited; do not duplicate provider invitations with a second email send. API acceptance is not proof of inbox delivery. |
| Team assignment | Invited people, availability checks per person, all-participant or distributed assignment, required people per reservation and whether simultaneous client reservations are allowed. |
| Publication | Saved draft, published or paused state, actual public URL, and link regeneration. Editing a preview does not save or publish. |

For a new page, the current defaults are 30-minute meetings and start intervals, no separation, 120-minute notice, a 30-day booking horizon, phone/comments enabled and email invitations enabled. Weekly hours come from the calendar when configured; otherwise they are Monday–Friday 09:00–13:00 and 14:00–18:00. Confirm the timezone rather than assuming a UTC offset, and account for daylight saving changes. These defaults are not instructions to overwrite an existing configuration.

### Invited people and their availability

Store meeting people as `participants: [{ email, checkAvailability }]`. **Tener en cuenta su disponibilidad** is enabled by default, including when the field is omitted. Keep it enabled unless the user explicitly opts out for that person. The client is a separate guest; the client's email is not used to inspect their private calendar.

Whether availability can be checked depends on the provider, connection and granted calendar access, not on email syntax alone. Use returned provider capabilities and domain restrictions. The current Google integration accepts people from the connected account's domain and requires accessible free/busy data; adding a same-domain address does not grant access automatically. Other providers may define different constraints. Native local calendars support public bookings but currently do not support this team roster/availability feature. Do not describe every email or provider as supported.

When a required availability query is inaccessible or fails, report that it could not be checked; do not announce the person as free or silently turn off their check. Explicitly disabling a person's check ignores that person's external calendar events, but keeps their invitation when assigned and still respects reservations already assigned by BotTasker. Legacy availability-only entries need explicit review before becoming invited people.

### All participants, distribution and simultaneous reservations

- **Agendar a todos** (`assignment.mode: "all"`, the default): invite every configured person. With checks enabled, a time is available only when every required person is free.
- **Repartir** (`assignment.mode: "distribute"`): choose `participantsPerBooking` people, rotating among those available. Require at least one configured person and a count between one and the roster size. Only selected people join that reservation; the public client does not select an internal assignee.
- **Reservas simultáneas** (`allowConcurrentBookings`, disabled by default): in distribution mode, enable only when supported and wanted. When off, one reservation blocks overlapping reservations on that calendar even if another person is free. When on, overlapping clients can be assigned to different available people; a person cannot be double-booked. Manual calendar events continue to block affected times.

With three free people, distribution with N=1 and simultaneity enabled can take three clients at the same time; N=2 can take one, and N=3 needs all three. If fewer than N are free, block the slot. With N=1 and all three busy, block it. Turning simultaneity off limits each overlapping interval to one client reservation. Do not promise perfectly equal distribution, ignore buffers/partial overlaps, or assume the connected account must attend every distributed event.

### Configure, publish and reserve

Separate the stages: prepare and save the settings, publish the page, then let a client reserve from the public link. Creating a calendar does not publish it. If publication was requested, save with `bt_calendar_save_booking_settings`, then call `bt_calendar_set_booking_state` with `state: "published"` and the returned version. Read back `acceptingBookings: true`, the published state and the returned link. A URL visible on a saved draft is not evidence that clients can book. Use the actual returned link; never fabricate its token or host.

Pausing stops new bookings without cancelling existing events. Regenerating a link invalidates the previous link; explain that consequence before applying a requested rotation and preserve existing authorization. The preview is illustrative and does not reserve a time. The actual public page works on desktop and mobile, shows dates/times in the selected timezone, collects guest details and confirms the reservation with a calendar download. It does not reveal private event titles or the internal team roster. Do not claim public cancellation/rescheduling or multiple public booking pages per calendar are available.

Availability combines weekly ranges, blocked dates, notice, horizon, duration, separation, calendar events and the assignment rules. Recheck when confirming; a slot seen earlier may have been taken. For a conflict, refresh availability and offer alternatives. If a supported reservation tool returns an ambiguous retryable result, retain its request identity and reconcile/read back before creating another booking or invitation. Never create a real test reservation or send invitations merely to explain the configuration.

Edits/cancellations made through BotTasker update reservation occupancy. Automatic reconciliation of changes made directly in the external provider and abandoned pending external reservations is still limited; report that limitation when diagnosing a stale block instead of promising instant synchronization. For read-back, distinguish settings saved, page published, reservation confirmed and invitation delivery verified.

## Conversation Read Capabilities

Use the Conversaciones worker when an agent or workflow must inspect customer conversations without changing them. This capability is always scoped to the current organization and `appId`; never ask the user for organization scope and never try to override either scope through tool input. The app role needs both `conversations:read` and `messages:read`.

For AI Agents, discover and equip the single `conversation_tools` action. It exposes these runtime tools:

- `conversations_find`: search by phone, `chat_id`, `contact_id`, `contact_handle`, or `contact_record_id`, with optional channel and a limit of 1-20.
- `conversations_get`: load a safe conversation summary from an exact `conversation_id`.
- `conversations_get_activity`: return total, inbound, outbound, and unread counts plus first/last activity and the latest customer, human-agent, and AI-agent message dates.
- `conversations_get_recent_messages`: load 1-100 recent messages in chronological order, optionally filtered by direction, sender type, or an exclusive ISO 8601 `before` cursor.

When the exact conversation ID is unknown, call `conversations_find` first. Phone lookup normalizes common formats and checks stored WhatsApp aliases. If the result says `ambiguous: true`, present the candidates or narrow by channel and ask the user/agent context to choose; never select a candidate automatically. Use the returned `nextBefore` only when `hasMore` is true. Returned messages intentionally omit raw external payloads, internal metadata, and attachment URLs; do not claim those fields are unavailable in the underlying channel, only that this read tool does not expose them.

For deterministic workflows, use the corresponding work actions `find_conversations`, `get_conversation`, `get_conversation_activity`, and `get_recent_messages`. Do not attach those workflow-only actions to an AI Agent, and do not add the agent-only `conversation_tools` action to a workflow.

## Expected MCP Tools

Use operational module tools plus `bt_conversation_tags_list`, `bt_conversations_get_tags`, `bt_conversations_add_tags`, `bt_conversations_remove_tag`, `bt_apps_list`, `bt_apps_get`, `bt_mcp_list_skills`, and `bt_mcp_load_skill` for discovery.

## Operation boundaries

Call-record transcript and tool-event operations store supplied history; they do not place calls or execute the tool described by an event. WhatsApp template drafts stay local; synchronization reads Meta and updates local records, while submission sends a draft to Meta for review. Use each declared operation for its specific purpose.

For authorized billing questions, `bt_billing_usage_list` returns aggregate usage and credits for an optional `from`/`to` period, plus `complete` to indicate the summary limit. Do not present incomplete totals as a complete ledger or attempt raw consumption-log access.

Call-record operations use explicit `appId` and `callSessionId` fields; transcript additions also take `speaker`, `text` and `partial`, tool-event additions take `event`, and board-state replacement takes `boardState`. Do not use the old generic `payload` shape. Receipt reconciliation can schedule the next automatic follow-up message and requires execution consent; marking a manual contact completed only advances its manual sequence.
