# Historial de prompts:

Prompt 1 para el Historial:
## Prompt 1 · Inicialización del esqueleto MERN
**Herramienta:** Claude Code (VS Code)  
**Rama:** `chore/setup-mern`

**Prompt utilizado:**
> Necesito inicializar el esqueleto base del proyecto Pedidos Food Truck (stack MERN en JavaScript con ESM) respetando los tres CLAUDE.md. [...] Primero explicame qué entendiste y mostrame el plan completo de archivos y dependencias. Esperá mi aprobación antes de crear nada.

**Plan revisado y ajustes aplicados antes de aprobar:**
- Postergué `mongodb-memory-server` para la etapa de historias del backend (`FOOD-01`).
- Mantuve `middlewares/` vacío para implementar `error.middleware.js` recién en `FOOD-05`.
- Aprobé `@testing-library/jest-dom` y sumé `@testing-library/user-event` para los tests de componentes.
- Dejé `docs/api.md` para generarlo al cerrar el backend a partir del código y los tests reales.
- Pedí explícitamente que `db.js` capture errores sin cerrar el proceso si falta `MONGODB_URI`, para que `GET /api/health` informe `db: "disconnected"`.
- Aprobé luego `@testing-library/dom` (peer dependency necesaria) antes de correr `npm install`.


Prompts 2 Pata el Historial: 
## Prompt 2 · Plan de pruebas del backlog y tests unitarios
**Herramienta:** Claude Code (VS Code) usando la skill `generar-tests` y MCP de Trello  
**Rama:** `chore/test-plan`

**Prompt utilizado:**
> Usá la skill `generar-tests` para crear el plan de pruebas completo del proyecto Pedidos Food Truck a partir de las 5 historias (`FOOD-01` a `FOOD-05`) del tablero de Trello **Pedidos Food Truck**. [...] Primero mostrame la tabla de casos de prueba y el listado de archivos que vas a crear. Esperá mi aprobación antes de escribir nada.

**Plan revisado y ajustes aplicados antes de aprobar:**
- Aprobé el contrato propuesto por Claude (`POST /api/pedidos`, `GET /api/pedidos/pendientes`, `GET /api/pedidos`, `PATCH /api/pedidos/:id/estado` con `{ estado }` en el body para poder probar intentos de saltear o retroceder).
- Definí el orden de `GET /api/pedidos` (`FOOD-04`) por fecha descendente (más reciente primero) y lo sumé a la tabla y a los `it.todo`.
- Pedí agregar casos borde con `null`, `undefined` y valores que no sean objeto en `validateOrder` y `validateOrderForm` para asegurar que nunca lancen excepciones.
- Aprobé crear `backend/src/utils/` y documentar la carpeta en `backend/CLAUDE.md`.

 	Commitie y volví a la rama main, estableci el comando “git checkout -b chore/test-plan” e inicie un nuevo chat con Claude para no mezclar las ventanas de contexto. 


Prompts 3 Para el Historial:

## Prompt 3 · Backend de FOOD-01 (POST /api/pedidos) y base en memoria
**Herramienta:** Claude Code (VS Code) + subagente `revisor` + MCP de Trello  
**Rama:** `feature/FOOD-01-crear-pedido`

**Prompt utilizado:**
> Implementar el backend de la historia `FOOD-01` (crear un pedido vía `POST /api/pedidos`) junto con el entorno de base de datos aislada en memoria para los tests de integración, siguiendo `CLAUDE.md`, `backend/CLAUDE.md` y `docs/test-plan.md`. [...] Primero explicame qué entendiste, mostrame el plan detallado de archivos a crear/modificar y pedime aprobación antes de instalar `mongodb-memory-server` o escribir código.

**Decisiones y revisión con subagente `revisor`:**
- Aprobé instalar `mongodb-memory-server` (`devDependency`) con helper en `backend/test/memoryDb.js` (con `launchTimeout` en 60 s por la primera ejecución de `mongod` en Windows).
- Aprobé unir errores de validación en `error.message` con `". "` y dejar el fallback `500` mínimo en `error.middleware.js`.
- Tras pasar el subagente `revisor`, apliqué mejoras menores: mensajes de Mongoose en español, chequeo `res.headersSent`, `it.each` para casos inválidos de cantidad/precio y actualización de `docs/test-plan.md` y `backend/CLAUDE.md`.
- La tarjeta `FOOD-01` queda en **En curso** hasta completar su CA5 en el frontend.
 
