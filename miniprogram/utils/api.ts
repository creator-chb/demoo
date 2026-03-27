import config from './config'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  needAuth?: boolean  // 是否需要商家认证token
}

interface ApiResponse {
  code: number
  message: string
  data: any
}

// 统一请求封装
function request(options: RequestOptions): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const header: any = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 如果需要认证，添加 token
    if (options.needAuth) {
      const token = wx.getStorageSync('merchant_token')
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }
    }
    
    wx.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data as ApiResponse)
        } else {
          reject({ code: res.statusCode, message: '请求失败', data: null })
        }
      },
      fail: (err) => {
        reject({ code: -1, message: '网络错误', data: null })
        wx.showToast({ title: '网络连接失败', icon: 'none' })
      }
    })
  })
}

// 便捷方法
const api = {
  get(url: string, data?: any, needAuth = false) {
    return request({ url, method: 'GET', data, needAuth })
  },
  post(url: string, data?: any, needAuth = false) {
    return request({ url, method: 'POST', data, needAuth })
  },
  put(url: string, data?: any, needAuth = false) {
    return request({ url, method: 'PUT', data, needAuth })
  },
  delete(url: string, data?: any, needAuth = false) {
    return request({ url, method: 'DELETE', data, needAuth })
  },
  
  // 文件上传
  upload(filePath: string): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('merchant_token')
      wx.uploadFile({
        url: config.baseUrl + config.api.upload,
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(res.data) as ApiResponse)
          } else {
            reject({ code: res.statusCode, message: '上传失败', data: null })
          }
        },
        fail: () => {
          reject({ code: -1, message: '上传失败', data: null })
        }
      })
    })
  }
}

export default api
