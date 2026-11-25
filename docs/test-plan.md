# Plan de pruebas · Pedidos Food Truck

Casos de prueba derivados de los criterios de aceptación de las historias `FOOD-01` a `FOOD-05` del tablero de Trello **Pedidos Food Truck**.

**Tipos:** U = unitario · I = integración backend · C = componente frontend · M = manual / E2E

**Estado actual:** los casos U están implementados y en verde. Los 8 casos I de `FOOD-01` y los 4 casos I de `FOOD-02` están implementados y en verde sobre la base de datos en memoria. Los casos I de `FOOD-03` a `FOOD-05` y los casos C (incluidos los de `FOOD-02`) siguen escritos como `it.todo(...)` y se completan al implementar cada historia.

## Decisiones de diseño fijadas por los tests

| Tema | Decisión |
|---|---|
| Crear pedido | `POST /api/pedidos` |
| Pendientes | `GET /api/pedidos/pendientes`, ordenados por `fecha` ascendente |
| Listado completo | `GET /api/pedidos`, ordenado por `fecha` descendente (más reciente primero) |
| Avanzar estado | `PATCH /api/pedidos/:id/estado` con body `{ "estado": "<destino>" }` |
| Códigos de error | `VALIDATION_ERROR`, `INVALID_ID`, `INVALID_TRANSITION`, `NOT_FOUND`, `INTERNAL_ERROR` |
| Salida de los validadores | `{ isValid, errors, data }`. `errors` es un objeto por campo (`pedido`, `cliente`, `items`, `items[i]`, `items[i].nombre`, `items[i].cantidad`, `items[i].precioUnitario`) con mensajes en español. `data` es el pedido normalizado (`trim`) sin `total`, `estado` ni `fecha`, o `null` si es inválido. |
| Entrada no objeto | `null`, `undefined`, string, número, booleano o array devuelven `isValid: false` con error en `pedido`, sin lanzar excepciones. |
| Total | Suma de `cantidad × precioUnitario` redondeada a 2 decimales |
| Validación backend vs. frontend | El backend exige números reales (rechaza `"2"`). El frontend acepta strings numéricos de los inputs, los convierte a número y rechaza `""`. |

## Archivos de prueba

| Archivo | Tipo | Contenido |
|---|---|---|
| `backend/src/utils/orderValidation.test.js` | U | `validateOrder` |
| `backend/src/utils/orderTotal.test.js` | U | `calculateTotal` |
| `backend/src/utils/orderStatus.test.js` | U | `ORDER_STATUSES`, `getNextStatus`, `validateTransition` |
| `backend/src/routes/orders.routes.test.js` | I (`FOOD-01` y `FOOD-02` implementados; `FOOD-03` a `FOOD-05` `todo`) | endpoints de pedidos y formato de errores |
| `frontend/src/utils/orderFormValidation.test.js` | U | `validateOrderForm` |
| `frontend/src/components/OrderForm.test.jsx` | C (`todo`) | formulario de pedido |
| `frontend/src/components/OrderList.test.jsx` | C (`todo`) | detalle, estado y botón avanzar |
| `frontend/src/pages/OrdersPage.test.jsx` | C (`todo`) | cargando / vacío / error, alternar vistas, persistencia |

## Casos transversales a los validadores

| criterio | caso | entrada | resultado esperado | tipo |
|---|---|---|---|---|
| FOOD-01 CA1 / FOOD-05 CA3 | Entrada nula | `null` / `undefined` | `isValid: false`, error en `pedido`, `data: null`, sin lanzar | U |
| FOOD-01 CA1 / FOOD-05 CA3 | Entrada que no es objeto | `"pedido"` / `42` / `true` / `[...]` | `isValid: false`, error en `pedido`, sin lanzar | U |

## FOOD-01 · Crear un pedido

