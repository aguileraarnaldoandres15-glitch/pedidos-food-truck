import { Router } from 'express';
import { createOrder, listOrders, listPendingOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/pendientes', listPendingOrders);
router.patch('/:id/estado', updateOrderStatus);

export default router;
