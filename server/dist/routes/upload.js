"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
// 上传接口需要认证
router.use(auth_1.authMiddleware);
// POST /api/upload - 上传文件
// multer 中间件在 controller 中配置
router.post('/', uploadController_1.uploadFile);
exports.default = router;
//# sourceMappingURL=upload.js.map