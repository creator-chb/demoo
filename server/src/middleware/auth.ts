import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 扩展 Request 类型
export interface AuthRequest extends Request {
  merchantId?: number;
  merchantName?: string;
}

// JWT 密钥从环境变量读取，默认 'your_jwt_secret_key'
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// JWT Token 有效期（24小时）
export const JWT_EXPIRES_IN = '24h';

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未登录或token已过期',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      name: string | null;
    };
    
    req.merchantId = decoded.id;
    req.merchantName = decoded.name || decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 401,
      message: 'token无效或已过期',
      data: null
    });
  }
}

export default authMiddleware;
