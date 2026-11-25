# Contrato de la API — Pedidos Food Truck

Documentación del contrato real de la API del backend (`backend/`). Se toma como fuente de verdad el código implementado y los tests de integración (`health.routes.test.js` y `orders.routes.test.js`).

## Índice

1. [Información general](#1-información-general)
2. [Formato de respuestas](#2-formato-de-respuestas)
3. [Modelo `Pedido`](#3-modelo-pedido)
4. [Máquina de estados](#4-máquina-de-estados)
5. [Reglas de negocio aplicadas en el servidor](#5-reglas-de-negocio-aplicadas-en-el-servidor)
6. [Endpoints](#6-endpoints)
   - 6.1 [`GET /api/health`](#61-get-apihealth)
   - 6.2 [`POST /api/pedidos`](#62-post-apipedidos)
   - 6.3 [`GET /api/pedidos/pendientes`](#63-get-apipedidospendientes)
   - 6.4 [`GET /api/pedidos`](#64-get-apipedidos)
   - 6.5 [`PATCH /api/pedidos/:id/estado`](#65-patch-apipedidosidestado)
7. [Catálogo de códigos de error](#7-catálogo-de-códigos-de-error)
8. [Orden de validaciones en `PATCH /api/pedidos/:id/estado`](#8-orden-de-validaciones-en-patch-apipedidosidestado)
9. [Límites conocidos](#9-límites-conocidos)

---

## 1. Información general

| Aspecto | Valor |
| --- | --- |
| Base URL (local) | `http://localhost:3000/api` |
| Puerto | Variable de entorno `PORT` (por defecto `3000`) |
| CORS | Un único origen permitido, variable `CORS_ORIGIN` (por defecto `http://localhost:5173`) |
| Formato | JSON en requests y responses |
| Autenticación | No tiene |
| Paginación, filtros y query params | No tiene ningún endpoint |

**Headers del request**

En `POST` y `PATCH` el body se envía como JSON:

```
Content-Type: application/json
```

Todas las respuestas, exitosas o de error, tienen `Content-Type: application/json`.

---

## 2. Formato de respuestas

Todas las respuestas siguen un formato uniforme.

**Éxito.** La única clave del body es `data`, que contiene un objeto o un array:

```json
{
  "data": { }
}
```

**Error.** La única clave del body es `error`, con un `code` del catálogo (ver [sección 7](#7-catálogo-de-códigos-de-error)) y un `message` en español, nunca vacío:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El nombre del cliente es obligatorio"
  }
}
```

Las respuestas de error nunca incluyen el stack, los mensajes internos de Mongoose o MongoDB, ni el body original del request.

---

## 3. Modelo `Pedido`

Así se ve un pedido en las respuestas de la API:

```json
{
  "_id": "6745f1a2b3c4d5e6f7a8b9c0",
  "cliente": "Ana",
  "items": [
    { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
  ],
  "total": 3000,
  "estado": "recibido",
  "fecha": "2026-01-01T10:00:00.000Z"
}
```

| Campo | Tipo | Reglas | Lo define |
| --- | --- | --- | --- |
| `_id` | string (ObjectId de 24 caracteres hexadecimales) | Generado por MongoDB | Servidor |
| `cliente` | string | Obligatorio, no vacío; se guarda con `trim` | Cliente |
| `items` | array de ítems | Al menos 1 ítem | Cliente |
| `items[].nombre` | string | Obligatorio, no vacío; se guarda con `trim` | Cliente |
| `items[].cantidad` | number | Entero mayor a 0 | Cliente |
| `items[].precioUnitario` | number | Mayor a 0; admite decimales | Cliente |
| `total` | number | `Σ cantidad × precioUnitario`, redondeado a 2 decimales | Servidor |
| `estado` | string | Uno de `recibido`, `en preparación`, `listo`, `entregado`. Valor inicial: `recibido` | Servidor (al crear) / `PATCH` (al avanzar) |
| `fecha` | string (ISO 8601, UTC) | Momento de creación del pedido | Servidor |

Observaciones:

- Los ítems no tienen `_id` propio.
- Las respuestas no incluyen el campo `__v` (el schema se define con `versionKey: false`).

---

## 4. Máquina de estados

Un pedido solo puede avanzar al estado inmediatamente siguiente:

```
recibido ──► en preparación ──► listo ──► entregado
```

`entregado` es el estado final: un pedido entregado no puede volver a modificarse.

| Estado actual | Única transición permitida |
| --- | --- |
| `recibido` | `en preparación` |
| `en preparación` | `listo` |
| `listo` | `entregado` |
| `entregado` | Ninguna |

Transiciones rechazadas (todas responden `400 INVALID_TRANSITION`):

| Caso | Ejemplo | Mensaje |
| --- | --- | --- |
| Pedido ya entregado | `entregado` → `listo` | `El pedido ya fue entregado y no se puede modificar` |
| Estado desconocido | `recibido` → `cancelado` | `El estado "cancelado" no es válido. Estados permitidos: recibido, en preparación, listo, entregado` |
| Mismo estado | `recibido` → `recibido` | `El pedido ya está en estado "recibido"` |
| Retroceso | `listo` → `recibido` | `No se puede retroceder el pedido de "listo" a "recibido"` |
| Salteo | `recibido` → `listo` | `No se puede saltear estados: desde "recibido" solo se puede pasar a "en preparación"` |

---

## 5. Reglas de negocio aplicadas en el servidor

- **Cálculo del `total`.** Lo calcula siempre el backend como `Σ cantidad × precioUnitario` y lo redondea a 2 decimales para evitar errores de punto flotante (por ejemplo, `3 × 0.1` da `0.3`). Si el cliente envía un `total`, se ignora.
- **`estado` inicial.** Todo pedido nuevo se crea en `recibido`. Si el cliente envía un `estado` al crear, se ignora.
- **`fecha`.** Se asigna en el servidor al momento de la creación. Si el cliente envía una `fecha`, se ignora.
- **`trim`.** Se recortan los espacios de `cliente`, `items[].nombre` y del `estado` enviado en el `PATCH`. Un texto compuesto solo por espacios se considera vacío.
- **Campos desconocidos.** Al crear un pedido solo se guardan `cliente` e `items` con `nombre`, `cantidad` y `precioUnitario`. Cualquier otro campo se descarta, tanto en el pedido como dentro de cada ítem.
- **Tipos estrictos.** `cantidad` y `precioUnitario` deben ser de tipo `number` en el JSON. Un valor como texto (por ejemplo `"2"`) se rechaza.
- **Actualización exclusiva de `estado`.** `PATCH /api/pedidos/:id/estado` solo lee `estado` del body. Si se envían `cliente`, `items`, `total`, `fecha` u otros campos, se ignoran y el pedido no los modifica.
- **Avances simultáneos.** La actualización filtra por el estado actual del pedido. Si dos requests intentan avanzar el mismo pedido a la vez, solo uno se aplica y el otro recibe `400 INVALID_TRANSITION`.

---

## 6. Endpoints

| Método | Ruta | Descripción | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Estado de la API y de la conexión a MongoDB | `200` |
| `POST` | `/api/pedidos` | Crea un pedido | `201` |
| `GET` | `/api/pedidos/pendientes` | Lista los pedidos no entregados | `200` |
| `GET` | `/api/pedidos` | Lista todos los pedidos (historial) | `200` |
| `PATCH` | `/api/pedidos/:id/estado` | Avanza el estado de un pedido | `200` |

### 6.1 `GET /api/health`

Informa si la API está funcionando y si hay conexión con MongoDB. No consulta la base de datos: solo lee el estado de la conexión.

**Request**

```
GET /api/health
```

Sin body.

**Respuesta exitosa — `200 OK`**

```json
{
  "data": {
    "status": "ok",
    "db": "connected"
  }
}
```

| Campo | Valores |
| --- | --- |
| `status` | Siempre `"ok"` |
| `db` | `"connected"` si hay conexión con MongoDB; `"disconnected"` en cualquier otro caso |

La API responde `200` aunque MongoDB no esté conectado. En ese caso `db` vale `"disconnected"`.

**Errores posibles**

Este endpoint no tiene errores propios.

### 6.2 `POST /api/pedidos`

Crea un pedido nuevo. El servidor calcula el `total` y asigna `estado` y `fecha`.

**Request**

```
POST /api/pedidos
Content-Type: application/json
```

```json
{
  "cliente": "Ana",
  "items": [
    { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
  ]
}
```

| Campo | Tipo | Obligatorio | Reglas |
| --- | --- | --- | --- |
| `cliente` | string | Sí | No vacío después de `trim` |
| `items` | array | Sí | Al menos 1 ítem; cada ítem debe ser un objeto |
| `items[].nombre` | string | Sí | No vacío después de `trim` |
| `items[].cantidad` | number | Sí | Entero mayor a 0 |
| `items[].precioUnitario` | number | Sí | Mayor a 0 |

Los campos `total`, `estado` y `fecha` se ignoran si se envían.

**Respuesta exitosa — `201 Created`**

```json
{
  "data": {
    "_id": "6745f1a2b3c4d5e6f7a8b9c0",
    "cliente": "Ana",
    "items": [
      { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
    ],
    "total": 3000,
    "estado": "recibido",
    "fecha": "2026-01-01T10:00:00.000Z"
  }
}
```

Ejemplo con campos que el servidor ignora. Este request:

```json
{
  "cliente": "Ana",
  "items": [
    { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
  ],
  "total": 1,
  "estado": "entregado",
  "fecha": "2020-01-01"
}
```

responde `201` con `total: 3000`, `estado: "recibido"` y la `fecha` actual del servidor.

**Errores posibles**

| HTTP | `error.code` | Cuándo |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | El body no es un objeto, falta `cliente` o está vacío, `items` falta o está vacío, o algún ítem es inválido |
| `400` | `VALIDATION_ERROR` | El body no es un JSON válido |
| `500` | `INTERNAL_ERROR` | Error inesperado del servidor |

Si hay errores en varios campos, `message` los reúne en un solo texto separados por `". "`. En ningún caso se crea el pedido.

Mensajes por campo:

| Caso | Mensaje |
| --- | --- |
| El body no es un objeto | `Los datos del pedido deben enviarse como un objeto` |
| `cliente` falta, no es texto o está vacío | `El nombre del cliente es obligatorio` |
| `items` falta, no es array o está vacío | `El pedido debe tener al menos un ítem` |
| Un ítem no es un objeto | `El ítem N no es válido` |
| `nombre` inválido | `El nombre del ítem N es obligatorio` |
| `cantidad` inválida (0, negativa, decimal o no numérica) | `La cantidad del ítem N debe ser un número entero mayor a 0` |
| `precioUnitario` inválido (0, negativo o no numérico) | `El precio unitario del ítem N debe ser un número mayor a 0` |

`N` es la posición del ítem empezando en 1.

Ejemplo: falta `cliente` y `items` está vacío.

```json
{
  "items": []
}
```

Respuesta `400 Bad Request`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El nombre del cliente es obligatorio. El pedido debe tener al menos un ítem"
  }
}
```

Ejemplo: cantidad igual a 0 en el primer ítem.

```json
{
  "cliente": "Ana",
  "items": [
    { "nombre": "Pancho", "cantidad": 0, "precioUnitario": 1500 }
  ]
}
```

Respuesta `400 Bad Request`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La cantidad del ítem 1 debe ser un número entero mayor a 0"
  }
}
```

Ejemplo: JSON malformado (`{"cliente":`).

Respuesta `400 Bad Request`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El cuerpo de la solicitud no es un JSON válido"
  }
}
```

### 6.3 `GET /api/pedidos/pendientes`

Lista los pedidos que todavía no fueron entregados, es decir, los que están en `recibido`, `en preparación` o `listo`.

**Request**

```
GET /api/pedidos/pendientes
```

Sin body ni query params.

**Orden:** por `fecha` ascendente (del más antiguo al más nuevo). Si dos pedidos tienen la misma `fecha`, se desempata por `_id` ascendente.

**Respuesta exitosa — `200 OK`**

```json
{
  "data": [
    {
      "_id": "6745f1a2b3c4d5e6f7a8b9c0",
      "cliente": "Ana",
      "items": [
        { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
      ],
      "total": 3000,
      "estado": "recibido",
      "fecha": "2026-01-01T10:00:00.000Z"
    },
    {
      "_id": "6745f1a2b3c4d5e6f7a8b9c1",
      "cliente": "Beto",
      "items": [
        { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
      ],
      "total": 3000,
      "estado": "en preparación",
      "fecha": "2026-01-01T10:05:00.000Z"
    }
  ]
}
```

Si no hay pedidos pendientes, o si todos están entregados, responde `200` con:

```json
{
  "data": []
}
```

**Errores posibles**

| HTTP | `error.code` | Cuándo |
| --- | --- | --- |
| `500` | `INTERNAL_ERROR` | Error inesperado del servidor |

### 6.4 `GET /api/pedidos`

Lista el historial completo de pedidos, en todos los estados (incluidos los entregados).

**Request**

```
GET /api/pedidos
```

Sin body ni query params.

**Orden:** por `fecha` descendente (del más reciente al más antiguo). Si dos pedidos tienen la misma `fecha`, se desempata por `_id` descendente.

**Respuesta exitosa — `200 OK`**

```json
{
  "data": [
    {
      "_id": "6745f1a2b3c4d5e6f7a8b9c3",
      "cliente": "Dani",
      "items": [
        { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
      ],
      "total": 3000,
      "estado": "entregado",
      "fecha": "2026-01-01T10:15:00.000Z"
    },
    {
      "_id": "6745f1a2b3c4d5e6f7a8b9c0",
      "cliente": "Ana",
      "items": [
        { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
      ],
      "total": 3000,
      "estado": "recibido",
      "fecha": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

Si no hay pedidos, responde `200` con:

```json
{
  "data": []
}
```

**Errores posibles**

| HTTP | `error.code` | Cuándo |
| --- | --- | --- |
| `500` | `INTERNAL_ERROR` | Error inesperado del servidor |

### 6.5 `PATCH /api/pedidos/:id/estado`

Avanza el estado de un pedido al inmediatamente siguiente (ver [sección 4](#4-máquina-de-estados)). Solo se modifica `estado`.

**Request**

```
PATCH /api/pedidos/6745f1a2b3c4d5e6f7a8b9c0/estado
Content-Type: application/json
```

```json
{
  "estado": "en preparación"
}
```

| Parámetro | Ubicación | Tipo | Reglas |
| --- | --- | --- | --- |
| `id` | Ruta | string | ObjectId válido (24 caracteres hexadecimales) |
| `estado` | Body | string | Obligatorio, no vacío después de `trim`; debe ser el estado siguiente al actual |

El `estado` se normaliza con `trim`: `"  en preparación  "` se acepta como `"en preparación"`. Cualquier otro campo del body se ignora.

**Respuesta exitosa — `200 OK`**

Devuelve el pedido completo con el estado actualizado:

```json
{
  "data": {
    "_id": "6745f1a2b3c4d5e6f7a8b9c0",
    "cliente": "Ana",
    "items": [
      { "nombre": "Pancho", "cantidad": 2, "precioUnitario": 1500 }
    ],
    "total": 3000,
    "estado": "en preparación",
    "fecha": "2026-01-01T10:00:00.000Z"
  }
}
```

**Errores posibles**

En todos los casos de error el pedido no se modifica.

| HTTP | `error.code` | Cuándo | Mensaje |
| --- | --- | --- | --- |
| `400` | `INVALID_ID` | El `id` no tiene formato de ObjectId | `El id del pedido no tiene un formato válido` |
| `400` | `VALIDATION_ERROR` | `estado` falta, no es texto o está vacío (incluido solo espacios) | `El estado es obligatorio y debe ser un texto` |
| `400` | `VALIDATION_ERROR` | El body no es un JSON válido | `El cuerpo de la solicitud no es un JSON válido` |
| `404` | `NOT_FOUND` | El `id` es válido pero el pedido no existe | `El pedido no existe` |
| `400` | `INVALID_TRANSITION` | Pedido ya entregado, estado desconocido, mismo estado, retroceso o salteo | Ver [sección 4](#4-máquina-de-estados) |
| `400` | `INVALID_TRANSITION` | Otro request cambió el estado del pedido mientras se actualizaba | `El estado del pedido cambió mientras se actualizaba. Intentá de nuevo` |
| `500` | `INTERNAL_ERROR` | Error inesperado del servidor | `Error interno del servidor. Intentá de nuevo más tarde` |

Ejemplo: saltear de `recibido` a `listo`.

```
PATCH /api/pedidos/6745f1a2b3c4d5e6f7a8b9c0/estado
```

```json
{
  "estado": "listo"
}
```

Respuesta `400 Bad Request`:

```json
{
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "No se puede saltear estados: desde \"recibido\" solo se puede pasar a \"en preparación\""
  }
}
```

Ejemplo: avanzar un pedido ya entregado.

```json
{
  "estado": "listo"
}
```

Respuesta `400 Bad Request`:

```json
{
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "El pedido ya fue entregado y no se puede modificar"
  }
}
```

Ejemplo: `id` con formato inválido.

```
PATCH /api/pedidos/abc/estado
```

Respuesta `400 Bad Request`:

```json
{
  "error": {
    "code": "INVALID_ID",
    "message": "El id del pedido no tiene un formato válido"
  }
}
```

Ejemplo: `id` válido que no existe.

Respuesta `404 Not Found`:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "El pedido no existe"
  }
}
```

---

## 7. Catálogo de códigos de error

Esta es la lista completa de valores de `error.code`. La API no devuelve ningún otro código.

| `error.code` | HTTP | Cuándo ocurre | Mensaje |
| --- | --- | --- | --- |
| `VALIDATION_ERROR` | `400` | Datos inválidos al crear un pedido | Uno o varios mensajes por campo (ver [6.2](#62-post-apipedidos)) |
| `VALIDATION_ERROR` | `400` | `estado` ausente, no textual o vacío en el `PATCH` | `El estado es obligatorio y debe ser un texto` |
| `VALIDATION_ERROR` | `400` | Body con JSON malformado | `El cuerpo de la solicitud no es un JSON válido` |
| `INVALID_ID` | `400` | `id` de la ruta sin formato de ObjectId | `El id del pedido no tiene un formato válido` |
| `INVALID_TRANSITION` | `400` | Transición de estado no permitida o conflicto por avance simultáneo | Ver [sección 4](#4-máquina-de-estados) y [6.5](#65-patch-apipedidosidestado) |
| `NOT_FOUND` | `404` | El pedido no existe | `El pedido no existe` |
| `NOT_FOUND` | `404` | Ruta o método inexistente (por ejemplo `GET /api/xyz` o `DELETE /api/pedidos`) | `La ruta solicitada no existe` |
| `INTERNAL_ERROR` | `500` | Cualquier error inesperado. El servidor registra en consola solo el tipo de error, sin detalles | `Error interno del servidor. Intentá de nuevo más tarde` |

Ejemplo de ruta inexistente:

```
GET /api/xyz
```

Respuesta `404 Not Found`:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La ruta solicitada no existe"
  }
}
```

---

## 8. Orden de validaciones en `PATCH /api/pedidos/:id/estado`

Las validaciones se aplican en este orden. Se devuelve el primer error que se encuentre:

1. **Formato del `id`.** Si no es un ObjectId válido → `400 INVALID_ID`.
2. **Body.** Si `estado` falta, no es string o queda vacío después del `trim` → `400 VALIDATION_ERROR`. Esta validación ocurre antes de buscar el pedido: un body inválido sobre un `id` inexistente responde `400` y no `404`.
3. **Existencia del pedido.** Si no existe → `404 NOT_FOUND`.
4. **Transición.** Se evalúa en este orden y todas responden `400 INVALID_TRANSITION`:
   1. Pedido ya `entregado`. Se chequea antes que el estado pedido, así que un pedido entregado responde siempre "ya fue entregado", incluso si el `estado` enviado es desconocido.
   2. `estado` desconocido.
   3. Mismo estado que el actual.
   4. Retroceso.
   5. Salteo de estados.
5. **Actualización.** Si otro request cambió el estado en el medio → `400 INVALID_TRANSITION`.

El JSON malformado se detecta antes de todo esto, al parsear el body, y responde `400 VALIDATION_ERROR`.

---

## 9. Límites conocidos

- **Otros errores de `express.json()`.** Solo el JSON malformado (`entity.parse.failed`) se traduce a `400 VALIDATION_ERROR`. Los demás errores 4xx del parser, como un payload mayor a 100kb o un charset no soportado, hoy responden `500 INTERNAL_ERROR`.
- **Body sin `Content-Type: application/json`.** El body no se parsea. En `POST /api/pedidos` responde `400 VALIDATION_ERROR` con `Los datos del pedido deben enviarse como un objeto`, y en `PATCH /api/pedidos/:id/estado` responde `400 VALIDATION_ERROR` con `El estado es obligatorio y debe ser un texto`.
- **Estado desconocido.** Un `estado` con un texto que no es ninguno de los 4 estados válidos responde `INVALID_TRANSITION`, no `VALIDATION_ERROR`.
- **MongoDB desconectado.** `GET /api/health` sigue respondiendo `200` con `db: "disconnected"`, pero los endpoints de pedidos fallan y responden `500 INTERNAL_ERROR` después del timeout de Mongoose. Este comportamiento no está cubierto por tests de integración.
- **Funcionalidades no disponibles.** No hay endpoints para obtener un pedido por `id`, editar sus datos o eliminarlo. Tampoco hay paginación, filtros ni autenticación.
