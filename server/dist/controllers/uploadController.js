"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.uploadMiddleware = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
// 配置文件存储
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // 文件保存到 server/src/uploads/ 目录
        cb(null, path_1.default.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        // 文件名: 时间戳 + 随机数 + 原始扩展名
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${timestamp}_${randomNum}${ext}`);
    }
});
// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('只允许上传图片文件 (jpg, jpeg, png, gif, webp)'));
    }
};
// 配置 multer
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 限制 10MB
    }
});
// 单文件上传中间件
exports.uploadMiddleware = upload.single('file');
/**
 * POST /api/upload - 上传文件
 * 使用 multer 中间件处理文件上传
 * 文件保存到 server/src/uploads/ 目录
 * 文件名: 时间戳 + 随机数 + 原始扩展名
 */
const uploadFile = (req, res) => {
    // 使用 multer 中间件处理上传
    (0, exports.uploadMiddleware)(req, res, (err) => {
        if (err) {
            // 处理 Multer 错误
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        code: 400,
                        message: '文件大小不能超过 10MB',
                        data: null
                    });
                }
                return res.status(400).json({
                    code: 400,
                    message: `上传失败: ${err.message}`,
                    data: null
                });
            }
            // 处理其他错误
            return res.status(400).json({
                code: 400,
                message: err.message || '文件上传失败',
                data: null
            });
        }
        // 检查是否有文件
        if (!req.file) {
            return res.status(400).json({
                code: 400,
                message: '请选择要上传的文件',
                data: null
            });
        }
        // 返回文件访问路径
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({
            code: 0,
            message: '上传成功',
            data: {
                url: fileUrl,
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    });
};
exports.uploadFile = uploadFile;
exports.default = {
    uploadFile: exports.uploadFile,
    uploadMiddleware: exports.uploadMiddleware
};
//# sourceMappingURL=uploadController.js.map