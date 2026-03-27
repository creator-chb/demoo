import api from '../../utils/api'
import config from '../../utils/config'
import { formatTime } from '../../utils/util'

// 心跳定时器
let heartbeatTimer: number | null = null

// SocketTask 实例
let socketTask: WechatMiniprogram.SocketTask | null = null

Page({
  data: {
    orders: [] as any[],
    currentTab: 'all',
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'pending', name: '待处理' },
      { key: 'processing', name: '进行中' },
      { key: 'completed', name: '已完成' },
      { key: 'cancelled', name: '已取消' }
    ],
    wsConnected: false
  },

  onLoad() {
    this.loadOrders()
    this.connectWebSocket()
  },

  onShow() {
    this.loadOrders()
    // 如果WebSocket断开，尝试重连
    if (!this.data.wsConnected) {
      this.connectWebSocket()
    }
  },

  onHide() {
    // 页面隐藏时保持连接
  },

  onUnload() {
    this.closeWebSocket()
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 切换标签
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.loadOrders()
  },

  async loadOrders() {
    const { currentTab } = this.data
    try {
      const params: any = {}
      if (currentTab !== 'all') {
        params.status = currentTab
      }
      const res = await api.get(config.api.merchantOrders, params, true)
      if (res.code === 0) {
        // 格式化时间
        const orders = res.data.map((order: any) => ({
          ...order,
          formattedTime: order.created_at ? formatTime(new Date(order.created_at)) : ''
        }))
        this.setData({ orders })
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 接单
  async handleAccept(e: any) {
    const id = e.currentTarget.dataset.id
    try {
      const res = await api.put(config.api.merchantOrders + '/' + id + '/accept', {}, true)
      if (res.code === 0) {
        wx.showToast({ title: '接单成功', icon: 'success' })
        this.loadOrders()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  // 完成订单
  async handleComplete(e: any) {
    const id = e.currentTarget.dataset.id
    try {
      const res = await api.put(config.api.merchantOrders + '/' + id + '/complete', {}, true)
      if (res.code === 0) {
        wx.showToast({ title: '订单已完成', icon: 'success' })
        this.loadOrders()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  // 强制重置
  async handleReset(e: any) {
    const id = e.currentTarget.dataset.id
    const confirm = await new Promise<any>((resolve) => {
      wx.showModal({
        title: '强制重置',
        content: '确定要强制重置此订单吗？',
        success: resolve
      })
    })
    if (!confirm.confirm) return
    try {
      const res = await api.put(config.api.merchantOrders + '/' + id + '/reset', {}, true)
      if (res.code === 0) {
        wx.showToast({ title: '已重置', icon: 'success' })
        this.loadOrders()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  // 获取状态标签样式类
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    }
    return classMap[status] || ''
  },

  // 获取状态显示文本
  getStatusText(status: string): string {
    const textMap: { [key: string]: string } = {
      'pending': '待处理',
      'processing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return textMap[status] || status
  },

  // 建立WebSocket连接
  connectWebSocket() {
    // 如果已有连接，先关闭
    if (socketTask) {
      socketTask.close({})
      socketTask = null
    }

    // 添加 type=merchant 参数，标识这是商家端连接
    const wsUrl = config.wsUrl + '?type=merchant'

    socketTask = wx.connectSocket({
      url: wsUrl
    })

    socketTask.onOpen(() => {
      console.log('WebSocket connected')
      this.setData({ wsConnected: true })

      // 启动心跳
      this.startHeartbeat()
    })

    socketTask.onMessage((res: any) => {
      try {
        const message = JSON.parse(res.data)
        console.log('WebSocket message:', message)

        if (message.type === 'new_order') {
          // 收到新订单通知
          this.handleNewOrderNotification(message.data)
        } else if (message.type === 'order_update') {
          // 订单状态更新
          this.loadOrders()
        }
      } catch (e) {
        console.error('Parse WebSocket message error:', e)
      }
    })

    socketTask.onClose(() => {
      console.log('WebSocket disconnected')
      this.setData({ wsConnected: false })
      this.stopHeartbeat()
      socketTask = null

      // 5秒后自动重连
      setTimeout(() => {
        if (!this.data.wsConnected) {
          console.log('Attempting to reconnect...')
          this.connectWebSocket()
        }
      }, 5000)
    })

    socketTask.onError((err: any) => {
      console.error('WebSocket error:', err)
      this.setData({ wsConnected: false })
    })
  },

  // 关闭WebSocket
  closeWebSocket() {
    this.stopHeartbeat()
    if (socketTask) {
      socketTask.close({})
      socketTask = null
    }
    this.setData({ wsConnected: false })
  },

  // 心跳保活
  startHeartbeat() {
    this.stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (this.data.wsConnected && socketTask) {
        socketTask.send({
          data: JSON.stringify({ type: 'ping' }),
          fail: () => {
            this.setData({ wsConnected: false })
          }
        })
      }
    }, 30000) as unknown as number // 30秒一次心跳
  },

  // 停止心跳
  stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  },

  // 处理新订单通知
  handleNewOrderNotification(orderData: any) {
    // 1. 播放语音提示
    this.playNotificationSound()
    
    // 2. 震动提示
    wx.vibrateShort({ type: 'heavy' })
    
    // 3. 显示通知
    const tableId = orderData.table_id || '未知'
    wx.showToast({
      title: `${tableId}号桌有新订单`,
      icon: 'none',
      duration: 3000
    })
    
    // 4. 刷新订单列表
    this.loadOrders()
  },

  // 播放语音提示
  playNotificationSound() {
    const innerAudioContext = wx.createInnerAudioContext()
    // 使用系统提示音或自定义音频
    // 占位URL，实际使用时可替换为真实音频地址
    innerAudioContext.src = 'https://webinference.ai/assets/new-order.mp3'
    
    // 备选方案：如果无法加载远程音频，使用振动代替
    innerAudioContext.onError((err: any) => {
      console.log('Audio play error, using vibrate instead:', err)
      wx.vibrateLong({})
    })
    
    innerAudioContext.onEnded(() => {
      innerAudioContext.destroy()
    })
    
    innerAudioContext.play()
  }
})