| criterio | caso | entrada | resultado esperado | tipo |
|---|---|---|---|---|
| CA1 | Pedido válido mínimo | `{cliente:"Ana", items:[{nombre:"Pancho",cantidad:2,precioUnitario:1500}]}` | `isValid: true`, `errors` vacío | U |
| CA1 | Normaliza espacios | `cliente:"  Ana  "`, `nombre:"  Pancho "` | `data.cliente === "Ana"`, `data.items[0].nombre === "Pancho"` | U |
| CA1 | Cliente vacío | `cliente:""` | error en `cliente` | U |
| CA1 | Cliente ausente | sin `cliente` | error en `cliente` | U |
| CA1 | Cliente solo espacios | `cliente:"   "` | error en `cliente` | U |
| CA1 | Cliente de tipo incorrecto | `cliente:123` / `null` | error en `cliente` | U |
| CA1 | Sin ítems | `items:[]` | error en `items` | U |
| CA1 | Ítems ausentes | sin `items` | error en `items` | U |
| CA1 | Ítems no es array | `items:"pancho"` / `null` / `{}` | error en `items` | U |
| CA1 | Nombre de ítem inválido | `nombre:""` / `"   "` / `null` / ausente | error en `items[0].nombre` | U |
| CA1 | Cantidad 0 | `cantidad:0` | error en `items[0].cantidad` | U |
| CA1 | Cantidad negativa | `cantidad:-1` | error en `items[0].cantidad` | U |
| CA1 | Cantidad decimal | `cantidad:1.5` | error en `items[0].cantidad` (debe ser entera) | U |
| CA1 | Cantidad de tipo incorrecto | `"2"` / `null` / `NaN` / `Infinity` / ausente | error en `items[0].cantidad` | U |
| CA1 | Precio 0 | `precioUnitario:0` | error en `items[0].precioUnitario` | U |
| CA1 | Precio negativo | `precioUnitario:-100` | error en `items[0].precioUnitario` | U |
| CA1 | Precio de tipo incorrecto | `"1500"` / `null` / `NaN` / `Infinity` / ausente | error en `items[0].precioUnitario` | U |
| CA1 | Precio decimal permitido | `precioUnitario:1500.5` | `isValid: true` | U |
| CA1 | Varios ítems válidos | 2 ítems válidos | `isValid: true`, `data.items` con 2 elementos | U |
| CA1 | Ítem inválido entre varios | 3 ítems, el segundo con `cantidad:0` | error solo en `items[1].cantidad` | U |
| CA1 | Ítem no es objeto | `items:[null]` / `["x"]` / `[5]` | error en `items[0]` | U |
| CA1 | Varios errores a la vez | cliente vacío + `cantidad:0` + `precioUnitario:-1` | reporta los 3 errores | U |
| CA2 | Se descarta el total del cliente | input con `total:1` | `data` no tiene `total` | U |
| CA2 | Se descartan estado y fecha del cliente | input con `estado:"entregado"`, `fecha:"2020-01-01"` | `data` no tiene `estado` ni `fecha` | U |
| CA2 | Se descartan campos extra del ítem | ítem con `subtotal:999` | el ítem solo tiene `nombre`, `cantidad`, `precioUnitario` | U |
| CA2 | Total de un ítem | `[{cantidad:2, precioUnitario:1500}]` | `3000` | U |
| CA2 | Total de varios ítems | `2×1500 + 1×800 + 3×500` | `5300` | U |
| CA2 | Total con decimales | `3 × 0.1` / `2 × 1500.5` | `0.3` / `3001` | U |
| CA2 | Total de lista vacía | `[]` | `0` | U |
| CA2 | Total ignora el enviado (API) | `POST` válido con `total:1` | `201`, `data.total === 3000`, en la DB también `3000` | I |
| CA3 | Creación exitosa | `POST` válido | `201` con `{data:{_id, cliente, items, total, estado:"recibido", fecha}}` | I |
| CA3 | Estado y fecha forzados | `POST` con `estado:"entregado"`, `fecha` vieja | se guarda `estado:"recibido"` y la fecha actual | I |
| CA4 | Sin cliente → 400 | `POST` sin `cliente` | `400`, `{error:{code:"VALIDATION_ERROR", message}}`, 0 pedidos en la DB | I |
| CA4 | Cliente solo espacios → 400 | `cliente:"   "` | `400`, no se crea | I |
| CA4 | Sin ítems → 400 | `items:[]` | `400`, no se crea | I |
| CA4 | Cantidad inválida → 400 | `cantidad:0` / `-1` / `1.5` | `400`, no se crea | I |
| CA4 | Precio inválido → 400 | `precioUnitario:0` / `-1` | `400`, no se crea | I |
| CA5 | Formulario envía el pedido | completar cliente + ítem y enviar | se llama `api.createOrder` con `{cliente, items}` y sin `total` | C |
| CA5 | Formulario con varios ítems | agregar un segundo ítem y enviar | `items` lleva 2 elementos | C |
| CA5 | Pedido creado visible | `createOrder` resuelve | el pedido aparece en la lista | C |
| CA5 | Persistencia al recargar | montar la página de nuevo (simula recarga) | se llama a `api` y se muestran los pedidos | C + M |

