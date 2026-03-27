import api from '../../utils/api'
import config from '../../utils/config'

Page({
  data: {
    product: null as any,
    tableId: '',
    loading: true,
    ordering: false  // 下单中状态，防重复点击
  },
  
  onLoad(options: any) {
    const app = getApp()
    const tableId = (options && options.table_id) || app.globalData.tableId || '1'
    this.setData({ tableId })
    
    if (options && options.id) {
      this.loadProduct(options.id)
    } else {
      wx.showToast({ title: '产品不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },
  
  // 加载产品详情
  async loadProduct(id: string) {
    try {
      const res = await api.get(config.api.products + '/' + id)
      if (res.code === 0) {
        this.setData({ product: res.data, loading: false })
      } else {
        wx.showToast({ title: '产品不存在', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },
  
  // 预览图片
  previewImage(e: any) {
    const current = e.currentTarget.dataset.src
    const product = this.data.product
    const urls = product.images && product.images.length > 0 
      ? product.images 
      : [product.image_url]
    wx.previewImage({ current, urls })
  },
  
  // 确认下单
  async handleOrder() {
    if (this.data.ordering) return
    
    const app = getApp()
    const openid = app.globalData.openid
    const { product, tableId } = this.data
    
    if (!openid) {
      wx.showToast({ title: '用户信息获取中，请稍后', icon: 'none' })
      return
    }
    
    // 二次确认
    const confirm = await new Promise<any>((resolve) => {
      wx.showModal({
        title: '确认下单',
        content: `确定要下单「${product.name}」吗？\n桌号：${tableId}号桌`,
        confirmText: '确认下单',
        confirmColor: '#07c160',
        success: resolve
      })
    })
    if (!confirm.confirm) return
    
    this.setData({ ordering: true })
    try {
      const res = await api.post(config.api.orders, {
        user_openid: openid,
        product_id: product.id,
        table_id: tableId
      })
      
      if (res.code === 0) {
        wx.showModal({
          title: '下单成功',
          content: '您的订单已提交，请等待商家处理',
          showCancel: true,
          cancelText: '继续浏览',
          confirmText: '查看订单',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.navigateTo({ url: '/pages/my-orders/my-orders' })
            }
          }
        })
      } else {
        // 互斥锁拦截 - 已有未完成订单
        wx.showModal({
          title: '下单失败',
          content: res.message || '您当前已有未完成的订单，请等待商家确认完成',
          showCancel: true,
          cancelText: '知道了',
          confirmText: '查看订单',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.navigateTo({ url: '/pages/my-orders/my-orders' })
            }
          }
        })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '下单失败', icon: 'none' })
    } finally {
      this.setData({ ordering: false })
    }
  }
})
