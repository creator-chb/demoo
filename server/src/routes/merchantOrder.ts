import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getOrders,
  acceptOrder,
  completeOrder,
  resetOrder
} from '../controllers/merchantOrderController';

const router = Router();

// 所有商家订单接口需要认证
router.use(authMiddleware);

// GET /api/merchant/orders - 获取订单列表
router.get('/', getOrders);

// PUT /api/merchant/orders/:id/accept - 接单
router.put('/:id/accept', acceptOrder);

// PUT /api/merchant/orders/:id/complete - 完成订单
router.put('/:id/complete', completeOrder);

// PUT /api/merchant/orders/:id/reset - 强制重置订单
router.put('/:id/reset', resetOrder);

export default router;