Commiteá y mergee a main:
feat: implementar backend de FOOD-01 crear pedido.

git checkout main
git merge feature/FOOD-01-crear-pedido
git push origin main
Prompts 4 Para el Historial:
## Prompt 4 · Backend de FOOD-02 (GET /api/pedidos/pendientes)
**Herramienta:** Claude Code (VS Code) + subagente `revisor` + MCP de Trello  
**Rama:** `feature/FOOD-02-listar-pendientes`

**Prompt utilizado:**
> Implementar el backend de la historia `FOOD-02` (listar pedidos pendientes en orden de llegada vía `GET /api/pedidos/pendientes`), siguiendo `CLAUDE.md`, `backend/CLAUDE.md` y `docs/test-plan.md`. [...] Primero explicame qué entendiste y mostrame el plan detallado de archivos a modificar. Esperá mi aprobación antes de escribir código.

**Decisiones y revisión con subagente `revisor`:**
- Aprobé filtrar los no entregados usando `FINAL_STATUS` y ordenar con `.sort({ fecha: 1, _id: 1 })` para desempatar pedidos con la misma marca temporal.
- Dejé `docs/api.md` para generarlo al cerrar todo el backend y mantuve los casos exactos de `docs/test-plan.md` sin tests extra fuera del plan.
- Tras pasar el subagente `revisor`, exporté `FINAL_STATUS` desde `utils/orderStatus.js`, moví los helpers al inicio de `orders.routes.test.js` y reemplacé el `total` hardcodeado del helper por `calculateTotal`.
- La tarjeta `FOOD-02` queda en **En curso** hasta completar CA4 y CA5 en el frontend.

Commitee y mergeá a main:
feat: implementar backend de FOOD-02 listar pedidos pendientes

git checkout main
git merge feature/FOOD-02-listar-pendientes
git push origin main

Prompts 5 Para el Historial:
## Prompt 5 · Backend de FOOD-03 (PATCH /api/pedidos/:id/estado)
**Herramienta:** Claude Code (VS Code) + subagente `revisor` + MCP de Trello  
**Rama:** `feature/FOOD-03-avanzar-estado`

**Prompt utilizado:**
> Implementar el backend de la historia `FOOD-03` (avanzar el estado de un pedido vía `PATCH /api/pedidos/:id/estado`), siguiendo `CLAUDE.md`, `backend/CLAUDE.md` y `docs/test-plan.md`. [...] Primero explicame qué entendiste y mostrame el plan detallado de archivos a modificar. Esperá mi aprobación antes de escribir código.

**Decisiones y revisión con subagente `revisor`:**
- Aprobé validar `:id` con `mongoose.isObjectIdOrHexString`, validar el body antes de consultar MongoDB y usar `findOneAndUpdate` filtrando por el estado actual con `$set` exclusivo sobre `estado` (evitando modificar `total` o `cliente` y previniendo dobles avances simultáneos).
- Aprobé devolver `400 INVALID_TRANSITION` tanto para estados desconocidos como para pedidos ya `entregado`, reutilizando directamente `validateTransition`.
- Tras pasar el subagente `revisor`, sumé `trim()` sobre `estado` (devolviendo `400 VALIDATION_ERROR` si queda vacío), separé los casos de body inválido con `it.each` junto al chequeo de orden de validación y corregí el conteo en `docs/test-plan.md`.
- La tarjeta `FOOD-03` queda en **En curso** hasta completar el CA5 en el frontend.

Commitee y mergeá a main:
feat: implementar backend de FOOD-03 avanzar estado de pedido
git checkout main
git merge feature/FOOD-03-avanzar-estado
git push origin main

Prompts 6 Para el Historial:
## Prompt 6 · Backend de FOOD-04 (GET /api/pedidos)
**Herramienta:** Claude Code (VS Code) + subagente `revisor` + MCP de Trello  
**Rama:** `feature/FOOD-04-listar-todos`

