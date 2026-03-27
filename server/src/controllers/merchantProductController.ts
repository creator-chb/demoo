import { Response } from 'express';
import { Op } from 'sequelize';
import { Product, Category, Order } from '../models';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/merchant/products - 获取所有产品（包含下架的）
 * 支持 query: category_id
 * 关联查询分类信息
 * 按 sort_order ASC, created_at DESC 排序
 */
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category_id } = req.query;

  // 构建查询条件
  const whereClause: { category_id?: number } = {};
  
  if (category_id && !isNaN(Number(category_id))) {
    whereClause.category_id = Number(category_id);
  }

  const products = await Product.findAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'status']
      }
    ],
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'DESC']
    ]
  });

  return res.json({
    code: 0,
    message: 'success',
    data: products
  });
});

/**
 * POST /api/merchant/products - 新增产品
 * 请求体: { category_id, name, description?, image_url?, images?, sort_order?, status? }
 */
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category_id, name, description, image_url, images, sort_order, status } = req.body;

  // 验证必填字段
  if (!category_id) {
    return res.status(400).json({
      code: 400,
      message: '分类ID不能为空',
      data: null
    });
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      code: 400,
      message: '产品名称不能为空',
      data: null
    });
  }

  // 检查分类是否存在
  const category = await Category.findByPk(category_id);
  if (!category) {
    return res.status(400).json({
      code: 400,
      message: '分类不存在',
      data: null
    });
  }

  // 创建产品
  const product = await Product.create({
    category_id,
    name: name.trim(),
    description: description || null,
    image_url: image_url || null,
    images: images || null,
    sort_order: sort_order ?? 0,
    status: status ?? 1
  });

  // 重新查询以获取关联的分类信息
  const productWithCategory = await Product.findByPk(product.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'status']
      }
    ]
  });

  return res.json({
    code: 0,
    message: '创建成功',
    data: productWithCategory
  });
});

/**
 * PUT /api/merchant/products/:id - 更新产品
 * 请求体: { category_id?, name?, description?, image_url?, images?, sort_order?, status? }
 */
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { category_id, name, description, image_url, images, sort_order, status } = req.body;

  // 查找产品
  const product = await Product.findByPk(id);

  if (!product) {
    return res.status(404).json({
      code: 404,
      message: '产品不存在',
      data: null
    });
  }

  // 构建更新数据
  const updateData: Partial<{
    category_id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    images: string[] | null;
    sort_order: number;
    status: number;
  }> = {};

  if (category_id !== undefined) {
    // 检查新分类是否存在
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        code: 400,
        message: '分类不存在',
        data: null
      });
    }
    updateData.category_id = category_id;
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '产品名称不能为空',
        data: null
      });
    }
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description || null;
  }

  if (image_url !== undefined) {
    updateData.image_url = image_url || null;
  }

  if (images !== undefined) {
    updateData.images = images || null;
  }

  if (sort_order !== undefined) {
    updateData.sort_order = sort_order;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  // 更新产品
  await product.update(updateData);

  // 重新查询以获取关联的分类信息
  const productWithCategory = await Product.findByPk(product.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'status']
      }
    ]
  });

  return res.json({
    code: 0,
    message: '更新成功',
    data: productWithCategory
  });
});

/**
 * DELETE /api/merchant/products/:id - 删除产品
 * 业务逻辑: 检查是否有关联的未完成订单（pending/processing），如果有则不允许删除
 */
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // 查找产品
  const product = await Product.findByPk(id);

  if (!product) {
    return res.status(404).json({
      code: 404,
      message: '产品不存在',
      data: null
    });
  }

  // 检查是否有关联的未完成订单（pending/processing）
  const pendingOrderCount = await Order.count({
    where: {
      product_id: id,
      status: {
        [Op.in]: ['pending', 'processing']
      }
    }
  });

  if (pendingOrderCount > 0) {
    return res.status(400).json({
      code: 400,
      message: `该产品有 ${pendingOrderCount} 个未完成的订单，请先处理完订单后再删除产品`,
      data: null
    });
  }

  // 删除产品
  await product.destroy();

  return res.json({
    code: 0,
    message: '删除成功',
    data: null
  });
});

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
