import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Merchant } from '../models';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * POST /api/merchant/login - 商家登录
 * 请求体: { username, password }
 */
export const merchantLogin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // 调试日志
  console.log('[商家登录] 尝试登录:', { username, passwordLength: password?.length });

  // 1. 验证参数
  if (!username || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空',
      data: null
    });
  }

  // 2. 查询 Merchant 表中 username 匹配的记录
  const merchant = await Merchant.findOne({
    where: { username }
  });

  if (!merchant) {
    console.log('[商家登录] 用户不存在:', username);
    return res.status(401).json({
      code: 401,
      message: '用户名或密码错误',
      data: null
    });
  }

  // 调试日志：输出数据库中的密码哈希
  console.log('[商家登录] 找到用户:', { id: merchant.id, username: merchant.username, passwordHash: merchant.password });

  // 3. 使用 bcryptjs 比对密码
  const isPasswordValid = await bcrypt.compare(password, merchant.password);
  
  // 调试日志：输出比对结果
  console.log('[商家登录] 密码比对结果:', isPasswordValid);

  if (!isPasswordValid) {
    return res.status(401).json({
      code: 401,
      message: '用户名或密码错误',
      data: null
    });
  }

  // 4. 生成 JWT token (有效期 24h)，payload: { id, username, name }
  const token = jwt.sign(
    {
      id: merchant.id,
      username: merchant.username,
      name: merchant.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // 5. 返回成功响应
  return res.json({
    code: 0,
    message: '登录成功',
    data: {
      token,
      merchant: {
        id: merchant.id,
        username: merchant.username,
        name: merchant.name
      }
    }
  });
});

export default {
  merchantLogin
};
