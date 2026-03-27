import { Response } from 'express';
/**
 * GET /api/merchant/categories - 获取所有分类（包含禁用的）
 * 按 sort_order ASC 排序
 */
export declare const getCategories: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * POST /api/merchant/categories - 新增分类
 * 请求体: { name, sort_order?, status? }
 */
export declare const createCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * PUT /api/merchant/categories/:id - 更新分类
 * 请求体: { name?, sort_order?, status? }
 */
export declare const updateCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
/**
 * DELETE /api/merchant/categories/:id - 删除分类
 * 业务逻辑: 检查该分类下是否有产品，如果有则不允许删除
 */
export declare const deleteCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
declare const _default: {
    getCategories: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    deleteCategory: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
};
export default _default;
//# sourceMappingURL=merchantCategoryController.d.ts.map