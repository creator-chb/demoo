import api from '../../utils/api'
import config from '../../utils/config'

interface QrcodeItem {
  id: number
  table_id: number
  qrcode_url: string
  created_at: string
}

Page({
  data: {
    qrcodes: [] as QrcodeItem[],
    startTable: '',
    endTable: '',
    singleTable: ''
  },

  onLoad() {
    this.loadQrcodes()
  },

  onShow() {
    this.loadQrcodes()
  },

  // 加载桌号码列表
  async loadQrcodes() {
    try {
      const res = await api.get('/api/qrcode/list', {}, true)
      if (res.code === 0) {
        // 拼接完整图片URL
        const qrcodes = res.data.map((item: QrcodeItem) => ({
          ...item,
          fullUrl: config.baseUrl + item.qrcode_url
        }))
        this.setData({ qrcodes })
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 起始桌号输入
  onStartInput(e: any) {
    this.setData({ startTable: e.detail.value })
  },

  // 结束桌号输入
  onEndInput(e: any) {
    this.setData({ endTable: e.detail.value })
  },

  // 单个桌号输入
  onSingleInput(e: any) {
    this.setData({ singleTable: e.detail.value })
  },

  // 批量生成
  async handleBatchGenerate() {
    const start = parseInt(this.data.startTable)
    const end = parseInt(this.data.endTable)

    if (isNaN(start) || isNaN(end)) {
      wx.showToast({ title: '请输入有效的桌号', icon: 'none' })
      return
    }
    if (start > end) {
      wx.showToast({ title: '起始桌号不能大于结束桌号', icon: 'none' })
      return
    }
    if (end - start > 100) {
      wx.showToast({ title: '单次最多生成100个', icon: 'none' })
      return
    }

    wx.showLoading({ title: '生成中...' })
    try {
      const res = await api.post('/api/qrcode/batch-generate', { start, end }, true)
      wx.hideLoading()
      if (res.code === 0) {
        wx.showToast({ title: '生成成功', icon: 'success' })
        this.setData({ startTable: '', endTable: '' })
        this.loadQrcodes()
      } else {
        wx.showToast({ title: res.message || '生成失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
  },

  // 单个生成
  async handleSingleGenerate() {
    const tableId = parseInt(this.data.singleTable)

    if (isNaN(tableId) || tableId <= 0) {
      wx.showToast({ title: '请输入有效的桌号', icon: 'none' })
      return
    }

    wx.showLoading({ title: '生成中...' })
    try {
      const res = await api.post('/api/qrcode/generate', { table_id: tableId }, true)
      wx.hideLoading()
      if (res.code === 0) {
        wx.showToast({ title: '生成成功', icon: 'success' })
        this.setData({ singleTable: '' })
        this.loadQrcodes()
      } else {
        wx.showToast({ title: res.message || '生成失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
  },

  // 预览图片
  previewImage(e: any) {
    const url = e.currentTarget.dataset.url
    const urls = this.data.qrcodes.map(item => item.fullUrl)
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 长按保存图片
  async saveImage(e: any) {
    const url = e.currentTarget.dataset.url
    try {
      // 先下载图片到本地
      const downloadRes = await new Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult>((resolve, reject) => {
        wx.downloadFile({
          url: url,
          success: resolve,
          fail: reject
        })
      })

      if (downloadRes.statusCode === 200) {
        // 保存到相册
        await new Promise((resolve, reject) => {
          wx.saveImageToPhotosAlbum({
            filePath: downloadRes.tempFilePath,
            success: resolve,
            fail: reject
          })
        })
        wx.showToast({ title: '保存成功', icon: 'success' })
      }
    } catch (err: any) {
      if (err.errMsg && err.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要授权保存图片到相册',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  }
})
