import { Router } from 'express';
import { createOrder, listPendingOrders } from '../controllers/order.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/pendientes', listPendingOrders);

export default router;
