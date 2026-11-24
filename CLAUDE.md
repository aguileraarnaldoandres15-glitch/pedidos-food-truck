# Pedidos Food Truck

Aplicación web full-stack para gestionar pedidos de un food truck (crear pedidos con cálculo de total en backend, avanzar estados en orden estricto y listar pendientes e historial).

## Stack
MongoDB (Mongoose) + Express + React (Vite) + Node.js. JavaScript con ESM (`import`/`export`), sin TypeScript.

## Estructura
- `frontend/`: app React + Vite. Ver `frontend/CLAUDE.md`.
- `backend/`: API Express + Mongoose. Ver `backend/CLAUDE.md`.
- `docs/`: plan de pruebas (`test-plan.md`), contrato de API (`api.md`), historial de prompts (`prompts.md`) y reflexión (`reflexion.md`).

## Reglas
- Antes de escribir código, explicá qué entendiste y proponé un plan. Esperá mi aprobación.
- No agregues funcionalidades fuera de la historia o tarea pedida.
- No instales librerías sin preguntar antes.
- No ejecutes comandos de Git (commit, checkout, merge o push) sin mi aprobación explícita.
- Nunca escribas claves, tokens ni contraseñas en el código ni en archivos del repositorio.
- Si un test falla, no modifiques el test sin preguntar: primero revisá y corregí el código.
- Las historias de usuario y sus criterios de aceptación están en el tablero de Trello **Pedidos Food Truck** (https://trello.com/b/QiA3qSrE/pedidos-food-truck).
- Cada historia se identifica como `FOOD-XX`.

## Reglas de negocio y convenciones
- Código y nombres de archivos en inglés; textos de la interfaz, mensajes de error y documentación en español.
- Configuración solo por variables de entorno; cada app tiene su `.env.example` y el `.env` real no se versiona.
- Cada app tiene su propio `package.json`; los comandos (`npm run dev`, `npm test`) se ejecutan dentro de `backend/` o `frontend/`.
- Modelo `Pedido`: `cliente`, `items` (`nombre`, `cantidad`, `precioUnitario`), `total`, `estado`, `fecha`.
- El `total` se calcula exclusivamente en el backend; se ignora cualquier total enviado por el cliente.
- Flujo estricto de estados: `recibido` → `en preparación` → `listo` → `entregado`. No se puede saltear ni retroceder, ni avanzar un pedido ya entregado.