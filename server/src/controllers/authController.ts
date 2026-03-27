import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

// POST /api/auth/login - 微信登录（测试阶段模拟）
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;

  // 验证 code 参数
  if (!code) {
    return res.json({
      code: 400,
      message: 'code 参数必须',
      data: null
    });
  }

  // 测试阶段逻辑：不实际调用微信接口，生成模拟 openid
  const timestamp = Date.now();
  const mockOpenid = `mock_${code}_${timestamp}`;

  res.json({
    code: 0,
    message: 'success',
    data: {
      openid: mockOpenid
    }
  });
});
