import { Router } from 'express';
import { generateQrcode, batchGenerateQrcode, listQrcodes } from '../controllers/qrcodeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/generate', authMiddleware, generateQrcode);
router.post('/batch-generate', authMiddleware, batchGenerateQrcode);
router.get('/list', authMiddleware, listQrcodes);

export default router;
