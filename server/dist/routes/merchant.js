"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
/**
 * 商家端路由总入口
 * 汇总所有商家端路由
 */
const express_1 = require("express");
const merchantAuth_1 = __importDefault(require("./merchantAuth"));
const merchantCategory_1 = __importDefault(require("./merchantCategory"));
const merchantProduct_1 = __importDefault(require("./merchantProduct"));
const merchantOrder_1 = __importDefault(require("./merchantOrder"));
const upload_1 = __importDefault(require("./upload"));
exports.uploadRoutes = upload_1.default;
const router = (0, express_1.Router)();
// 商家登录路由（不需要认证）
// /api/merchant/login
router.use('/', merchantAuth_1.default);
// 分类管理路由（需要认证）
// /api/merchant/categories/*
router.use('/categories', merchantCategory_1.default);
// 产品管理路由（需要认证）
// /api/merchant/products/*
router.use('/products', merchantProduct_1.default);
// 订单管理路由（需要认证）
// /api/merchant/orders/*
router.use('/orders', merchantOrder_1.default);
// 默认导出商家端主路由
exports.default = router;
//# sourceMappingURL=merchant.js.map