// index.ts - 首页四宫格布局
import api from '../../utils/api'
import config from '../../utils/config'

const app = getApp<IAppOption>()

Page({
  data: {
    tableId: '',
    qrcodeUrl: '',
    statusBarHeight: 0,
    navBarHeight: 44
  },

  onLoad(options: any) {
    // 获取状态栏高度用于自定义导航栏
    const systemInfo = wx.getWindowInfo()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      navBarHeight: 44
    })

    // 如果页面options有table_id，优先使用
    if (options && options.table_id) {
      app.globalData.tableId = options.table_id
    }
    
    // 如果有scene参数（扫码进入）
    if (options && options.scene) {
      const scene = decodeURIComponent(options.scene)
      // scene格式可能是 "table_id=3" 这样的
      const params = scene.split('&')
      params.forEach((param: string) => {
        const [key, value] = param.split('=')
        if (key === 'table_id') {
          app.globalData.tableId = value
        }
      })
    }
    
    this.setData({ tableId: app.globalData.tableId || '1' })
    
    // 加载二维码配置
    this.loadQrCode()
  },

  onShow() {
    // 每次显示时更新tableId
    const tableId = app.globalData.tableId || '1'
    this.setData({ tableId })
  },

  // 加载二维码图片
  async loadQrCode() {
    try {
      const res = await api.get(config.api.config + '/qrcode_image')
      if (res.code === 0 && res.data && res.data.value) {
        this.setData({ qrcodeUrl: res.data.value })
      }
    } catch (err) {
      console.log('获取二维码配置失败', err)
      // 获取失败时使用空值，显示占位图标
    }
  },

  // 跳转到点单页面
  goToOrder() {
    const tableId = this.data.tableId || '1'
    wx.navigateTo({
      url: `/pages/order/order?table_id=${tableId}`
    })
  },

  // 跳转到商家登录页
  goToMerchant() {
    wx.navigateTo({
      url: '/pages/merchant-login/merchant-login'
    })
  }
})
