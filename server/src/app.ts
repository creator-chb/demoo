import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { sequelize, syncDatabase } from './config/database';
import { errorHandler, AppError } from './middleware/errorHandler';
import { initWebSocket } from './websocket';

// 用户端路由导入
import configRoutes from './routes/config';
import categoryRoutes from './routes/category';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import authRoutes from './routes/auth';

// 商家端路由导入
import merchantRoutes, { uploadRoutes } from './routes/merchant';

// 小程序码路由导入
import qrcodeRoutes from './routes/qrcode';

// 加载环境变量
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ==================== 中间件配置 ====================

// CORS 配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 设置响应头字符集 - 解决中文乱码问题
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// JSON 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - uploads 目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== 路由挂载点 ====================

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ code: 0, message: 'OK', data: { status: 'healthy', timestamp: new Date().toISOString() } });
});

// API 路由 - 用户端
app.use('/api/config', configRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// API 路由 - 商家端
app.use('/api/merchant', merchantRoutes);
app.use('/api/upload', uploadRoutes);

// API 路由 - 小程序码
app.use('/api/qrcode', qrcodeRoutes);

// 404 处理
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, '请求的资源不存在'));
});

// ==================== 全局错误处理 ====================
app.use(errorHandler);

// ==================== 启动服务器 ====================
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 强制设置数据库连接字符集 - 解决中文乱码问题
    await sequelize.query("SET NAMES 'utf8mb4'");
    await sequelize.query("SET CHARACTER SET utf8mb4");
    await sequelize.query("SET character_set_connection = utf8mb4");
    console.log('✅ 数据库字符集已设置为 utf8mb4');

    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase();
      console.log('✅ 数据库模型同步完成');
    }

    // 创建 HTTP 服务器并集成 WebSocket
    const server = http.createServer(app);
    initWebSocket(server);

    // 启动服务器
    server.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📁 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket 服务已启动`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;
