import * as orderService from '../services/order.service.js';

// Express 5 reenvía al middleware de errores los rechazos de handlers async.
export async function createOrder(req, res) {
  const order = await orderService.createOrder(req.body);
  res.status(201).json({ data: order });
}
