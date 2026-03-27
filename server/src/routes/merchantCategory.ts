import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/merchantCategoryController';

const router = Router();

// 所有商家分类接口需要认证
router.use(authMiddleware);

// GET /api/merchant/categories - 获取所有分类
router.get('/', getCategories);

// POST /api/merchant/categories - 新增分类
router.post('/', createCategory);

// PUT /api/merchant/categories/:id - 更新分类
router.put('/:id', updateCategory);

// DELETE /api/merchant/categories/:id - 删除分类
router.delete('/:id', deleteCategory);

export default router;
