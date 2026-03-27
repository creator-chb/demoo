"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
// GET /api/categories - 获取所有启用的分类列表
exports.getCategories = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const categories = await models_1.Category.findAll({
        where: { status: 1 },
        order: [['sort_order', 'ASC']]
    });
    res.json({
        code: 0,
        message: 'success',
        data: categories
    });
});
//# sourceMappingURL=categoryController.js.map