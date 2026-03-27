Page({
  data: {
    merchantName: ''
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const token = wx.getStorageSync('merchant_token')
    if (!token) {
      wx.redirectTo({ url: '/pages/merchant-login/merchant-login' })
      return
    }
    const merchantInfo = wx.getStorageSync('merchant_info')
    if (merchantInfo) {
      this.setData({ merchantName: merchantInfo.name || merchantInfo.username || '商家' })
    }
  },

  goToCategories() {
    wx.navigateTo({ url: '/pages/merchant-categories/merchant-categories' })
  },

  goToProducts() {
    wx.navigateTo({ url: '/pages/merchant-products/merchant-products' })
  },

  goToOrders() {
    wx.navigateTo({ url: '/pages/merchant-orders/merchant-orders' })
  },

  goToQrcode() {
    wx.navigateTo({ url: '/pages/merchant-qrcode/merchant-qrcode' })
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('merchant_token')
          wx.removeStorageSync('merchant_info')
          wx.redirectTo({ url: '/pages/merchant-login/merchant-login' })
        }
      }
    })
  }
})
