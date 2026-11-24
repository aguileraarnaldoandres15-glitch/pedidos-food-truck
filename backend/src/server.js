// Debe ser el primer import para que las variables de .env estén disponibles en el resto de los módulos.
import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

app.listen(env.PORT, () => {
  console.log(`API escuchando en el puerto ${env.PORT}`);
});

// La conexión se intenta después de levantar el servidor: si falla,
// la API sigue respondiendo y GET /api/health informa db: "disconnected".
connectDB(env.MONGODB_URI);
