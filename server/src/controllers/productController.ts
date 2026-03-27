import { Request, Response, NextFunction } from 'express';
import { Product, Category } from '../models';
import { asyncHandler } from '../middleware/errorHandler';
import { WhereOptions } from 'sequelize';
import { ProductAttributes } from '../models/Product';

// GET /api/products - 获取产品列表
export const getProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { category_id } = req.query;

  // 构建查询条件
  const where: WhereOptions<ProductAttributes> = { status: 1 };
  
  if (category_id) {
    where.category_id = Number(category_id);
  }

  const products = await Product.findAll({
    where,
    order: [['sort_order', 'ASC']],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    ]
  });

  res.json({
    code: 0,
    message: 'success',
    data: products
  });
});

// GET /api/products/:id - 获取产品详情
export const getProductById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await Product.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!product) {
    return res.json({
      code: 404,
      message: '产品不存在',
      data: null
    });
  }

  res.json({
    code: 0,
    message: 'success',
    data: product
  });
});
