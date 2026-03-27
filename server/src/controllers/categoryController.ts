import { Request, Response, NextFunction } from 'express';
import { Category } from '../models';
import { asyncHandler } from '../middleware/errorHandler';

// GET /api/categories - 获取所有启用的分类列表
export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await Category.findAll({
    where: { status: 1 },
    order: [['sort_order', 'ASC']]
  });

  res.json({
    code: 0,
    message: 'success',
    data: categories
  });
});
