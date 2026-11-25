import { AppError } from '../utils/appError.js';

// Se monta después de todas las rutas: cualquier request sin match termina en 404 con el contrato de error.
export function notFoundMiddleware(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'La ruta solicitada no existe'));
}

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

  // JSON malformado detectado por `express.json()`: no se exponen el mensaje ni el body del parser.
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'El cuerpo de la solicitud no es un JSON válido' },
    });
  }

  // Error inesperado: se registra solo el tipo y no se exponen detalles al cliente.
  console.error(`Error inesperado: ${error?.name ?? 'Error'}`);

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor. Intentá de nuevo más tarde' },
  });
}