**Prompt utilizado:**
> Implementar el backend de la historia `FOOD-04` (listar todos los pedidos del historial vía `GET /api/pedidos`), siguiendo `CLAUDE.md`, `backend/CLAUDE.md` y `docs/test-plan.md`. [...] Primero explicame qué entendiste y mostrame el plan detallado de archivos a modificar. Esperá mi aprobación antes de escribir código.

**Decisiones y revisión con subagente `revisor`:**
- Aprobé implementar `listOrders()` sin filtro de estado, ordenando con `.sort({ fecha: -1, _id: -1 }).lean()` en simetría con `listPendingOrders()`.
- El subagente `revisor` no encontró bloqueantes y solo marcó mejoras opcionales/estilo (test de desempate por `_id` y `expect.arrayContaining`), que decidí no aplicar para mantener el alcance exacto de `docs/test-plan.md`.
- La tarjeta `FOOD-04` queda en **En curso** hasta completar CA2 a CA4 en el frontend.

Commitee y mergeá a main:
feat: implementar backend de FOOD-04 listar todos los pedidos
git checkout main
git merge feature/FOOD-04-listar-todos
git push origin main

Prompts 7 Para la Historia:
## Prompt 7 · Backend de FOOD-05 (manejo uniforme de errores y 404 global)
**Herramienta:** Claude Code (VS Code) + subagente `revisor` + MCP de Trello  
**Rama:** `feature/FOOD-05-manejo-errores`

**Prompt utilizado:**
> Implementar el backend de la historia `FOOD-05` (manejo uniforme de respuestas, rutas inexistentes, JSON malformado y errores inesperados), siguiendo `CLAUDE.md`, `backend/CLAUDE.md` y `docs/test-plan.md`. [...] Primero explicame qué entendiste y mostrame el plan detallado de archivos a crear/modificar. Esperá mi aprobación antes de escribir código.

**Decisiones y revisión con subagente `revisor`:**
- Aprobé centralizar `notFoundMiddleware` (`404 NOT_FOUND`) en `error.middleware.js`, capturar JSON malformado (`entity.parse.failed`) con `400 VALIDATION_ERROR` sin texto del parser y actualizar el mensaje del `500 INTERNAL_ERROR` a `"Error interno del servidor. Intentá de nuevo más tarde"`.
- Decidí no mapear `CastError`/`ValidationError` de Mongoose para evitar código muerto sin tests, dado que el service valida `:id`, payload y transiciones antes de consultar la base.
- Tras pasar el subagente `revisor`, sumé la aserción sobre el spy de `console.error` (verificando que no loguee secretos) y alineé el ejemplo de JSON malformado en `docs/test-plan.md`.
- Backend finalizado con 120/120 tests en verde y 0 `it.todo`. La tarjeta `FOOD-05` queda en **En curso** hasta completar CA3 y CA4 en el frontend.

Commitee y mergeá a main:
feat: implementar backend de FOOD-05 manejo uniforme de errores
git checkout main
git merge feature/FOOD-05-manejo-errores
git push origin main

Prompts 8 Para el Historial:
## Prompt 8 · Documentación del contrato real de la API (`docs/api.md`)
**Herramienta:** Claude Code (VS Code)  
**Rama:** `docs/api-contract`

**Prompt utilizado:**
> Generar el archivo `docs/api.md` documentando el contrato real completo de la API del proyecto **Pedidos Food Truck**, tomando como única fuente de verdad el código implementado y los tests de integración en verde de `backend/`. [...] Primero mostrame el índice propuesto y confirmame que leíste los endpoints y códigos reales. Esperá mi aprobación antes de crear `docs/api.md`.

**Decisiones aplicadas:**
- Validé el índice de 9 secciones cubriendo los 5 endpoints reales, el modelo `Pedido`, la máquina de estados, el catálogo cerrado de 5 códigos de error y el orden de validaciones de `PATCH /api/pedidos/:id/estado`.
- Incluí en "Límites conocidos" el comportamiento ante MongoDB desconectado (aclarando que no está cubierto por tests de integración) y elegí ejemplos con método, ruta y bloques JSON limpios sin `curl`.

Commitee y mergee a main:
docs: documentar contrato real de la API en docs/api.md
git checkout main
git merge docs/api-contract
git push origin main
