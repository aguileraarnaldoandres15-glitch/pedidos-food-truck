import { Router } from 'express';
import healthRoutes from './health.routes.js';
import ordersRoutes from './orders.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/pedidos', ordersRoutes);

export default router;
