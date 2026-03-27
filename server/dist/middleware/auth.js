"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_EXPIRES_IN = exports.JWT_SECRET = void 0;
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT 密钥从环境变量读取，默认 'your_jwt_secret_key'
exports.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
// JWT Token 有效期（24小时）
exports.JWT_EXPIRES_IN = '24h';
/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
function authMiddleware(req, res, next) {
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
        const decoded = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.merchantId = decoded.id;
        req.merchantName = decoded.name || decoded.username;
        next();
    }
    catch (err) {
        return res.status(401).json({
            code: 401,
            message: 'token无效或已过期',
            data: null
        });
    }
}
exports.default = authMiddleware;
//# sourceMappingURL=auth.js.map