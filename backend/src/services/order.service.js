import mongoose from 'mongoose';
import { Order } from '../models/order.model.js';
import { validateOrder } from '../utils/orderValidation.js';
import { calculateTotal } from '../utils/orderTotal.js';
import { ORDER_STATUSES, FINAL_STATUS, validateTransition } from '../utils/orderStatus.js';
import { AppError } from '../utils/appError.js';

export async function createOrder(input) {
  const { isValid, errors, data } = validateOrder(input);

  if (!isValid) {
    throw new AppError(400, 'VALIDATION_ERROR', Object.values(errors).join('. '));
  }

  // El total, el estado y la fecha los define siempre el backend.
  const order = await Order.create({
    ...data,
    total: calculateTotal(data.items),
    estado: ORDER_STATUSES[0],
    fecha: new Date(),
  });

  return order.toJSON();
}

// Pendientes = todo pedido no entregado, del más antiguo al más nuevo.
// El `_id` desempata pedidos con la misma fecha para que el orden sea estable.
export async function listPendingOrders() {
  return Order.find({ estado: { $ne: FINAL_STATUS } })
    .sort({ fecha: 1, _id: 1 })
    .lean();
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Avanza el estado de un pedido al inmediatamente siguiente.
// Del body solo se usa `estado`: cualquier otro campo enviado se ignora.
export async function updateOrderStatus(id, input) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new AppError(400, 'INVALID_ID', 'El id del pedido no tiene un formato válido');
  }

  const estado = isPlainObject(input) && typeof input.estado === 'string' ? input.estado.trim() : '';

  if (estado === '') {
    throw new AppError(400, 'VALIDATION_ERROR', 'El estado es obligatorio y debe ser un texto');
  }

  const order = await Order.findById(id).lean();

  if (!order) {
    throw new AppError(404, 'NOT_FOUND', 'El pedido no existe');
  }

  const transition = validateTransition(order.estado, estado);

  if (!transition.ok) {
    throw new AppError(400, 'INVALID_TRANSITION', transition.reason);
  }

  // El filtro por el estado actual evita que dos requests simultáneos avancen el pedido dos veces.
  const updated = await Order.findOneAndUpdate(
    { _id: id, estado: order.estado },
    { $set: { estado } },
    { returnDocument: 'after', runValidators: true },
  ).lean();

  if (!updated) {
    throw new AppError(400, 'INVALID_TRANSITION', 'El estado del pedido cambió mientras se actualizaba. Intentá de nuevo');
  }

  return updated;
}
