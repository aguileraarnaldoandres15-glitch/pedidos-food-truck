import { AppError } from '../utils/appError.js';

// Express identifica el middleware de errores por sus 4 parámetros.
export function errorMiddleware(error, req, res, next) {
  // Si la respuesta ya empezó a enviarse, se delega en el manejador por defecto de Express.
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
  }

  // Error inesperado: se registra solo el tipo y no se exponen detalles al cliente.
  console.error(`Error inesperado: ${error?.name ?? 'Error'}`);

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}
