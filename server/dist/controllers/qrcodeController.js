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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQrcodes = exports.batchGenerateQrcode = exports.generateQrcode = void 0;
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const errorHandler_1 = require("../middleware/errorHandler");
// 微信配置
const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_APPSECRET = process.env.WECHAT_APPSECRET || '';
let tokenCache = null;
// 确保 qrcodes 目录存在
const qrcodesDir = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrcodesDir)) {
    fs.mkdirSync(qrcodesDir, { recursive: true });
}
/**
 * 发送 HTTPS GET 请求
 */
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch (error) {
                    reject(new Error(`JSON 解析失败: ${data}`));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}
/**
 * 发送 HTTPS POST 请求（返回 Buffer）
 */
function httpsPostBuffer(url, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const postData = JSON.stringify(body);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };
        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                // 检查是否为错误响应（JSON 格式）
                const contentType = res.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    try {
                        const errorData = JSON.parse(buffer.toString());
                        if (errorData.errcode && errorData.errcode !== 0) {
                            reject(new Error(`微信接口错误: ${errorData.errmsg} (errcode: ${errorData.errcode})`));
                            return;
                        }
                    }
                    catch {
                        // 忽略解析错误，继续返回 buffer
                    }
                }
                resolve(buffer);
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.write(postData);
        req.end();
    });
}
/**
 * 获取微信 access_token（带缓存）
 */
async function getAccessToken() {
    // 检查缓存是否有效（提前5分钟过期）
    if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
        return tokenCache.token;
    }
    // 获取新的 access_token
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;
    const response = await httpsGet(url);
    if (response.errcode && response.errcode !== 0) {
        throw new Error(`获取 access_token 失败: ${response.errmsg} (errcode: ${response.errcode})`);
    }
    if (!response.access_token) {
        throw new Error('获取 access_token 失败: 返回数据无效');
    }
    // 缓存 token
    tokenCache = {
        token: response.access_token,
        expiresAt: Date.now() + response.expires_in * 1000,
    };
    return response.access_token;
}
/**
 * 生成单个桌号小程序码
 * POST /api/qrcode/generate
 */
exports.generateQrcode = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { table_id } = req.body;
    // 验证参数
    if (!table_id) {
        return res.json({
            code: 400,
            message: '参数不完整，需要 table_id',
            data: null,
        });
    }
    try {
        // 获取 access_token
        const accessToken = await getAccessToken();
        // 调用微信接口生成小程序码
        const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
        const body = {
            scene: `table_id=${table_id}`,
            page: 'pages/index/index',
            width: 430,
            auto_color: false,
            line_color: { r: 0, g: 0, b: 0 },
        };
        const buffer = await httpsPostBuffer(url, body);
        // 保存文件
        const filename = `table_${table_id}.png`;
        const filepath = path.join(qrcodesDir, filename);
        fs.writeFileSync(filepath, buffer);
        res.json({
            code: 0,
            data: {
                table_id,
                qrcode_url: `/uploads/qrcodes/${filename}`,
            },
        });
    }
    catch (error) {
        console.error('生成小程序码失败:', error);
        res.json({
            code: 500,
            message: error instanceof Error ? error.message : '生成小程序码失败',
            data: null,
        });
    }
});
/**
 * 批量生成小程序码
 * POST /api/qrcode/batch-generate
 */
exports.batchGenerateQrcode = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { start, end } = req.body;
    // 验证参数
    if (typeof start !== 'number' || typeof end !== 'number') {
        return res.json({
            code: 400,
            message: '参数不完整，需要 start 和 end（数字）',
            data: null,
        });
    }
    if (start > end) {
        return res.json({
            code: 400,
            message: 'start 不能大于 end',
            data: null,
        });
    }
    if (end - start > 100) {
        return res.json({
            code: 400,
            message: '一次最多生成 100 个小程序码',
            data: null,
        });
    }
    const results = [];
    try {
        // 获取一次 access_token，批量使用
        const accessToken = await getAccessToken();
        const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
        for (let i = start; i <= end; i++) {
            const table_id = i.toString();
            try {
                const body = {
                    scene: `table_id=${table_id}`,
                    page: 'pages/index/index',
                    width: 430,
                    auto_color: false,
                    line_color: { r: 0, g: 0, b: 0 },
                };
                const buffer = await httpsPostBuffer(url, body);
                // 保存文件
                const filename = `table_${table_id}.png`;
                const filepath = path.join(qrcodesDir, filename);
                fs.writeFileSync(filepath, buffer);
                results.push({
                    table_id,
                    qrcode_url: `/uploads/qrcodes/${filename}`,
                });
            }
            catch (error) {
                results.push({
                    table_id,
                    qrcode_url: '',
                    error: error instanceof Error ? error.message : '生成失败',
                });
            }
        }
        res.json({
            code: 0,
            data: results,
        });
    }
    catch (error) {
        console.error('批量生成小程序码失败:', error);
        res.json({
            code: 500,
            message: error instanceof Error ? error.message : '批量生成小程序码失败',
            data: null,
        });
    }
});
/**
 * 列出已生成的桌号码
 * GET /api/qrcode/list
 */
exports.listQrcodes = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        // 确保目录存在
        if (!fs.existsSync(qrcodesDir)) {
            return res.json({
                code: 0,
                data: [],
            });
        }
        // 读取目录下所有 table_*.png 文件
        const files = fs.readdirSync(qrcodesDir);
        const qrcodes = files
            .filter((file) => /^table_(.+)\.png$/.test(file))
            .map((file) => {
            const match = file.match(/^table_(.+)\.png$/);
            return {
                table_id: match ? match[1] : '',
                qrcode_url: `/uploads/qrcodes/${file}`,
            };
        })
            .sort((a, b) => {
            // 尝试按数字排序
            const numA = parseInt(a.table_id, 10);
            const numB = parseInt(b.table_id, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.table_id.localeCompare(b.table_id);
        });
        res.json({
            code: 0,
            data: qrcodes,
        });
    }
    catch (error) {
        console.error('获取小程序码列表失败:', error);
        res.json({
            code: 500,
            message: error instanceof Error ? error.message : '获取小程序码列表失败',
            data: null,
        });
    }
});
//# sourceMappingURL=qrcodeController.js.map