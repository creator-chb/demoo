import { Request, Response, NextFunction } from 'express';
import { Config } from '../models';
import { asyncHandler } from '../middleware/errorHandler';

// GET /api/config/:key - 获取系统配置
export const getConfig = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { key } = req.params;

  const config = await Config.findOne({
    where: { config_key: key }
  });

  if (!config) {
    return res.json({
      code: 404,
      message: '配置不存在',
      data: null
    });
  }

  res.json({
    code: 0,
    message: 'success',
    data: {
      key: config.config_key,
      value: config.config_value
    }
  });
});
