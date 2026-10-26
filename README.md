# Tasky by BotTasker

Tasky installs in ChatGPT and Codex as a registered **App + 15 skills**. Its default OpenAI package contains the app reference and skills, with no additional direct MCP server. Claude Code and other compatible agents use the separate direct-MCP compatibility route.

> **Distribution status:** available from this GitHub repository. It is not yet listed in the universal public plugin directory.

## Instalación para Codex, ChatGPT, Claude Code y otros agentes

Elige **una sola vía por cliente**. Tasky incluye 15 skills y usa el MCP de producción `https://api.bottasker.ai/mcp` con OAuth. Tener el repositorio descargado o ver una skill no demuestra que las herramientas estén conectadas.

| Cliente y objetivo | Vía de instalación | Qué comprobar |
| --- | --- | --- |
| Codex, también desde GitHub (predeterminado) | [App + skills desde GitHub](#codex) | **Apps 1**, **Skills 15** y app accesible a la cuenta |
| ChatGPT con **Apps** y cuentas vinculadas | [Actualización del plugin en ChatGPT](#chatgpt-app-oauth-y-15-skills) | **Apps 1**, **Skills 15**, versión y cuenta visibles en la misma ficha |
| MCP directo en Codex, solo por solicitud explícita | [Compatibilidad MCP directa](#codex-direct-mcp-compatibility) | Plugin habilitado, 15 skills y OAuth completo |
| Claude Code | [Comandos de Claude Code](#claude-code) | Plugin habilitado y MCP autenticado desde `/mcp` |
| Otro agente compatible con plugins | [Guía de compatibilidad](#other-agents-and-mcp-clients) | Soporte real de manifiestos, skills, transporte HTTP y OAuth |

Antes de instalar, consulta el inventario del cliente y comprueba si ya existe Tasky como plugin, MCP manual o app conectada. Actualiza la instalación elegida; si hay variantes duplicadas, pide al usuario que elija cuál conservar antes de retirarlas. Un usuario puede usar Tasky en varios clientes: evita los duplicados dentro de cada cliente.

### Prompt para que un agente haga la instalación

Copia este mensaje en Codex, ChatGPT, Claude Code u otro agente:

```text
Instala Tasky by BotTasker desde https://github.com/BotTasker/bottasker-plugin.
Lee primero su README y detecta el cliente y la versión que estoy usando.
Revisa las instalaciones existentes y elige una sola vía compatible:
- Codex: instala App + 15 skills. Usa una app registrada y accesible a mi cuenta;
  genera el paquete connected e instala bottasker-tasky@bottasker-tasky-connected.
  No uses el marketplace MCP directo como alternativa automática.
- ChatGPT con Apps y cuentas vinculadas: descarga el ZIP de mi plugin personal,
  genera chatgpt-update y usa Upload new version en ese mismo registro.
- Si falta la app registrada, ayúdame a crearla en ChatGPT y obtén su ID real.
  No continúes con una instalación MCP directa para dar la tarea por terminada.
- Claude Code: agrega el marketplace e instala bottasker-tasky@bottasker-tasky.
- Otro cliente: comprueba su soporte de plugins y OAuth; si solo admite MCP,
  explica que eso no instala automáticamente las 15 skills.
Usa producción: https://api.bottasker.ai/mcp. No adivines IDs de apps,
no reutilices un registro eliminado y no sustituyas OAuth por una API key.
En OpenAI, usa un checkout de GitHub para generar App + skills con mi referencia
registrada. No compartas una app personal entre usuarios ni subas su ID a GitHub.
El perfil submission es exclusivamente para el portal público, no para instalar.
Si detectas duplicados, muéstramelos y pregunta cuál conservar.
Deja que yo complete el login, elija mi organización y autorice la conexión.
Una instalación local de Codex no actualiza el plugin de ChatGPT en la nube.
Después verifica el plugin, las 15 skills cuando el cliente las admita,
y el perfil/cuenta de la conexión con una consulta de solo lectura.
No ejecutes workflows ni crees o modifiques datos para probar la instalación.
Si necesitas que yo reinicie la app o abra un chat nuevo, indícalo.
No afirmes que OAuth funciona hasta comprobarlo en una sesión autenticada.
```

ChatGPT en la web o en el móvil no puede ejecutar comandos de tu terminal por sí solo. Si la sesión no dispone de un entorno local conectado y acceso a los archivos, debe guiar al usuario por la interfaz o indicar qué paso debe ejecutar en desktop. No debe afirmar que ha instalado un paquete local sin herramientas para hacerlo.

### Other agents and MCP clients

Tasky publishes a portable root `plugin.json`, `mcp.json` and `skills/`, plus Codex and Claude compatibility manifests. An agent must check its host's documented installation format before importing the package; there is no universal installation command for every agent.

For a client that only supports remote MCP, configure the production URL `https://api.bottasker.ai/mcp`, Streamable HTTP transport and native OAuth. Let the host discover the authorization metadata and complete the browser consent. Use that client's actual configuration syntax; do not assume Codex, Claude and other hosts share the same JSON or TOML format. If the host cannot perform OAuth, this integration is not supported there through an API-key workaround.

An MCP-only connection exposes server tools, not automatically the 15 packaged skills or OpenAI's account-management UI. Import skills through the host's supported mechanism when available, or use the server's advertised skill-discovery tools. Those tools are not proof that the client installed the plugin bundle. Report tools and packaged skills as separate verification results.

### Verificación después de instalar

1. Reinicia la aplicación o abre una sesión nueva cuando el cliente lo requiera.
2. Comprueba una sola variante activa de Tasky y el endpoint de producción.
3. Completa OAuth y confirma la organización seleccionada; no compartas tokens o contraseñas con el agente.
4. Verifica las 15 skills en los clientes que admiten el paquete. Para la variante conectada de OpenAI, comprueba también **Apps 1**, **Skills 15** y la cuenta en **Manage → Connected accounts**.
5. Pide: «Muestra el perfil y la organización de mi conexión BotTasker, sin hacer cambios». Comprueba que usa herramientas reales y devuelve la identidad esperada. La lista completa de herramientas puede cargarse bajo demanda; un chat abierto antes de instalar puede conservar herramientas antiguas.

## Languages

Tasky's 15 skills include guidance for Spanish, Brazilian Portuguese and English. They follow an explicitly requested response language or the user's current request, retaining the established preference for ambiguous short messages. Plans, questions, confirmations and summaries follow that language. Generated content can use a separately requested language; changing the conversation language does not authorize translating existing records. Tool identifiers, payload keys, enum values and error codes keep their exact values.

The submission includes listing translations for `en-US`, `es-PE` and `pt-BR`, with English in the base listing fields. Both manifests and package profiles retain these translations. OpenAI currently imports and retains translations without changing visible directory text or listing API responses; see [Translate listing text](https://developers.openai.com/plugins/deploy/submission#translate-listing-text).

These changes apply to the packaged assistant guidance and listing metadata. BotTasker's login/consent pages and other web UI use their own application translations. Language switching should be evaluated with the scenarios in `submission/review-matrix.md`; packaging checks do not prove model output quality.

## ChatGPT: app, OAuth y 15 skills

Un **Custom MCP** creado con **Create as a plugin** puede mostrar **Apps 1** y una cuenta OAuth sin incluir ninguna skill. La descripción que dice «15 skills», las herramientas MCP que cargan guías y un paquete instalado localmente no demuestran que estén en esa ficha de ChatGPT. Para añadirlas al mismo registro:

1. En [ChatGPT Plugins](https://chatgpt.com/plugins), abre tu Tasky existente. Si aún no existe, usa **Add → Add custom MCP server**, nombre **Tasky by BotTasker**, URL `https://api.bottasker.ai/mcp`, autenticación **OAuth**, y completa **Create as a plugin**. Selecciona tu organización en el consentimiento de BotTasker y verifica la cuenta en **Manage**.
2. En la ficha del plugin, abre **More actions → Download plugin ZIP**. Conserva esa descarga como copia del registro actual; contiene su nombre técnico y el vínculo a su app.
3. Desde un checkout de este repositorio, con Node.js 22+, `zip` y `unzip` disponibles, ejecuta:

```bash
node scripts/build-codex-package.mjs chatgpt-update --existing-plugin-zip=/ruta/absoluta/plugin.zip
```

4. El comando devuelve la ruta de un ZIP `bottasker-tasky-<versión>-chatgpt-update.zip`. En **ese mismo plugin de ChatGPT**, elige **More actions → Upload new version → Choose file**, selecciona el ZIP generado y completa la actualización. No uses el ZIP público `submission` aquí ni crees otro Custom MCP.
5. Pulsa **View plugin** y comprueba **Apps 1**, **Skills 15** y la versión actual (0.2.37). En **Manage → Connected accounts**, verifica que la cuenta elegida sigue conectada por OAuth y la URL es `https://api.bottasker.ai/mcp`. Abre un chat nuevo para probar una consulta de solo lectura.

El generador conserva exactamente el nombre técnico y la referencia a la app del ZIP descargado, pero toma las skills y los recursos de este repositorio. No copia credenciales, no vuelve a registrar la app ni solicita permisos nuevos. Excluye los servidores MCP duplicados y los casos de revisión del portal, que solo corresponden al paquete público con su servidor declarado. Una actualización de habilidades puede requerir un chat nuevo; ni generar el archivo ni instalar un marketplace local publica esta actualización en ChatGPT.

Los ZIP que contienen la app personal quedan en `.tasky-runtime/`, excluido de Git. No subas esos archivos al repositorio ni a la solicitud pública del marketplace. No reutilices un ZIP de una app eliminada o de otra cuenta: el generador verifica el formato, pero solo el cliente autenticado puede confirmar el acceso y el consentimiento.

## Native app connection in Codex

App + 15 skills is the default OpenAI installation, including installations sourced from GitHub. A personal connected plugin can be used before public marketplace publication. The registered app supplies the host's connection/account buttons; bundled skills supply Tasky's workflows. A custom HTML widget is optional and does not create those authentication controls.

This is a **local Codex installation**, separate from updating the ChatGPT cloud plugin above. For the private development route:

1. Sign in at [ChatGPT Plugins](https://chatgpt.com/plugins) with the account/workspace used by Codex.
2. Choose **+ → Add custom MCP server**, name it **Tasky by BotTasker**, and enter `https://api.bottasker.ai/mcp` with OAuth authentication. Complete the host's warning and **Create as a plugin** flow.
3. Sign in to BotTasker, choose an organization, approve the safe grant, and verify the discovered tools. Account/workspace policies can restrict custom MCP registration.
4. Copy the exact `plugin_asdk_app_…` technical ID or URL from that personal plugin's page, or its `asdk_app_…` App ID from Manage. An old developer registration is not proof that an app is available to the current account. After deleting a personal app, create a new one and copy its new identifier; do not reuse the deleted registration.
5. Build the connected package with that ID:

```bash
node scripts/build-codex-package.mjs --plugin-id=plugin_asdk_app_<actual-id>
```

The same flag also accepts the exact App ID shown in Manage or the personal plugin URL:

```bash
node scripts/build-codex-package.mjs connected --plugin-id=asdk_app_<actual-id>
node scripts/build-codex-package.mjs connected --plugin-id='https://chatgpt.com/plugins/plugin_asdk_app_<actual-id>?directoryTab=personal'
```

Replace `<actual-id>` with the value from your own registered app. These are alternative commands: run just one. The generator validates the input format; it cannot establish account access or OAuth success. Keep personal IDs and generated packages out of the public repository.

The command prints a generated marketplace directory and ZIP; it does not install or publish. Add that directory through `codex plugin marketplace add <generated-directory>` and install `bottasker-tasky@bottasker-tasky-connected`. In Codex's plugin settings, enable the connected variant and disable any other Tasky variant for this acceptance test, preserving the chosen environment. Open a new chat and verify **Connect/Authenticate**, account display, setup, and read-only tools. Do not enable an app mapping that the current account cannot access: the host can suppress the otherwise usable bundled MCP. This does not upload skills to the corresponding ChatGPT cloud plugin; use `chatgpt-update` for that record.

The default `connected` build contains `.app.json` plus the 15 skills and sets the supplied app dependency as required. It removes every bundled MCP declaration and portal-only review metadata, so the installation cannot silently become a direct-MCP connection. Running the builder without an app identity fails before creating output; public submission requires the explicit `submission` profile. Only an actual signed-in client test establishes availability and successful authentication.

The Local/PROD selector manages the two direct-MCP marketplaces only. A Tasky installation from `bottasker-tasky-connected` is reported as outside that selector's managed marketplaces; remove that test installation through Codex before using the selector again. Removing a test plugin does not revoke its BotTasker grant; account revocation is managed separately.

For public distribution, upload the separate submission ZIP through [OpenAI Platform Plugins](https://platform.openai.com/plugins). OpenAI currently rejects app references in submission ZIPs; registration, domain verification, scanning and review happen in the portal. This is independent of the GitHub installation below.

[The Spanish integration study](docs/codex-integration-study.md) records the comparison, verified endpoints, changes, and remaining acceptance work.

## Install from GitHub

### Codex

La instalación predeterminada desde GitHub es **App + 15 skills**. Primero obtén la URL o el ID de una app Tasky registrada y accesible en la misma cuenta/workspace que Codex, como se explica en [Native app connection in Codex](#native-app-connection-in-codex). Un ID personal de otro usuario no sirve como dependencia universal.

```bash
git clone https://github.com/BotTasker/bottasker-plugin.git
cd bottasker-plugin
node scripts/build-codex-package.mjs --plugin-id=plugin_asdk_app_<actual-id>
```

El generador devuelve `directory`: usa esa ruta exacta como `<generated-directory>`:

```bash
codex plugin marketplace add <generated-directory>
codex plugin add bottasker-tasky@bottasker-tasky-connected
```

Si ese marketplace ya existe, conserva su ruta anterior como recuperación y vuelve a registrarlo con el nuevo directorio antes de actualizar. Deshabilita la variante MCP directa anterior solo después de comprobar la instalación App + skills. Esta migración conserva las cuentas OAuth; no requiere revocar credenciales. Abre un chat nuevo y verifica **Apps 1**, **Skills 15** y la cuenta elegida en **Manage**. Si la app no es accesible, detén la instalación y resuelve el acceso; no cambies automáticamente a MCP directo.

GitHub distribuye el código y las skills, pero no registra una app de OpenAI ni concede acceso a una app personal. La distribución universal requiere completar la publicación oficial; el generador no sustituye ese proceso.

### Codex direct-MCP compatibility

Solo para quien solicite expresamente MCP directo, sin la gestión de cuentas de Apps. Estos comandos importan el paquete portable original; no son la instalación OpenAI predeterminada:

```bash
codex plugin marketplace add BotTasker/bottasker-plugin --ref main
codex plugin add bottasker-tasky@bottasker-tasky
codex mcp login bottasker-tasky
```

No habilites esta variante junto con la instalación App + skills.

### Claude Code

```bash
claude plugin marketplace add BotTasker/bottasker-plugin
claude plugin install bottasker-tasky@bottasker-tasky --scope user
```

Start a new Claude Code session after installation. Use `/mcp` if browser authentication does not start automatically. In your shell, `claude plugin list --json` checks the user installation; inside a session, `/plugin` shows the plugin's components. Do not add the same endpoint separately with `claude mcp add` when it is already supplied by the plugin. See [Claude Code's installation documentation](https://code.claude.com/docs/en/discover-plugins).

### Ask an LLM to install it

Use the [installation prompt above](#prompt-para-que-un-agente-haga-la-instalación), which selects the correct path for Codex, ChatGPT, Claude Code or another host. Installation, authenticated connection and availability in the current conversation are separate checks.

## Machine-readable installation facts

| Field | Canonical value |
| --- | --- |
| Repository | `https://github.com/BotTasker/bottasker-plugin` |
| Default branch | `main` |
| Marketplace manifest | `.agents/plugins/marketplace.json` |
| Marketplace name | `bottasker-tasky` |
| Plugin name | `bottasker-tasky` |
| Default Codex install target | `bottasker-tasky@bottasker-tasky-connected` (generated for an accessible registered app) |
| Default OpenAI package | App + 15 skills; no bundled direct MCP |
| Direct-MCP compatibility target | `bottasker-tasky@bottasker-tasky`, explicit opt-in only |
| Plugin source directory | `plugins/bottasker-tasky` |
| MCP server name | `bottasker-tasky` |
| MCP endpoint | `https://api.bottasker.ai/mcp` |
| Authentication | Native OAuth 2.1; no API key |

Do not infer alternative names or endpoints. The repository root is the marketplace root; the plugin itself lives under `plugins/bottasker-tasky`.

## Update an existing GitHub installation

Para OpenAI App + skills, actualiza el checkout con `git pull --ff-only`, vuelve a ejecutar el generador con la referencia a la misma app y actualiza el marketplace generado. Conserva la ruta anterior hasta verificar **Apps 1** y **Skills 15**. Para la ficha de ChatGPT en la nube, usa `chatgpt-update` y **Upload new version** sobre el registro existente.

Solo las instalaciones de compatibilidad MCP directa usan `codex plugin marketplace upgrade bottasker-tasky` seguido de `codex plugin add bottasker-tasky@bottasker-tasky`. No apliques esos comandos a una instalación App + skills.

## Availability options

Pushing this repository and its marketplace manifest to the public `main` branch makes Tasky installable from GitHub with the commands above. It does **not** automatically add Tasky to the universal plugin directory.

To publish it in the public directory, submit it through the OpenAI Platform as a **With MCP** plugin. Public submission requires a stable HTTPS MCP endpoint, verified developer or business identity, listing assets, tool annotations, test cases, and review approval. Until that process is complete, describe Tasky as “installable from GitHub,” not as “available in the built-in catalog.”

### ZIP para actualizar la solicitud oficial de OpenAI

```bash
node scripts/validate-plugin.mjs
node scripts/build-codex-package.mjs submission
```

Usa el archivo `bottasker-tasky-<versión>-submission.zip` que imprime el comando para actualizar **la solicitud existente** en [OpenAI Platform Plugins](https://platform.openai.com/plugins), mediante la vía **With MCP**. Incluye las 15 skills, las traducciones de publicación para español, portugués de Brasil e inglés, el enlace de demostración `https://youtu.be/GE1NGw_v7jc`, los casos de revisión y la configuración OAuth de `https://api.bottasker.ai/mcp`. Conserva el nombre público `bottasker-tasky` para actualizar esa solicitud.

El workflow **Validate Tasky plugin** también genera este ZIP como artefacto **tasky-openai-submission** en GitHub Actions después de pasar las pruebas. Descarga el artefacto del commit que quieres revisar y extrae el archivo `*-submission.zip` de su interior; ese archivo es el que se sube a OpenAI.

La publicación pública recibe directamente el servidor MCP; no acepta la referencia a una app personal mediante `apps` o `.app.json`. Por eso este ZIP es distinto del `chatgpt-update`. Consulta la [documentación de envío de OpenAI](https://developers.openai.com/plugins/deploy/submission).

Si cambias el servidor, despliega y verifica primero producción; después sube el ZIP y vuelve a escanear las herramientas. Una corrección solo de empaquetado no modifica el catálogo MCP ni resuelve por sí sola observaciones sobre herramientas. Antes de solicitar revisión comprueba metadatos, **15 skills**, autenticación, escaneo, idiomas y video. El titular introduce sus credenciales de demostración y revisa las declaraciones legales en el portal.

## Prerequisites and authentication

- Codex or Claude Code with plugin marketplace support.
- Network access to `https://api.bottasker.ai/mcp`.
- A BotTasker account and access to at least one organization.

Tasky authenticates through the client's native OAuth 2.1 flow. No API key or environment variable is required for an end user.

Access tokens are intentionally short-lived. Codex and Claude Code retain the rotating refresh token and renew access automatically; reaching the access-token expiry must not open a new browser login. Interactive authentication is required only for the initial connection, explicit scope elevation, revocation, or a terminal refresh-token failure. A pending browser consent is not yet an authenticated connection and must be completed before its temporary authorization request expires.

## Install from a local checkout

For OpenAI, use the App + skills GitHub flow above even from a local checkout. The following commands are only the explicit direct-MCP compatibility route:

```bash
codex plugin marketplace add .
codex plugin add bottasker-tasky@bottasker-tasky
```

For Claude Code, use:

```bash
claude plugin marketplace add .
claude plugin install bottasker-tasky@bottasker-tasky
```

Open a new session after installing. An already open conversation can retain its previous tools.

## Switch Between Local And Production

Run the environment selector from this repository root (Node.js 22 or later):

```bash
node scripts/use-environment.mjs
```

The Spanish terminal menu lets you inspect the current installation or choose **Local** / **PROD**, then select **Codex**, **Claude Code**, or **both**. Only installed CLIs available in `PATH` are offered; both is the default when both are available. Choosing the environment and client applies the change without another confirmation. `0`, `q`, Ctrl+C, or EOF at either prompt cancels without changing installations. Without an interactive terminal, running without arguments only prints help.

The canonical plugin and files intended for GitHub always use `https://api.bottasker.ai/mcp`. Local uses a separate generated plugin with the same skills and a distinct plugin/MCP identifier:

| Environment | Plugin and MCP server | Endpoint |
| --- | --- | --- |
| PROD | `bottasker-tasky` | `https://api.bottasker.ai/mcp` |
| Local | `bottasker-tasky-local` | `http://localhost:3200/mcp` |

For Local, the API must run on `http://localhost:3200` and the web/OAuth consent page on `https://localhost:5185`. The helper checks API health, OAuth resource and issuer/endpoints, the unauthenticated MCP challenge, and the consent page before changing an installation. Self-signed TLS is accepted only for the fixed local consent-page check. An unreachable local server or invalid metadata stops the change; it never falls back to PROD.

Direct commands remain available:

```bash
# Apply Local to both clients.
node scripts/use-environment.mjs local --install --client=all

# Apply PROD to both clients (prod is an alias for production).
node scripts/use-environment.mjs prod --install
node scripts/use-environment.mjs production --install

# Change one client only.
node scripts/use-environment.mjs local --install --client=codex
node scripts/use-environment.mjs prod --install --client=claude

# Read actual installed manifests, enablement and MCP configuration.
node scripts/use-environment.mjs status
node scripts/use-environment.mjs status --client=codex
node scripts/use-environment.mjs status --client=claude

node scripts/use-environment.mjs --help
```

Without `--install`, `local` generates a runtime and `prod` validates the production plugin; neither changes a client's installation. Generated runtimes live in `.tasky-runtime/builds/`. The earlier `.tasky-runtime/local/` installation remains supported. These directories are excluded from Git. New builds do not overwrite an existing installation's source.

### Verification and authentication

Status shows environment, URL, version, enablement and scope for each selected client. It reports conflicting variants, missing installations and inspection errors. Codex also checks the effective MCP URL against the installed plugin. **Installation verified does not mean OAuth authenticated**: tokens remain managed by the client, separately for each server identifier. The helper neither copies tokens nor logs out. Reauthentication may still be needed if a client invalidates an installation's grant.

After a change:

- Codex: open a new session and use the native **Authenticate** action, or `codex mcp login bottasker-tasky-local` for Local / `codex mcp login bottasker-tasky` for PROD.
- Claude Code: run `/reload-plugins` or open a new session, then use `/mcp` to authenticate the matching Tasky server if necessary.
- Run the read-only `bt_context_get_profile` tool and verify the expected organization. Confirm the MCP endpoint with `status`; a profile alone may not distinguish two environments containing the same organization.

An already open conversation can retain its previous tools until it is reloaded. Authentication errors do not trigger an automatic environment change.

### Failure recovery

The helper operates only on Tasky plugins and Tasky marketplaces owned by this repository. Claude changes use `--scope user`, preserve plugin data, and reject Tasky installations in project/local/managed scopes rather than removing them. Foreign marketplaces using the same names are reported without modification. Other plugins remain untouched.

Before replacing Tasky, the helper snapshots its **installed payload**, version and enabled state in `.tasky-runtime/recovery/`. If installation or verification fails, it reinstalls that snapshot and verifies the restored state. A recovered marketplace points to the retained snapshot; the next successful switch returns it to the normal source. Do not delete a runtime/recovery directory while a client marketplace still uses it.

Installations use the native CLIs. Since the current Codex CLI has no plugin enable/disable command, restoring a disabled plugin (or enabling a selected disabled plugin) updates only that Tasky plugin's explicit `enabled` boolean in Codex's user config. An unrecognized config layout is reported as an error rather than rewritten.

If restoration also fails, the output reports the current known state, retained snapshot path and recovery commands. If state cannot be inspected, it is reported as unknown. With both clients selected, a failure in one does not undo a successful change in the other. Any failed client produces exit code `1`; full success produces `0`.

An exclusive `.tasky-runtime/environment.lock` prevents concurrent switches. If a process is interrupted after changes begin, inspect both clients with `status` and use the retained recovery snapshot as needed. Remove only the lock file after verifying that its recorded process has stopped, then rerun the selector. Snapshot directories are retained for recovery and are never committed.

### Environment-selector tests

```bash
node --test scripts/environment/environment.test.mjs
node scripts/validate-plugin.mjs
```

Tests use simulated CLIs and temporary directories. They do not access real client credentials or change your installations. CI runs these tests alongside plugin validation. For manual acceptance, use Local → PROD → Local in each client, reload/authenticate through the client, and check the read-only profile and configured endpoint after each switch.

## Verify Codex

Check MCP configuration:

```bash
codex mcp list
codex mcp login bottasker-tasky
```

In Codex, verify the BotTasker MCP tools:

```text
Use BotTasker to run bt_context_get_profile.
Use BotTasker to run bt_apps_list_modules.
Use BotTasker to run bt_apps_blueprint_plan.
Use BotTasker to run bt_ai_agent_tools_discover.
Use BotTasker to run bt_mcp_list_skills.
```

## Verify Claude Code

Check plugin and MCP registration:

```bash
claude plugin list
claude plugin details bottasker-tasky@bottasker-tasky
claude mcp list
```

In Claude Code, verify the BotTasker MCP tools:

```text
Use BotTasker to run bt_context_get_profile.
Use BotTasker to run bt_apps_list_modules.
Use BotTasker to run bt_ai_agent_tools_discover.
Use BotTasker to run bt_mcp_list_skills.
```

## Plan-First Flow

For app creation or advanced automation, the plugin must discover capabilities, create a plan, resolve relevant doubts, and wait for explicit approval before calling write tools.

Expected flow:

1. `bt_context_get_profile`
2. `bt_apps_list_modules`
3. `bt_apps_blueprint_plan`
4. Specialist discovery as needed, for example `bt_ai_agent_tools_discover` when AI Agents are part of the approved app blueprint
5. Ask for approval
6. Execute with `bt_apps_*`, `bt_data_hub_*`, `bt_ai_agents_*`, `bt_action_instances_*`, `bt_workflows_*`, and module tools from the approved plan

Example prompt:

```text
Quiero una app para llevar registro de gastos por Telegram, con dashboard mensual y un agente que registre los gastos automaticamente.
```

Codex should use `bottasker-app-builder` to propose the app structure, module combination, specialist handoffs, risks, and execution plan before making changes. If AI Agents are included, `bottasker-ai-agent-architect` then designs the agent principal, subagents, tools, inputs, outputs, and required configuration inside the approved app.

## Validate Plugin

Run the maintained repository checks:

```bash
node scripts/validate-plugin.mjs
node --test scripts/codex-package.test.mjs scripts/environment/environment.test.mjs
node scripts/build-codex-package.mjs submission
```

The last command creates a ZIP under `.tasky-runtime/packages/`, containing the portable `plugin.json`, `mcp.json`, 15 skills, assets, license and compatibility files. Portal submission uses a registered public OAuth client (`provided`, `tokenEndpointAuthMethod: "none"`) with PKCE and no client secret. Initial scopes are `mcp:read mcp:write`; destructive scope is excluded. The existing connection guide is declared as the setup skill. Generated builds stay out of Git.

Repository and connected installs use a transport-only `mcp.json` with native OAuth discovery. The current Codex desktop parser rejects per-server `extensions` in that file and otherwise drops the server. The portal submission build replaces it with `submission/mcp.json`, which contains the explicit OAuth configuration required for importing the connection settings. Use the submission ZIP for the portal, not as a desktop test marketplace. Keep both endpoints aligned; validation rejects a mismatched submission endpoint or unsafe initial scopes.

### Stable operations and dynamic resources

The companion MCP server exposes 327 stable product tools, including all 70 Clients operations. All 321 prior public names remain; six fixed operations add separate activation/deactivation, stopping test listeners and three read-only input/target previews. Resource and organization names never create tool names. Workflows created later use the same declared execution contracts.

`bt_workflows_update` edits configuration only while the selected workflow is inactive. It no longer accepts activation status; use `bt_workflows_activate` / `bt_workflows_deactivate`. `bt_workflows_start_testing` starts listeners only; use `bt_workflows_stop_testing` to stop them. Real listener/activation changes and endpoint, trigger or board-button execution retain explicit approval and destructive execution consent.

Configuration reads return saved editor data with explicit output schemas, not an `includeExecution` mode. Board editor lists return `{options: [...]}`. Validate a selected endpoint, trigger or button through `bt_api_tools_preview_endpoint`, `bt_workflows_preview_trigger` or `bt_boards_preview_detail_widget_action`. Previews return a reviewed `definitionRevision` without outbound requests or node execution; their limitations distinguish input/target validation from end-to-end simulation. A preview is not proof of downstream success. Dynamic execution is preserved and may still require human review by OpenAI.

### Portal OAuth registration and callbacks

The public client ID in `submission/mcp.json` is an identifier issued by BotTasker, not an API key or a client secret. Keep its provider registration active. Register only the exact HTTPS callback generated by OpenAI for the connection; the general ChatGPT callback can differ from the connection-specific callback. Provider callback changes require explicit owner authorization. Do not add wildcard callbacks or disable PKCE.

On 2026-10-19, the portal reproduced `OAuth client ID is required when using pre-defined OAuth client credentials` for CIMD, including a newly created verification plugin. A new plugin created with the provided public client passed configuration saving and reached BotTasker consent. After the owner authorized the exact callback in BotTasker and completed consent, OpenAI reported the selected account connected and discovered 292 tools. The scan returned findings for 44 tools. With explicit owner approval, the original unpublished registration was subsequently recreated with 0.2.19; after consent, its connection dialog reported `Authorized` and `Tools scanned successfully`. These results are not a passing publication review. This establishes an observed workaround for this portal behavior, not a general requirement to replace CIMD in clients that support it.

Uploading a changed auth object does not prove the saved OAuth client changed: a verification draft displayed a new `clientId` but its next authorization request still used the previously registered ID. Check the actual authorization request, keep the original registration valid, and configure its exact callback in the provider. The portal also rejected changing an existing plugin's MCP server key and required a new plugin. Preserve existing drafts until any replacement has been tested; deleting a plugin is a separate irreversible action requiring owner confirmation.

Reference: [MCP authentication configuration](https://developers.openai.com/plugins/build/plugins#configure-mcp-authentication), [submission authentication](https://developers.openai.com/plugins/deploy/submission#configure-authentication-for-submission), and [callback and issuer identification](https://developers.openai.com/plugins/build/auth#redirect-url). A completed account connection and a completed tool scan are separate checks.

Demonstration video: [Tasky walkthrough](https://youtu.be/GE1NGw_v7jc). The submission imports it from `extensions.com.openai.review.demo_recording_url`; the PDF under `output/pdf/tasky-review.pdf` is a supplementary review sheet. Regenerate it with `python3 scripts/build-review-pdf.py` (requires ReportLab).

These checks verify packaging and environment isolation. They do not establish OpenAI approval, a registered app's eligibility, successful end-user OAuth, or every live tool's behavior. Five positive and three negative reviewer scenarios and the demonstration URL are included in the manifest. Reviewer credentials, domain verification, and actual evaluation results remain separate submission requirements.

For Claude Code:

```bash
claude plugin validate /Users/this/Documents/projects/bottasker/app/bottasker-tasky
claude plugin validate /Users/this/Documents/projects/bottasker/app/bottasker-tasky/plugins/bottasker-tasky
```

## Included Skills

- `bottasker-router`: entrypoint and workflow router.
- `bottasker-connection-guide`: OAuth sign-in, organization selection, scope elevation, explicit errors, reauthorization, and revocation.
- `bottasker-app-builder`: complete app design, module selection, specialist handoffs, apps, modules, menus, and templates.
- `bottasker-clients-architect`: native Clientes apps, prospects, contacts, states, fields, history, tasks, segments, import/export and contextual AI follow-up.
- `bottasker-data-architect`: Base de datos (Data Hub) and Dynamic Tables.
- `bottasker-ai-agent-architect`: AI Agents module specialist for agents, subagents, dynamic tools, tool schemas, inputs, and outputs inside an app.
- `bottasker-knowledge-base-assistant`: Knowledge Base specialist for documents, URL/text sources, semantic queries, ingestion state, and Knowledge Base tools attached to agents.
- `bottasker-automation-engineer`: AI agents, workflows, workers, and tests.
- `bottasker-dashboard-architect`: useful dashboards for tracking, control, KPIs, reporting, and area-specific follow-up.
- `bottasker-board-architect`: boards, data sources, columns, per-user push/sound alerts, card details, widgets, button automations, public/restricted sharing, roles, users, and security.

Tasky, Codex, and Claude can inspect and manage the authenticated user's board-column alerts through `bt_boards_get_column_alerts`, `bt_boards_configure_column_alert`, and `bt_boards_remove_column_alert`. The browser remains responsible for granting notification permission and registering its Firebase installation; MCP clients never receive Firebase installation identifiers.
- `bottasker-whatsapp-template-architect`: Meta-compatible WhatsApp templates covering marketing, utility, authentication, variables, media/location headers, buttons, drafts, and controlled submission.
- `bottasker-ops-builder`: operational modules such as calendar, files, conversations, and calls.
- `bottasker-catalog-architect`: catalogs, products, variants, properties, modifiers, availability, and sales carts.

## References

- OpenAI plugin packaging and GitHub marketplaces: https://developers.openai.com/plugins/build/plugins
- OpenAI public plugin submission: https://developers.openai.com/plugins/deploy/submission
- Claude Code MCP: https://code.claude.com/docs/en/mcp
- Claude Code plugins: https://code.claude.com/docs/en/plugins
- Claude Code plugin reference: https://code.claude.com/docs/en/plugins-reference
- Claude Code plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
