---
name: generar-tests
description: Convierte criterios de aceptación en una tabla de casos de prueba y, tras aprobación, en tests con Vitest. Usar cuando haya que generar el plan de pruebas o tests a partir de una historia FOOD-XX de Pedidos Food Truck.
---

# Generar tests desde criterios de aceptación

## Flujo
1. Obtené los criterios de aceptación de la historia (desde el tablero de Trello **Pedidos Food Truck** por MCP o los que pase el usuario).
2. Convertí cada criterio en uno o más casos de prueba y mostrá la tabla con columnas: `criterio | caso | entrada | resultado esperado | tipo`.
3. **Esperá la aprobación del usuario.** No escribas archivos de test antes de recibir el OK.
4. Con la tabla aprobada, escribí los tests con Vitest.

## Casos borde (incluir siempre los que apliquen)
- Cliente vacío (`""`, campo ausente) o solo espacios (`"   "`).
- Pedido sin ítems (`[]` o campo ausente).
- Cantidades o precios unitarios iguales a `0`, negativos, decimales en cantidad o de tipo incorrecto (`string`, `null`).
- Envío de un `total` manipulado desde el cliente (debe ignorarse y prevalecer el cálculo del backend).
- Intentar avanzar un pedido que ya está en estado `entregado`.
- Intentar saltear un estado (ej. `recibido` → `listo`) o retroceder de estado.
- Id inexistente (formato válido que no existe → `404`) e id con formato inválido (`400`).
- Estados de pantalla en frontend: cargando, lista vacía y error de API.

## Convenciones de escritura
- Backend: Vitest + `supertest` sobre `backend/src/app.js`. Frontend: Vitest + `@testing-library/react`.
- Archivos junto al código con sufijo `.test.js` / `.test.jsx`.
- Nombres de `describe` e `it` en español; código y archivos en inglés.
- Si el endpoint, servicio o componente todavía no existe, escribilo como `it.todo('descripción')`. No implementes código de producción en esta skill.
- Si un test falla, no modifiques el test sin preguntar: revisá y corregí el código.