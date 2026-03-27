"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const merchantAuthController_1 = require("../controllers/merchantAuthController");
const router = (0, express_1.Router)();
// POST /api/merchant/login - 商家登录
router.post('/login', merchantAuthController_1.merchantLogin);
exports.default = router;
//# sourceMappingURL=merchantAuth.js.map