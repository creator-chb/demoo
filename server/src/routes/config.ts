import { Router } from 'express';
import { getConfig } from '../controllers/configController';

const router = Router();

router.get('/:key', getConfig);

export default router;
