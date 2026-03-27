import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    merchantId?: number;
    merchantName?: string;
}
export declare const JWT_SECRET: string;
export declare const JWT_EXPIRES_IN = "24h";
/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export default authMiddleware;
//# sourceMappingURL=auth.d.ts.map