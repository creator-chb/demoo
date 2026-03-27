"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrcodeController_1 = require("../controllers/qrcodeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.authMiddleware, qrcodeController_1.generateQrcode);
router.post('/batch-generate', auth_1.authMiddleware, qrcodeController_1.batchGenerateQrcode);
router.get('/list', auth_1.authMiddleware, qrcodeController_1.listQrcodes);
exports.default = router;
//# sourceMappingURL=qrcode.js.map