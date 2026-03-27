import api from '../../utils/api'
import config from '../../utils/config'

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onUsernameInput(e: any) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value })
  },

  async handleLogin() {
    const { username, password } = this.data
    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    try {
      const res = await api.post(config.api.merchantLogin, { username, password })
      if (res.code === 0) {
        wx.setStorageSync('merchant_token', res.data.token)
        wx.setStorageSync('merchant_info', res.data.merchant)
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/merchant-admin/merchant-admin' })
        }, 1500)
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '网络错误', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
