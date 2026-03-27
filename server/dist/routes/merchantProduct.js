"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const merchantProductController_1 = require("../controllers/merchantProductController");
const router = (0, express_1.Router)();
// 所有商家产品接口需要认证
router.use(auth_1.authMiddleware);
// GET /api/merchant/products - 获取所有产品
router.get('/', merchantProductController_1.getProducts);
// POST /api/merchant/products - 新增产品
router.post('/', merchantProductController_1.createProduct);
// PUT /api/merchant/products/:id - 更新产品
router.put('/:id', merchantProductController_1.updateProduct);
// DELETE /api/merchant/products/:id - 删除产品
router.delete('/:id', merchantProductController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=merchantProduct.js.map