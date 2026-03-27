"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const merchantCategoryController_1 = require("../controllers/merchantCategoryController");
const router = (0, express_1.Router)();
// 所有商家分类接口需要认证
router.use(auth_1.authMiddleware);
// GET /api/merchant/categories - 获取所有分类
router.get('/', merchantCategoryController_1.getCategories);
// POST /api/merchant/categories - 新增分类
router.post('/', merchantCategoryController_1.createCategory);
// PUT /api/merchant/categories/:id - 更新分类
router.put('/:id', merchantCategoryController_1.updateCategory);
// DELETE /api/merchant/categories/:id - 删除分类
router.delete('/:id', merchantCategoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=merchantCategory.js.map