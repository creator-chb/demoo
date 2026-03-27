import { Response } from 'express';
/**
 * GET /api/merchant/orders - 获取订单列表
 * 支持 query: status（可选, 'all'|'pending'|'processing'|'completed'|'cancelled'）
 * 关联查询产品信息
 * 按 created_at DESC 排序
 */
export declare const getOrders: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * PUT /api/merchant/orders/:id/accept - 接单
 * 业务逻辑: 将 status 从 'pending' 更新为 'processing'
 * 只有 'pending' 状态的订单可以接单
 */
export declare const acceptOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * PUT /api/merchant/orders/:id/complete - 完成订单（核心解锁）
 * 业务逻辑: 将 status 更新为 'completed'
 * 只有 'pending' 或 'processing' 状态的订单可以完成
 * 这是释放用户"限购锁"的关键操作
 */
export declare const completeOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * PUT /api/merchant/orders/:id/reset - 强制重置
 * 业务逻辑: 将 status 更新为 'cancelled'（无论当前状态）
 * 针对异常情况（用户误操作、离店等）
 */
export declare const resetOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
declare const _default: {
    getOrders: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    acceptOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    completeOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    resetOrder: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
};
export default _default;
//# sourceMappingURL=merchantOrderController.d.ts.map