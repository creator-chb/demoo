import api from '../../utils/api'
import config from '../../utils/config'

// 获取系统信息用于安全区适配
const systemInfo = wx.getWindowInfo()
const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

// WebSocket 相关变量
let socketTask: WechatMiniprogram.SocketTask | null = null
let heartbeatTimer: number | null = null

Page({
  data: {
    tableId: '',
    categories: [] as any[],
    products: [] as any[],
    currentCategoryId: 0,   // 当前选中的分类ID，0表示全部
    loading: false,
    // 安全区高度（状态栏 + 导航栏）
    statusBarHeight: systemInfo.statusBarHeight || 20,
    navBarHeight: (menuButtonInfo.bottom - menuButtonInfo.top) + (menuButtonInfo.top - (systemInfo.statusBarHeight || 20)) * 2
  },
  
  onLoad(options: any) {
    const app = getApp()
    // 从页面参数或全局数据获取桌号
    const tableId = (options && options.table_id) || app.globalData.tableId || '1'
    this.setData({ tableId })
    
    this.loadCategories()
  },
  
  onShow() {
    this.connectWebSocket()
  },
  
  onUnload() {
    this.closeWebSocket()
  },
  
  // 加载分类列表
  async loadCategories() {
    try {
      const res = await api.get(config.api.categories)
      if (res.code === 0) {
        this.setData({ categories: res.data })
        // 默认加载第一个分类的产品，如果有分类的话
        if (res.data.length > 0) {
          this.setData({ currentCategoryId: res.data[0].id })
          this.loadProducts(res.data[0].id)
        } else {
          this.loadProducts()
        }
      }
    } catch (err) {
      wx.showToast({ title: '加载分类失败', icon: 'none' })
    }
  },
  
  // 加载产品列表
  async loadProducts(categoryId?: number) {
    this.setData({ loading: true })
    try {
      const params: any = {}
      if (categoryId) {
        params.category_id = categoryId
      }
      const res = await api.get(config.api.products, params)
      if (res.code === 0) {
        this.setData({ products: res.data })
      }
    } catch (err) {
      wx.showToast({ title: '加载产品失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 切换分类
  switchCategory(e: any) {
    const id = e.currentTarget.dataset.id
    this.setData({ currentCategoryId: id })
    this.loadProducts(id)
  },
  
  // 查看产品详情
  goToDetail(e: any) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/product-detail/product-detail?id=' + productId + '&table_id=' + this.data.tableId
    })
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
      console.log('Order page WebSocket connected')
      this.startHeartbeat()
    })
    
    socketTask.onMessage((res: any) => {
      try {
        const message = JSON.parse(res.data)
        console.log('Order page WebSocket message:', message)
        if (message.type === 'order_status_update') {
          // 显示订单状态更新通知
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
      console.log('Order page WebSocket disconnected')
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
      console.error('Order page WebSocket error:', err)
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
