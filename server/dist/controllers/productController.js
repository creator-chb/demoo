"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.getProducts = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
// GET /api/products - 获取产品列表
exports.getProducts = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { category_id } = req.query;
    // 构建查询条件
    const where = { status: 1 };
    if (category_id) {
        where.category_id = Number(category_id);
    }
    const products = await models_1.Product.findAll({
        where,
        order: [['sort_order', 'ASC']],
        include: [
            {
                model: models_1.Category,
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
exports.getProductById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const product = await models_1.Product.findByPk(id, {
        include: [
            {
                model: models_1.Category,
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
//# sourceMappingURL=productController.js.map