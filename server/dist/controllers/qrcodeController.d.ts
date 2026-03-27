import { Request, Response, NextFunction } from 'express';
/**
 * 生成单个桌号小程序码
 * POST /api/qrcode/generate
 */
export declare const generateQrcode: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 批量生成小程序码
 * POST /api/qrcode/batch-generate
 */
export declare const batchGenerateQrcode: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 列出已生成的桌号码
 * GET /api/qrcode/list
 */
export declare const listQrcodes: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=qrcodeController.d.ts.map