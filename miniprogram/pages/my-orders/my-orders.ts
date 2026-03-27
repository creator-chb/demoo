import api from '../../utils/api'
import config from '../../utils/config'
import { formatTime } from '../../utils/util'

let socketTask: WechatMiniprogram.SocketTask | null = null
let heartbeatTimer: number | null = null

Page({
  data: {
    orders: [] as any[],
    loading: true
  },
  
  onLoad() { this.loadOrders() },
  onShow() {
    this.loadOrders()
    this.connectWebSocket()
  },
  onUnload() {
    this.closeWebSocket()
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },
  
  async loadOrders() {
    const app = getApp()
    const openid = app.globalData.openid
    if (!openid) {
      this.setData({ loading: false })
      return
    }
    
    try {
      const res = await api.get(config.api.myOrders, { openid })
      if (res.code === 0) {
        // 格式化时间
        const orders = res.data.map((order: any) => ({
          ...order,
          created_at_text: formatTime(new Date(order.created_at))
        }))
        this.setData({ orders, loading: false })
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },
  
  // 取消订单
  async handleCancel(e: any) {
    const id = e.currentTarget.dataset.id
    const app = getApp()
    
    const confirm = await new Promise<any>((resolve) => {
      wx.showModal({
        title: '取消订单',
        content: '确定要取消此订单吗？',
        success: resolve
      })
    })
    if (!confirm.confirm) return
    
    try {
      const res = await api.put(config.api.orders + '/' + id + '/cancel', {
        user_openid: app.globalData.openid
      })
      if (res.code === 0) {
        wx.showToast({ title: '已取消', icon: 'success' })
        this.loadOrders()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },
  
  // WebSocket 连接
  connectWebSocket() {
    if (socketTask) {
      socketTask.close({})
      socketTask = null
    }
    
    // 获取用户 openid
    const app = getApp()
    const openid = app.globalData?.openid || ''
    if (!openid) {
      console.log('No openid, skip WebSocket connection')
      return
    }
    
    const wsUrl = config.wsUrl + '?type=customer&openid=' + openid
    
    socketTask = wx.connectSocket({
      url: wsUrl,
    })
    
    socketTask.onOpen(() => {
      console.log('Customer WebSocket connected')
      this.startHeartbeat()
    })
    
    socketTask.onMessage((res: any) => {
      try {
        const message = JSON.parse(res.data)
        console.log('Customer WebSocket message:', message)
        if (message.type === 'order_status_update') {
          // 订单状态更新，刷新列表
          this.loadOrders()
          // 显示通知
          const statusText: any = {
            'processing': '商家已接单',
            'completed': '订单已完成',
            'cancelled': '订单已取消'
          }
          const text = statusText[message.data?.status] || '订单状态已更新'
          wx.showToast({ title: text, icon: 'none', duration: 2000 })
        }
      } catch (e) {
        console.error('Parse message error:', e)
      }
    })
    
    socketTask.onClose(() => {
      console.log('Customer WebSocket disconnected')
      this.stopHeartbeat()
      socketTask = null
      // 自动重连
      setTimeout(() => {
        if (!socketTask) {
          this.connectWebSocket()
        }
      }, 5000)
    })
    
    socketTask.onError((err: any) => {
      console.error('Customer WebSocket error:', err)
    })
  },
  
  closeWebSocket() {
    this.stopHeartbeat()
    if (socketTask) {
      socketTask.close({})
      socketTask = null
    }
  },
  
  startHeartbeat() {
    this.stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (socketTask) {
        socketTask.send({
          data: JSON.stringify({ type: 'ping' }),
          fail: () => {}
        })
      }
    }, 30000) as unknown as number
  },
  
  stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }
})
