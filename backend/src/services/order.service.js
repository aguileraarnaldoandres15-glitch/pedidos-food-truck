import { Order } from '../models/order.model.js';
import { validateOrder } from '../utils/orderValidation.js';
import { calculateTotal } from '../utils/orderTotal.js';
import { ORDER_STATUSES } from '../utils/orderStatus.js';
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
