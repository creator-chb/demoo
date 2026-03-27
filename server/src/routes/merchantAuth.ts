import { Router } from 'express';
import { merchantLogin } from '../controllers/merchantAuthController';

const router = Router();

// POST /api/merchant/login - 商家登录
router.post('/login', merchantLogin);

export default router;
