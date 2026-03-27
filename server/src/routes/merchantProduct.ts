import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/merchantProductController';

const router = Router();

// 所有商家产品接口需要认证
router.use(authMiddleware);

// GET /api/merchant/products - 获取所有产品
router.get('/', getProducts);

// POST /api/merchant/products - 新增产品
router.post('/', createProduct);

// PUT /api/merchant/products/:id - 更新产品
router.put('/:id', updateProduct);

// DELETE /api/merchant/products/:id - 删除产品
router.delete('/:id', deleteProduct);

export default router;
