import { Request, Response, NextFunction } from 'express';

// 自定义错误类
export class AppError extends Error {
  public code: number;
  public isOperational: boolean;

  constructor(code: number, message: string, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;

    // 确保堆栈跟踪正确
    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误响应接口
interface ErrorResponse {
  code: number;
  message: string;
  data: null;
}

// 全局错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 默认错误信息
  let code = 500;
  let message = '服务器内部错误';

  // 处理自定义业务错误
  if (err instanceof AppError) {
    code = err.code;
    message = err.message;

    // 记录业务错误日志
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[业务错误] ${code}: ${message}`);
    }
  } else {
    // 处理系统错误
    console.error('[系统错误]', err);

    // 在生产环境隐藏详细错误信息
    if (process.env.NODE_ENV === 'development') {
      message = err.message || message;
    }
  }

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    code = 400;
    message = '数据验证失败';
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    code = 400;
    message = '数据已存在，请勿重复提交';
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    code = 401;
    message = '无效的认证令牌';
  }

  if (err.name === 'TokenExpiredError') {
    code = 401;
    message = '认证令牌已过期';
  }

  // 统一响应格式
  const errorResponse: ErrorResponse = {
    code,
    message,
    data: null,
  };

  res.status(code >= 100 && code < 600 ? code : 500).json(errorResponse);
};

// 异步错误捕获包装器
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
