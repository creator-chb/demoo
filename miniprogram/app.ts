// app.ts
App({
  globalData: {
    userInfo: null,
    openid: '',
    tableId: '',
    baseUrl: 'http://localhost:3000'  // 后端API地址
  },
  
  onLaunch() {
    // 获取启动参数中的 table_id
    // 调用 wx.login 获取 code，后续换取 openid
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    wx.login({
      success: (res) => {
        if (res.code) {
          // 这里后续会调用后端API换取openid
          // 测试阶段先用模拟openid
          this.globalData.openid = 'test_openid_' + Date.now()
          console.log('登录code:', res.code)
        }
      }
    })
  },

  onShow(options: any) {
    // 从场景值或query中获取 table_id
    if (options && options.query && options.query.table_id) {
      this.globalData.tableId = options.query.table_id
    }
    // 从 scene 参数解析 table_id
    if (options && options.query && options.query.scene) {
      const scene = decodeURIComponent(options.query.scene)
      const params = new URLSearchParams(scene)
      const tableId = params.get('table_id')
      if (tableId) {
        this.globalData.tableId = tableId
      }
    }
  }
})