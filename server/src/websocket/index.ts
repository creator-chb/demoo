import WebSocket, { WebSocketServer } from 'ws'
import http from 'http'
import url from 'url'

let wss: WebSocketServer | null = null

// 存储所有连接的客户端（带类型标识和用户 openid）
interface ClientInfo {
  ws: WebSocket
  type: 'merchant' | 'customer' | 'unknown'
  openid?: string  // 用户端的 openid
}

const clients: Map<WebSocket, ClientInfo> = new Map()

function initWebSocket(server: http.Server) {
  wss = new WebSocketServer({ server })
  
  wss.on('connection', (ws: WebSocket, req) => {
    // 从 URL 查询参数中获取客户端类型和 openid
    const parsedUrl = url.parse(req.url || '', true)
    const clientType = (parsedUrl.query.type as string) || 'unknown'
    const openid = (parsedUrl.query.openid as string) || ''
    
    console.log(`WebSocket client connected, type: ${clientType}, openid: ${openid || '(none)'}`)
    
    // 存储客户端信息
    const clientInfo: ClientInfo = {
      ws,
      type: clientType === 'merchant' ? 'merchant' : 'customer',
      openid: openid
    }
    clients.set(ws, clientInfo)
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('Received:', data)
        
        // 可以处理客户端发来的消息，如心跳
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
        
        // 处理身份认证消息
        if (data.type === 'auth' && data.clientType) {
          clientInfo.type = data.clientType === 'merchant' ? 'merchant' : 'customer'
          if (data.openid) {
            clientInfo.openid = data.openid
          }
          console.log(`Client authenticated as: ${clientInfo.type}${clientInfo.openid ? ', openid: ' + clientInfo.openid : ''}`)
        }
      } catch (e) {
        console.error('Invalid message:', message)
      }
    })
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected')
      clients.delete(ws)
    })
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err)
      clients.delete(ws)
    })
    
    // 发送欢迎消息
    ws.send(JSON.stringify({ type: 'connected', message: '连接成功' }))
  })
  
  console.log('WebSocket server initialized')
}

// 向所有商家端推送新订单通知
function notifyNewOrder(orderData: any) {
  const message = JSON.stringify({
    type: 'new_order',
    data: orderData
  })
  
  let notifiedCount = 0
  clients.forEach((clientInfo) => {
    if (clientInfo.type === 'merchant' && clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(message)
      notifiedCount++
    }
  })
  
  console.log(`Notified ${notifiedCount} merchant clients of new order`)
}

// 向所有商家端推送订单状态更新
function notifyOrderUpdate(orderData: any) {
  const message = JSON.stringify({
    type: 'order_update',
    data: orderData
  })
  
  clients.forEach((clientInfo) => {
    if (clientInfo.type === 'merchant' && clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(message)
    }
  })
}

// 向特定用户推送订单状态更新
function notifyCustomerOrderUpdate(userOpenid: string, orderData: any) {
  const message = JSON.stringify({
    type: 'order_status_update',
    data: orderData
  })
  
  let notifiedCount = 0
  clients.forEach((clientInfo) => {
    if (clientInfo.type === 'customer' && clientInfo.openid === userOpenid && clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(message)
      notifiedCount++
    }
  })
  
  console.log(`Notified ${notifiedCount} customer clients (openid: ${userOpenid}) of order update`)
}

export { initWebSocket, notifyNewOrder, notifyOrderUpdate, notifyCustomerOrderUpdate }