## FOOD-02 · Pendientes en orden de llegada

| criterio | caso | entrada | resultado esperado | tipo |
|---|---|---|---|---|
| CA1 | Excluye entregados | 4 pedidos, uno por estado | `200`, `data` sin el `entregado` | I |
| CA1 | Solo entregados | 2 pedidos `entregado` | `200`, `data: []` | I |
| CA2 | Orden por fecha ascendente | pedidos insertados con fechas desordenadas | `data` ordenado del más antiguo al más nuevo | I |
| CA3 | Forma de cada pedido | `GET` pendientes | cada elemento tiene `cliente`, `items[{nombre,cantidad}]`, `total`, `estado`, `fecha` | I |
| CA3 | Detalle visible | lista con 1 pedido | se ven cliente, "2 × Pancho", total, estado y fecha/hora | C |
| CA4 | Cargando | `api` con promesa pendiente | indicador de carga visible | C |
| CA4 | Lista vacía | `api` resuelve `[]` | mensaje de lista vacía | C |
| CA5 | Error de API | `api` rechaza `{message:"No se pudo…"}` | se muestra ese `message` | C |

## FOOD-03 · Avanzar estado

| criterio | caso | entrada | resultado esperado | tipo |
|---|---|---|---|---|
| CA1 | Orden de estados | `ORDER_STATUSES` | `['recibido','en preparación','listo','entregado']` | U |
| CA1 | Siguiente estado | `getNextStatus` de cada estado | `recibido→en preparación→listo→entregado`, `entregado→null` | U |
| CA1 | Estado desconocido | `getNextStatus("cancelado" / "" / undefined / null)` | `null` | U |
| CA1 | Transiciones válidas | `(recibido, en preparación)`, `(en preparación, listo)`, `(listo, entregado)` | `{ok:true}` | U |
| CA2 | Saltear | `(recibido, listo)`, `(recibido, entregado)`, `(en preparación, entregado)` | `{ok:false, reason}` con motivo "saltear" | U |
| CA2 | Retroceder | `(listo, recibido)`, `(en preparación, recibido)`, `(listo, en preparación)` | `{ok:false, reason}` con motivo "retroceder" | U |
| CA2 | Mismo estado | `(recibido, recibido)` | `{ok:false}` | U |
| CA2 | Destino inválido | `"cancelado"` / `""` / `undefined` / `null` | `{ok:false}` con motivo "no es válido" | U |
| CA2 | Estado actual desconocido | `("cancelado", listo)` | `{ok:false}` con motivo "no es válido" | U |
| CA3 | Desde entregado | `(entregado, cualquiera)` | `{ok:false}` con motivo "ya fue entregado" (tiene prioridad) | U |
| CA1 | Avance válido (API) | `PATCH` con cada siguiente estado | `200`, `data.estado` actualizado | I |
| CA2 | Saltear (API) | `recibido` → `{estado:"listo"}` | `400 INVALID_TRANSITION`, la DB sigue en `recibido` | I |
| CA2 | Retroceder (API) | `listo` → `{estado:"recibido"}` | `400`, sin cambios | I |
| CA2 | Body inválido | sin `estado` / `estado:"cancelado"` | `400` | I |
| CA2 | Solo cambia el estado | body `{estado:"en preparación", total:1, cliente:"X"}` | `total` y `cliente` quedan iguales | I |
| CA3 | Ya entregado (API) | pedido `entregado` | `400`, mensaje "ya fue entregado", sin cambios | I |
| CA4 | Id inexistente | ObjectId válido que no existe | `404 NOT_FOUND` | I |
| CA4 | Id con formato inválido | `/api/pedidos/abc/estado` | `400 INVALID_ID` | I |
| CA5 | Botón avanzar | clic en "Avanzar a en preparación" | se notifica el pedido y el siguiente estado (`api.updateOrderStatus(id, "en preparación")`) | C |
| CA5 | Actualización inmediata | `updateOrderStatus` resuelve | el nuevo estado se ve sin recargar | C |
| CA5 | Sale de pendientes | avanzar a `entregado` en la vista de pendientes | el pedido deja de verse | C |
| CA5 | Entregado sin botón | pedido `entregado` en el historial | no hay botón de avanzar | C |
| CA5 | Error 400 visible | `updateOrderStatus` rechaza | se muestra `message` | C |
| CA5 | Persistencia | avanzar y recargar | se mantiene el estado | M |

