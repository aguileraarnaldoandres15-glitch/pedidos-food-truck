# Frontend (React + Vite)

## Componentes
- Solo componentes funcionales con hooks. Sin clases.
- Un componente por archivo, en PascalCase (ej. `OrderForm.jsx`), exportado por defecto.
- Componentes chicos y con una sola responsabilidad.

## Carpetas (`src/`)
- `components/`: piezas reutilizables de interfaz; no llaman a la API directamente.
- `pages/`: pantallas completas que combinan componentes y muestran errores de la API.
- `hooks/`: hooks propios de estado y acciones (ej. `useOrders.js`).
- `services/`: todas las llamadas HTTP centralizadas en `src/services/api.js`.
- `utils/`: funciones puras de validación y formato.

## Llamadas al backend y contrato
- Todas las llamadas pasan por `src/services/api.js` usando `import.meta.env.VITE_API_URL` (nunca URLs hardcodeadas).
- Respetar estrictamente las rutas y el contrato `{ data }` / `{ error: { code, message } }` documentado en `docs/api.md`.
- Resolver y probar siempre los cuatro estados de pantalla: **cargando**, **vacío**, **error** (mostrando `error.message`) y **con datos**.

## Otros
- Variables de entorno: solo con prefijo `VITE_` (ver `.env.example`). Nunca secretos en el frontend.
- Validar los datos del formulario en frontend con las mismas reglas que el backend y mostrar los errores junto al formulario.
- Estilos en CSS plano, sin instalar librerías de UI ni de estado global sin consultar.
- Tests con Vitest + `@testing-library/react` + `jsdom`, buscando elementos por rol y texto (nunca por clases CSS) y simulando `src/services/api.js`.
- Comandos: `npm run dev` y `npm test`.