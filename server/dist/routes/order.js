"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
router.post('/', orderController_1.createOrder);
router.get('/my', orderController_1.getMyOrders);
router.put('/:id/cancel', orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=order.js.map