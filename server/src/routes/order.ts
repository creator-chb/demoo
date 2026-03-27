import { Router } from 'express';
import { createOrder, getMyOrders, cancelOrder } from '../controllers/orderController';

const router = Router();

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.put('/:id/cancel', cancelOrder);

export default router;
