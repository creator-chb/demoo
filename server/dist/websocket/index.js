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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.notifyNewOrder = notifyNewOrder;
exports.notifyOrderUpdate = notifyOrderUpdate;
exports.notifyCustomerOrderUpdate = notifyCustomerOrderUpdate;
const ws_1 = __importStar(require("ws"));
const url_1 = __importDefault(require("url"));
let wss = null;
const clients = new Map();
function initWebSocket(server) {
    wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        // 从 URL 查询参数中获取客户端类型和 openid
        const parsedUrl = url_1.default.parse(req.url || '', true);
        const clientType = parsedUrl.query.type || 'unknown';
        const openid = parsedUrl.query.openid || '';
        console.log(`WebSocket client connected, type: ${clientType}, openid: ${openid || '(none)'}`);
        // 存储客户端信息
        const clientInfo = {
            ws,
            type: clientType === 'merchant' ? 'merchant' : 'customer',
            openid: openid
        };
        clients.set(ws, clientInfo);
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log('Received:', data);
                // 可以处理客户端发来的消息，如心跳
                if (data.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }
                // 处理身份认证消息
                if (data.type === 'auth' && data.clientType) {
                    clientInfo.type = data.clientType === 'merchant' ? 'merchant' : 'customer';
                    if (data.openid) {
                        clientInfo.openid = data.openid;
                    }
                    console.log(`Client authenticated as: ${clientInfo.type}${clientInfo.openid ? ', openid: ' + clientInfo.openid : ''}`);
                }
            }
            catch (e) {
                console.error('Invalid message:', message);
            }
        });
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            clients.delete(ws);
        });
        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
            clients.delete(ws);
        });
        // 发送欢迎消息
        ws.send(JSON.stringify({ type: 'connected', message: '连接成功' }));
    });
    console.log('WebSocket server initialized');
}
// 向所有商家端推送新订单通知
function notifyNewOrder(orderData) {
    const message = JSON.stringify({
        type: 'new_order',
        data: orderData
    });
    let notifiedCount = 0;
    clients.forEach((clientInfo) => {
        if (clientInfo.type === 'merchant' && clientInfo.ws.readyState === ws_1.default.OPEN) {
            clientInfo.ws.send(message);
            notifiedCount++;
        }
    });
    console.log(`Notified ${notifiedCount} merchant clients of new order`);
}
// 向所有商家端推送订单状态更新
function notifyOrderUpdate(orderData) {
    const message = JSON.stringify({
        type: 'order_update',
        data: orderData
    });
    clients.forEach((clientInfo) => {
        if (clientInfo.type === 'merchant' && clientInfo.ws.readyState === ws_1.default.OPEN) {
            clientInfo.ws.send(message);
        }
    });
}
// 向特定用户推送订单状态更新
function notifyCustomerOrderUpdate(userOpenid, orderData) {
    const message = JSON.stringify({
        type: 'order_status_update',
        data: orderData
    });
    let notifiedCount = 0;
    clients.forEach((clientInfo) => {
        if (clientInfo.type === 'customer' && clientInfo.openid === userOpenid && clientInfo.ws.readyState === ws_1.default.OPEN) {
            clientInfo.ws.send(message);
            notifiedCount++;
        }
    });
    console.log(`Notified ${notifiedCount} customer clients (openid: ${userOpenid}) of order update`);
}
//# sourceMappingURL=index.js.map