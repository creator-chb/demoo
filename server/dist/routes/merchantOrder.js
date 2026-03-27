"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const merchantOrderController_1 = require("../controllers/merchantOrderController");
const router = (0, express_1.Router)();
// 所有商家订单接口需要认证
router.use(auth_1.authMiddleware);
// GET /api/merchant/orders - 获取订单列表
router.get('/', merchantOrderController_1.getOrders);
// PUT /api/merchant/orders/:id/accept - 接单
router.put('/:id/accept', merchantOrderController_1.acceptOrder);
// PUT /api/merchant/orders/:id/complete - 完成订单
router.put('/:id/complete', merchantOrderController_1.completeOrder);
// PUT /api/merchant/orders/:id/reset - 强制重置订单
router.put('/:id/reset', merchantOrderController_1.resetOrder);
exports.default = router;
//# sourceMappingURL=merchantOrder.js.map