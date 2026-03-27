"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * POST /api/merchant/login - 商家登录
 * 请求体: { username, password }
 */
exports.merchantLogin = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const merchant = await models_1.Merchant.findOne({
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
    const isPasswordValid = await bcryptjs_1.default.compare(password, merchant.password);
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
    const token = jsonwebtoken_1.default.sign({
        id: merchant.id,
        username: merchant.username,
        name: merchant.name
    }, auth_1.JWT_SECRET, { expiresIn: auth_1.JWT_EXPIRES_IN });
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
exports.default = {
    merchantLogin: exports.merchantLogin
};
//# sourceMappingURL=merchantAuthController.js.map