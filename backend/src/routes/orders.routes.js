import { Router } from 'express';
import { createOrder, listPendingOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/pendientes', listPendingOrders);
router.patch('/:id/estado', updateOrderStatus);

export default router;
