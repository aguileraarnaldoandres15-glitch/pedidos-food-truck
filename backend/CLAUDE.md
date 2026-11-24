# Backend (Express + Mongoose)

## Capas (`src/`)
- `routes/`: solo define rutas bajo `/api` y las conecta con controllers. Sin lógica de negocio.
- `controllers/`: lee la request, llama al service y arma la respuesta HTTP.
- `services/`: lógica de negocio, validaciones de dominio y acceso a datos. No conoce `req` ni `res`.
- `models/`: esquemas de Mongoose.
- `middlewares/`: manejo centralizado de errores (`error.middleware.js`).
- `config/`: configuración y conexión a MongoDB.
- `utils/`: funciones puras de dominio (validación de pedido, cálculo de total y transición de estados), sin acceso a datos ni a `req`/`res`.

## Validación y reglas de dominio
- Validar y normalizar (`trim`) los datos de entrada antes de guardar. Nunca confiar en el frontend.
- `cliente`: obligatorio, string no vacío ni solo espacios.
- `items`: array con al menos 1 ítem; cada ítem requiere `nombre` (no vacío), `cantidad` entera mayor a `0` y `precioUnitario` mayor a `0`.
- `total`: calculado siempre en el service como la suma de `cantidad * precioUnitario`.
- Avance de estado: solo permite la transición inmediatamente siguiente (`recibido` → `en preparación` → `listo` → `entregado`). Si se intenta saltear, retroceder o avanzar un pedido en estado `entregado`, devolver `400` con el motivo claro.
- Listado de pendientes: devuelve solo pedidos con estado distinto de `entregado`, ordenados del más antiguo al más nuevo (`fecha` ascendente).

## Contrato de respuestas y códigos HTTP
- Éxito: `{ "data": ... }` (`200` OK, `201` creado).
- Error: siempre `{ "error": { "code": "...", "message": "..." } }`.
- Códigos: `400` datos inválidos, id con formato inválido o regla de negocio incumplida; `404` recurso inexistente; `500` error inesperado sin exponer stack traces ni detalles internos.

## Otros
- ESM (`import`/`export`), `async`/`await`, sin `console.log` de datos sensibles.
- Variables en `.env` (documentadas en `.env.example`): `PORT`, `MONGODB_URI`, `CORS_ORIGIN`.
- Incluir `GET /api/health` informando el estado de la base (`connected` | `disconnected`).
- Tests con Vitest + `supertest` sobre `app` y base de datos aislada en memoria.
- Comandos: `npm run dev` y `npm test`.