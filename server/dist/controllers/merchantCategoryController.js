"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * GET /api/merchant/categories - 获取所有分类（包含禁用的）
 * 按 sort_order ASC 排序
 */
exports.getCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const categories = await models_1.Category.findAll({
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
exports.createCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const category = await models_1.Category.create({
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
exports.updateCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, sort_order, status } = req.body;
    // 查找分类
    const category = await models_1.Category.findByPk(id);
    if (!category) {
        return res.status(404).json({
            code: 404,
            message: '分类不存在',
            data: null
        });
    }
    // 构建更新数据
    const updateData = {};
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
exports.deleteCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // 查找分类
    const category = await models_1.Category.findByPk(id);
    if (!category) {
        return res.status(404).json({
            code: 404,
            message: '分类不存在',
            data: null
        });
    }
    // 检查该分类下是否有产品
    const productCount = await models_1.Product.count({
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
exports.default = {
    getCategories: exports.getCategories,
    createCategory: exports.createCategory,
    updateCategory: exports.updateCategory,
    deleteCategory: exports.deleteCategory
};
//# sourceMappingURL=merchantCategoryController.js.map