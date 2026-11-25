import { Order } from '../models/order.model.js';
import { validateOrder } from '../utils/orderValidation.js';
import { calculateTotal } from '../utils/orderTotal.js';
import { ORDER_STATUSES, FINAL_STATUS } from '../utils/orderStatus.js';
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
