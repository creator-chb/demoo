/**
 * 商家端路由总入口
 * 汇总所有商家端路由
 */
import { Router } from 'express';
import merchantAuthRoutes from './merchantAuth';
import merchantCategoryRoutes from './merchantCategory';
import merchantProductRoutes from './merchantProduct';
import merchantOrderRoutes from './merchantOrder';
import uploadRoutes from './upload';

const router = Router();

// 商家登录路由（不需要认证）
// /api/merchant/login
router.use('/', merchantAuthRoutes);

// 分类管理路由（需要认证）
// /api/merchant/categories/*
router.use('/categories', merchantCategoryRoutes);

// 产品管理路由（需要认证）
// /api/merchant/products/*
router.use('/products', merchantProductRoutes);

// 订单管理路由（需要认证）
// /api/merchant/orders/*
router.use('/orders', merchantOrderRoutes);

// 导出上传路由（独立挂载到 /api/upload）
export { uploadRoutes };

// 默认导出商家端主路由
export default router;
