import mongoose from 'mongoose';

// Evita que un error de conexión posterior al arranque cierre el proceso.
mongoose.connection.on('error', (error) => {
  console.error(`Error en la conexión con MongoDB: ${error.name}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado');
});

/**
 * Intenta conectar a MongoDB sin cerrar el proceso si falla.
 * @param {string | undefined} uri
 * @returns {Promise<boolean>} true si la conexión se estableció.
 */
export async function connectDB(uri) {
  if (!uri) {
    console.warn('MONGODB_URI no está definida: la API arranca sin base de datos');
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Conectado a MongoDB');
    return true;
  } catch (error) {
    // Se registra solo el tipo de error para no exponer la cadena de conexión.
    console.error(`No se pudo conectar a MongoDB: ${error.name}`);
    return false;
  }
}
