# Integración de Tasky como aplicación de Codex

Revisión del 18 de octubre de 2026. Base del plugin: `origin/main`, commit `7afe2c7`. Rama de implementación: `feat/codex-native-app-integration`. La revisión del backend corresponde al código del checkout `bottasker-core`; los cambios de esta rama pertenecen al repositorio del plugin.

Tasky ya tiene las piezas principales: 15 skills, herramientas MCP, OAuth y consentimiento por organización. Para conseguir la experiencia de aplicación con botones de conexión, hace falta vincular un registro de MCP accesible para la cuenta de Codex. La publicación pública es un paso de distribución separado. El código del plugin puede preparar ese vínculo, pero la existencia de un manifiesto no demuestra que OpenAI permita usar la aplicación con una cuenta concreta.

## Modelo documentado y comparación

La documentación oficial separa el paquete instalable, los flujos de las skills, las acciones del servidor y la interfaz opcional. Los botones de conexión los presenta el host para la integración registrada. Un widget HTML tiene otro propósito: mostrar o editar resultados dentro del chat. [Arquitectura de plugins](https://developers.openai.com/plugins/concepts/plugins).

| Área | Implementación anterior | Resultado de esta rama |
| --- | --- | --- |
| Identidad | Nombre estable y versión 0.2.14 en manifiestos de Codex y Claude | Versión 0.2.15 sincronizada; se conserva la identidad |
| Formato portable | Solo `.codex-plugin/plugin.json`, `.mcp.json` y adaptación de Claude | Se añaden `plugin.json` y `mcp.json` con sus schemas; se conservan los archivos de compatibilidad |
| Skills | 15 skills incluidas, con referencias y metadatos | Se conservan; la guía de conexión se declara como configuración inicial |
| OAuth del paquete | Descubrimiento por URL y `oauth_resource` | El formato portable declara OAuth, preferencia CIMD y scopes iniciales seguros |
| Aplicación registrada | La referencia privada se retiró en 0.2.7 tras problemas de disponibilidad | Un build separado genera el vínculo exclusivamente a partir del identificador suministrado |
| Distribución | Marketplace GitHub; autenticación `ON_INSTALL` | Se conserva y se añade generación de ZIP de submission y marketplace de pruebas conectado |
| Metadatos públicos | Subtítulo largo; faltaba `supportURL`; URLs legales inexistentes | Subtítulo de 28 caracteres y URLs de soporte, privacidad y términos comprobadas |
| Interfaz de resultados | Sin recursos MCP Apps ni widget | Se elimina la etiqueta `Interactive`; un widget queda como ampliación opcional |
| Revisiones | Matriz de aceptación general | Cinco escenarios positivos y tres negativos incluidos en ambos manifiestos |
| Local y PROD | Entornos separados en formato antiguo | También se separan el manifiesto portable, el endpoint y el recurso OAuth |
| Verificación | Validador y 35 pruebas de entorno | Se amplían la validación y las pruebas de empaquetado, coherencia y aislamiento |

El formato portable descubre `skills/` y `mcp.json` desde la raíz; las propiedades de OpenAI se colocan en `extensions.com.openai`. La compatibilidad antigua sigue admitida. La configuración inicial usa una skill incluida. Las referencias a aplicaciones registradas van en `.app.json`; la generación conectada sigue el mismo patrón observado en los paquetes instalados de Linear y Cloudflare: dependencia requerida, skills y declaración MCP. [Empaquetado](https://developers.openai.com/plugins/build/plugins).

## OAuth y herramientas del backend

El código existente publica descubrimiento de recurso y autorización, implementa DCR y CIMD, exige PKCE S256, vincula tokens al recurso MCP, renueva tokens con rotación y comprueba el usuario, organización y scopes antes de ejecutar herramientas. Expone `bt_context_get_connected_account` con `openai/profile`, esquema de salida y resultado estructurado. Este análisis de código no sustituye una prueba autenticada en el host.

El paquete portable solicita `mcp:read` y `mcp:write`; deja fuera `mcp:destructive`. Mantiene el identificador canónico `https://api.bottasker.ai/mcp` y permite descubrir los endpoints OAuth. No incluye claves ni tokens. La separación entre scope y permisos de BotTasker se conserva. [Autenticación](https://developers.openai.com/plugins/build/auth), [seguridad y privacidad](https://developers.openai.com/plugins/guides/security-privacy).

Las skills siguen empaquetadas. No es necesario implementar el borrador `skills/list` del servidor para distribuirlas por ZIP. El mecanismo propio `bt_mcp_list_skills`/`bt_mcp_load_skill` es descubrimiento de BotTasker; no equivale por sí mismo a la extensión estándar de importación. [Skills](https://developers.openai.com/plugins/build/skills), [servidor MCP](https://developers.openai.com/plugins/build/mcp-server).

## Registro privado y botones

1. Entrar en [ChatGPT Plugins](https://chatgpt.com/plugins) con la misma cuenta y workspace utilizados por Codex.
2. Usar **+ → Add custom MCP server**, indicar el endpoint HTTPS de Tasky y elegir OAuth.
3. Revisar el aviso del host, crear el plugin personal, completar el consentimiento de BotTasker y verificar las herramientas.
4. Copiar el identificador `plugin_asdk_app_…` de la URL del plugin personal. El registro histórico `asdk_app_6ab604be38988191aef0b7f32f24ab1d` no se reactiva automáticamente: falta verificar que siga disponible para la cuenta.
5. Generar el paquete conectado e instalar su marketplace con los comandos del README. El generador convierte el identificador del plugin en la referencia `asdk_app_…` usada por `.app.json`; no registra nada en OpenAI.
6. Probar botones de conexión, cuenta conectada, configuración inicial y herramientas desde Codex, con una única variante de Tasky habilitada para la prueba.

Las políticas de la cuenta o del workspace pueden restringir el registro privado. Una app no disponible puede impedir que el host muestre herramientas aunque el MCP directo funcione. El resultado del generador debe verificarse con una sesión autenticada; no se instala automáticamente sobre Local o PROD. [Registro de pruebas](https://developers.openai.com/plugins/build/plugins#create-and-test-a-plugin-locally-with-an-mcp-server), [pruebas del plugin completo](https://developers.openai.com/plugins/deploy/connect-chatgpt).

## Preparación de publicación

El build `submission` crea un ZIP con el MCP remoto y las skills. Excluye `.app.json`, hooks, configuración de clientes y archivos de desarrollo. El build `connected` es para vincular una app existente durante pruebas privadas. Los dos destinos tienen restricciones distintas: el portal rechaza ZIPs con referencias de aplicaciones.

La publicación requiere identidad verificada, acceso de gestión en la organización de OpenAI, verificación del dominio, conexión y escaneo del MCP, evaluación, acceso de revisión y grabación de demostración. El manifiesto incluye cinco casos positivos y tres negativos para ejecutar; sus resultados aún deben registrarse. No se inventan credenciales de revisión, países de distribución ni una grabación inexistente. [Submission](https://developers.openai.com/plugins/deploy/submission).

## Comprobaciones públicas

Las comprobaciones GET con curl sobre producción dieron estos resultados el 18 de octubre de 2026, sin credenciales ni escritura:

| Recurso | Resultado |
| --- | --- |
| `https://api.bottasker.ai/.well-known/oauth-protected-resource/mcp` | 200; recurso canónico, issuer de BotTasker y scopes seguros |
| `https://api.bottasker.ai/.well-known/oauth-authorization-server` | 200; PKCE S256, DCR, CIMD, refresh y cliente público `none` |
| `https://api.bottasker.ai/mcp` | 401 sin token, comportamiento esperado |
| `https://bottasker.ai/privacy` y `/terms` | 404; sustituidas en los metadatos del plugin |
| `https://bottasker.ai/es/politica-privacidad/` | 200 |
| `https://bottasker.ai/es/terminos-condiciones/` | 200 |
| `https://bottasker.ai/es/contacto/` | 200 |
| `https://bottasker.ai/docs/tasky` | 404; el backend todavía la anuncia como `resource_documentation` |

El navegador disponible no tiene sesión iniciada en OpenAI Platform ni ChatGPT Plugins. No se pudo comprobar el registro privado, completar OAuth ni observar los botones con esta cuenta. La consulta al catálogo accesible no devolvió Tasky, coherente con que aún no se ha publicado; el catálogo no permite deducir si existe un registro privado.

## Trabajo pendiente para aceptación completa

| Prioridad | Trabajo | Condición de cierre |
| --- | --- | --- |
| P1 | Registro privado accesible a la cuenta | Plugin personal visible y conexión OAuth completa desde Codex |
| P1 | Prueba integrada | Cuenta y organización correctas, setup, herramientas, refresh y reconexión verificados en la interfaz |
| P1 antes de revisión pública | Auditoría de anotaciones de herramientas | Revisar efectos reales por herramienta, especialmente envíos irreversibles y sobrescrituras |
| P2 | Documentación anunciada por el MCP | Publicar `/docs/tasky` o corregir `resource_documentation` en el backend y desplegarlo |
| P2 para callbacks estables | Identificación del issuer | Completar y probar `iss` en respuestas OAuth de éxito y error antes de anunciar soporte RFC 9207 |
| Publicación | Dominio, identidad, casos, demo y revisión | Aprobación y publicación por OpenAI |

El registro de herramientas actual calcula `destructiveHint` principalmente desde el efecto interno `destructive`. La guía vigente también considera destructivos ciertos envíos irreversibles y sobrescrituras; `inferToolEffect` clasifica nombres con `send` o `update` como `write`. Esa diferencia requiere revisar los efectos reales de las herramientas antes de certificar sus anotaciones. Esta rama no cambia la autorización ni los efectos internos de cientos de operaciones. [Anotaciones requeridas](https://developers.openai.com/plugins/plugin-guidelines#correct-annotation), [referencia de herramientas](https://developers.openai.com/plugins/reference).

El backend ya añade `iss` al aprobar consentimiento, pero no lo anuncia en discovery y no lo añade al rechazo. El flujo con callbacks específicos sigue siendo válido; los callbacks estables son una mejora posterior que requiere ambas partes. La declaración de una aplicación no exige un widget: MCP Apps es una interfaz opcional para resultados. [Callbacks OAuth](https://developers.openai.com/plugins/build/auth#protect-callbacks-with-issuer-identification), [UI opcional](https://developers.openai.com/plugins/build/chatgpt-ui).

## Verificación reproducible

```bash
node scripts/validate-plugin.mjs
node --test scripts/codex-package.test.mjs scripts/environment/environment.test.mjs
node scripts/build-codex-package.mjs submission
```

Las 41 pruebas usan directorios temporales y clientes simulados. Comprueban composición del ZIP, separación de perfiles, identificador requerido, configuración Local/PROD y recuperación de instalaciones. No utilizan credenciales reales ni cambian las instalaciones actuales. La CLI real de Codex 0.141.0 también pudo instalar 0.2.15 en un perfil temporal y reconocer el MCP como `streamable_http`, habilitado y con el endpoint de producción. Con acceso de red devolvió `auth_status: o_auth`, confirmando descubrimiento OAuth; sin acceso de red había devuelto `unsupported`. Ninguno de esos estados completa el consentimiento del usuario. La aceptación visual y autenticada tiene su lista específica en `submission/review-matrix.md`.

La comprobación del entorno Local no pudo ejecutarse contra servicios reales: `localhost:3200` rechazó la conexión. No se arrancaron servidores ni se cambió de entorno. Los casos simulados de Local sí forman parte de las pruebas anteriores.

## Documentación oficial revisada

Además de las fuentes enlazadas en cada decisión: [índice de plugins](https://developers.openai.com/plugins), [concepto de servidor MCP](https://developers.openai.com/plugins/concepts/mcp-server), [optimización de metadatos](https://developers.openai.com/plugins/guides/optimize-metadata), [guías de publicación](https://developers.openai.com/plugins/plugin-guidelines) y [cambios de compatibilidad](https://developers.openai.com/plugins/changelog). El estudio cubre la documentación relevante a plugins, skills, OAuth, herramientas, UI, pruebas y distribución; no pretende certificar otras capacidades de Codex ajenas a esta integración.
