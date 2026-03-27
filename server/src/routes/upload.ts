import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uploadFile } from '../controllers/uploadController';

const router = Router();

// 上传接口需要认证
router.use(authMiddleware);

// POST /api/upload - 上传文件
// multer 中间件在 controller 中配置
router.post('/', uploadFile);

export default router;
