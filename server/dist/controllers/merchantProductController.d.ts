import { Response } from 'express';
/**
 * GET /api/merchant/products - 获取所有产品（包含下架的）
 * 支持 query: category_id
 * 关联查询分类信息
 * 按 sort_order ASC, created_at DESC 排序
 */
export declare const getProducts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * POST /api/merchant/products - 新增产品
 * 请求体: { category_id, name, description?, image_url?, images?, sort_order?, status? }
 */
export declare const createProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * PUT /api/merchant/products/:id - 更新产品
 * 请求体: { category_id?, name?, description?, image_url?, images?, sort_order?, status? }
 */
export declare const updateProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * DELETE /api/merchant/products/:id - 删除产品
 * 业务逻辑: 检查是否有关联的未完成订单（pending/processing），如果有则不允许删除
 */
export declare const deleteProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
declare const _default: {
    getProducts: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteProduct: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
};
export default _default;
//# sourceMappingURL=merchantProductController.d.ts.map