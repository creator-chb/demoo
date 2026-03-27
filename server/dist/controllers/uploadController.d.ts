import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * POST /api/upload - 上传文件
 * 使用 multer 中间件处理文件上传
 * 文件保存到 server/src/uploads/ 目录
 * 文件名: 时间戳 + 随机数 + 原始扩展名
 */
export declare const uploadFile: (req: AuthRequest, res: Response) => void;
declare const _default: {
    uploadFile: (req: AuthRequest, res: Response) => void;
    uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export default _default;
//# sourceMappingURL=uploadController.d.ts.map