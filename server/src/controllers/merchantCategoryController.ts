import { Response } from 'express';
import { Category, Product } from '../models';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/merchant/categories - 获取所有分类（包含禁用的）
 * 按 sort_order ASC 排序
 */
export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await Category.findAll({
    order: [['sort_order', 'ASC']]
  });

  return res.json({
    code: 0,
    message: 'success',
    data: categories
  });
});

/**
 * POST /api/merchant/categories - 新增分类
 * 请求体: { name, sort_order?, status? }
 */
export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, sort_order, status } = req.body;

  // 验证必填字段
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      code: 400,
      message: '分类名称不能为空',
      data: null
    });
  }

  // 创建分类
  const category = await Category.create({
    name: name.trim(),
    sort_order: sort_order ?? 0,
    status: status ?? 1
  });

  return res.json({
    code: 0,
    message: '创建成功',
    data: category
  });
});

/**
 * PUT /api/merchant/categories/:id - 更新分类
 * 请求体: { name?, sort_order?, status? }
 */
export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, sort_order, status } = req.body;

  // 查找分类
  const category = await Category.findByPk(id);

  if (!category) {
    return res.status(404).json({
      code: 404,
      message: '分类不存在',
      data: null
    });
  }

  // 构建更新数据
  const updateData: Partial<{ name: string; sort_order: number; status: number }> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '分类名称不能为空',
        data: null
      });
    }
    updateData.name = name.trim();
  }

  if (sort_order !== undefined) {
    updateData.sort_order = sort_order;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  // 更新分类
  await category.update(updateData);

  return res.json({
    code: 0,
    message: '更新成功',
    data: category
  });
});

/**
 * DELETE /api/merchant/categories/:id - 删除分类
 * 业务逻辑: 检查该分类下是否有产品，如果有则不允许删除
 */
export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // 查找分类
  const category = await Category.findByPk(id);

  if (!category) {
    return res.status(404).json({
      code: 404,
      message: '分类不存在',
      data: null
    });
  }

  // 检查该分类下是否有产品
  const productCount = await Product.count({
    where: { category_id: id }
  });

  if (productCount > 0) {
    return res.status(400).json({
      code: 400,
      message: `该分类下有 ${productCount} 个产品，请先删除或转移产品后再删除分类`,
      data: null
    });
  }

  // 删除分类
  await category.destroy();

  return res.json({
    code: 0,
    message: '删除成功',
    data: null
  });
});

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
