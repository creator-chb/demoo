import { Request, Response, NextFunction } from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { asyncHandler } from '../middleware/errorHandler';

// 微信配置
const WECHAT_APPID = process.env.WECHAT_APPID || '';
const WECHAT_APPSECRET = process.env.WECHAT_APPSECRET || '';

// access_token 缓存
interface TokenCache {
  token: string;
  expiresAt: number; // 过期时间戳
}

let tokenCache: TokenCache | null = null;

// 确保 qrcodes 目录存在
const qrcodesDir = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrcodesDir)) {
  fs.mkdirSync(qrcodesDir, { recursive: true });
}

/**
 * 发送 HTTPS GET 请求
 */
function httpsGet<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (error) {
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
function httpsPostBuffer(url: string, body: object): Promise<Buffer> {
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
      const chunks: Buffer[] = [];
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
          } catch {
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
async function getAccessToken(): Promise<string> {
  // 检查缓存是否有效（提前5分钟过期）
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
    return tokenCache.token;
  }

  // 获取新的 access_token
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;

  interface TokenResponse {
    access_token: string;
    expires_in: number;
    errcode?: number;
    errmsg?: string;
  }

  const response = await httpsGet<TokenResponse>(url);

  if (response.errcode && response.errcode !== 0) {
    console.error('❌ 获取 access_token 失败:', response.errmsg, '(errcode:', response.errcode, ')');
    throw new Error(`获取 access_token 失败: ${response.errmsg} (errcode: ${response.errcode})`);
  }

  if (!response.access_token) {
    console.error('❌ 获取 access_token 失败: 返回数据无效', response);
    throw new Error('获取 access_token 失败: 返回数据无效');
  }

  // 缓存 token
  tokenCache = {
    token: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  };

  console.log('✅ 获取微信 access_token 成功');
  return response.access_token;
}

/**
 * 生成单个桌号小程序码
 * POST /api/qrcode/generate
 */
export const generateQrcode = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

    // 构建 scene 参数并验证
    const scene = `table_id=${table_id}`;
    if (scene.length > 32) {
      return res.json({
        code: 400,
        message: 'scene参数超过32字符限制',
        data: null,
      });
    }

    // 调用微信接口生成小程序码
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;
    const body = {
      scene,
      // page 参数为空，让用户扫码后跳转到首页，首页通过 scene 参数获取 table_id
      // 注意：小程序未发布时必须为空，否则会报 41030 错误
      page: '',
      check_path: false,
      env_version: 'release',
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
  } catch (error) {
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
export const batchGenerateQrcode = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

  const results: Array<{ table_id: string; qrcode_url: string; error?: string }> = [];

  try {
    // 获取一次 access_token，批量使用
    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;

    for (let i = start; i <= end; i++) {
      const table_id = i.toString();

      // 构建 scene 参数并验证
      const scene = `table_id=${table_id}`;
      if (scene.length > 32) {
        results.push({
          table_id,
          qrcode_url: '',
          error: 'scene参数超过32字符限制',
        });
        continue;
      }

      try {
        const body = {
          scene,
          // page 参数为空，让用户扫码后跳转到首页，首页通过 scene 参数获取 table_id
          // 注意：小程序未发布时必须为空，否则会报 41030 错误
          page: '',
          check_path: false,
          env_version: 'release',
          width: 430,
          auto_color: false,
          line_color: { r: 0, g: 0, b: 0 },
        };

        const buffer = await httpsPostBuffer(url, body);

        // 保存文件
        const filename = `table_${table_id}.png`;
        const filepath = path.join(qrcodesDir, filename);
        fs.writeFileSync(filepath, buffer);

        console.log(`✅ 生成桌号 ${table_id} 小程序码成功，保存到 ${filepath}`);
        results.push({
          table_id,
          qrcode_url: `/uploads/qrcodes/${filename}`,
        });
      } catch (error) {
        console.error(`❌ 生成桌号 ${table_id} 小程序码失败:`, error instanceof Error ? error.message : error);
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
  } catch (error) {
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
export const listQrcodes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    console.error('获取小程序码列表失败:', error);
    res.json({
      code: 500,
      message: error instanceof Error ? error.message : '获取小程序码列表失败',
      data: null,
    });
  }
});