## FOOD-04 · Listado completo

| criterio | caso | entrada | resultado esperado | tipo |
|---|---|---|---|---|
| CA1 | Todos los estados | 4 pedidos, uno por estado | `200`, `data` con los 4 | I |
| CA1 | Orden por fecha descendente | pedidos insertados con fechas desordenadas | `data` ordenado del más reciente al más antiguo | I |
| CA1 | Sin pedidos | DB vacía | `200`, `data: []` | I |
| CA2 | Detalle y estado | lista con pedidos en distintos estados | se ven cliente, ítems, total, fecha y una etiqueta de estado distinta por pedido | C |
| CA2 | Diferencia visual | revisión visual | cada estado se distingue a simple vista | M |
| CA3 | Alternar vistas | clic en "Todos" y después en "Pendientes" | se llama `api.getOrders` / `api.getPendingOrders` y la lista cambia | C |
| CA4 | Cargando / vacío / error | promesa pendiente / `[]` / rechazo | indicador / "todavía no hay pedidos" / `message` | C |

## FOOD-05 · Errores uniformes

| criterio | caso | entrada | resultado esperado | tipo |
|---|---|---|---|---|
| CA1 | Ruta inexistente | `GET /api/xyz` | `404` con `{error:{code:"NOT_FOUND", message}}` | I |
| CA1 | JSON malformado | body `"{cliente:"` | `400` con formato `{error}` y sin stack | I |
| CA1 | Éxito con `{data}` | `GET /api/pedidos` | el body tiene solo la clave `data` | I |
| CA2 | Error inesperado | el service lanza (`vi.spyOn`) | `500 INTERNAL_ERROR`, mensaje genérico, sin `stack` ni detalles internos | I |
| CA3 | Validación en el front: válido | `{cliente:"Ana", items:[{nombre:"Pancho", cantidad:"2", precioUnitario:"1500"}]}` | `isValid: true`, `data` con números convertidos | U |
| CA3 | Números ya numéricos | `cantidad:3`, `precioUnitario:800` | `isValid: true` | U |
| CA3 | Normaliza espacios | `cliente:"  Ana  "`, `nombre:" Pancho  "` | valores con `trim` | U |
| CA3 | Sin total en lo enviado | input con `total:1` | `data` no tiene `total` | U |
| CA3 | Cliente vacío, ausente o solo espacios | `""` / `"   "` / `null` / ausente | error en `cliente` | U |
| CA3 | Sin ítems | `[]` / `null` / `"pancho"` / ausente | error en `items` | U |
| CA3 | Ítem no es objeto | `items:[null]` | error en `items[0]` | U |
| CA3 | Nombre de ítem vacío | `""` / `"  "` | error en `items[0].nombre` | U |
| CA3 | Cantidad inválida | `""` / `"0"` / `-1` / `"1.5"` / `"abc"` / `null` | error en `items[0].cantidad` | U |
| CA3 | Precio inválido | `""` / `"0"` / `-5` / `"abc"` / `null` | error en `items[0].precioUnitario` | U |
| CA3 | Precio decimal permitido | `"1500.5"` | sin error, `precioUnitario === 1500.5` | U |
| CA3 | Varios errores | cliente `"   "` + ítem con todo inválido | reporta los 4 errores | U |
| CA3 | El formulario bloquea el envío | enviar con cliente vacío o ítem inválido | se muestra el error junto al formulario y **no** se llama `api.createOrder` | C |
| CA4 | Error de API en el formulario | `createOrder` rechaza `{code, message}` | se muestra `message` | C |

## Base de datos para los tests de integración

Los casos I usan una base de datos aislada en memoria con `mongodb-memory-server` (`devDependency` de `backend/`). El helper `backend/test/memoryDb.js` expone `connectMemoryDb`, `clearMemoryDb` y `disconnectMemoryDb`, que cada archivo de integración usa en `beforeAll`, `afterEach` y `afterAll`. La primera ejecución descarga el binario de MongoDB y lo deja en caché.
