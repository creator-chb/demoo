"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const websocket_1 = require("./websocket");
// 用户端路由导入
const config_1 = __importDefault(require("./routes/config"));
const category_1 = __importDefault(require("./routes/category"));
const product_1 = __importDefault(require("./routes/product"));
const order_1 = __importDefault(require("./routes/order"));
const auth_1 = __importDefault(require("./routes/auth"));
// 商家端路由导入
const merchant_1 = __importStar(require("./routes/merchant"));
// 小程序码路由导入
const qrcode_1 = __importDefault(require("./routes/qrcode"));
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ==================== 中间件配置 ====================
// CORS 配置
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// 设置响应头字符集 - 解决中文乱码问题
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
// JSON 解析
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 静态文件服务 - uploads 目录
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// ==================== 路由挂载点 ====================
// 健康检查
app.get('/health', (req, res) => {
    res.json({ code: 0, message: 'OK', data: { status: 'healthy', timestamp: new Date().toISOString() } });
});
// API 路由 - 用户端
app.use('/api/config', config_1.default);
app.use('/api/categories', category_1.default);
app.use('/api/products', product_1.default);
app.use('/api/orders', order_1.default);
app.use('/api/auth', auth_1.default);
// API 路由 - 商家端
app.use('/api/merchant', merchant_1.default);
app.use('/api/upload', merchant_1.uploadRoutes);
// API 路由 - 小程序码
app.use('/api/qrcode', qrcode_1.default);
// 404 处理
app.use((req, res, next) => {
    next(new errorHandler_1.AppError(404, '请求的资源不存在'));
});
// ==================== 全局错误处理 ====================
app.use(errorHandler_1.errorHandler);
// ==================== 启动服务器 ====================
const startServer = async () => {
    try {
        // 测试数据库连接
        await database_1.sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        // 强制设置数据库连接字符集 - 解决中文乱码问题
        await database_1.sequelize.query("SET NAMES 'utf8mb4'");
        await database_1.sequelize.query("SET CHARACTER SET utf8mb4");
        await database_1.sequelize.query("SET character_set_connection = utf8mb4");
        console.log('✅ 数据库字符集已设置为 utf8mb4');
        // 同步数据库模型（开发环境）
        if (process.env.NODE_ENV === 'development') {
            await (0, database_1.syncDatabase)();
            console.log('✅ 数据库模型同步完成');
        }
        // 创建 HTTP 服务器并集成 WebSocket
        const server = http_1.default.createServer(app);
        (0, websocket_1.initWebSocket)(server);
        // 启动服务器
        server.listen(PORT, () => {
            console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
            console.log(`📁 环境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔌 WebSocket 服务已启动`);
        });
    }
    catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map