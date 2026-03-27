// 全局配置
const config = {
  // 后端API基础地址（开发环境）
  baseUrl: 'http://localhost:3000',
  // WebSocket地址（开发环境）
  wsUrl: 'ws://localhost:3000',
  // API路径
  api: {
    // 用户端
    login: '/api/auth/login',
    config: '/api/config',
    categories: '/api/categories',
    products: '/api/products',
    orders: '/api/orders',
    myOrders: '/api/orders/my',
    // 商家端
    merchantLogin: '/api/merchant/login',
    merchantCategories: '/api/merchant/categories',
    merchantProducts: '/api/merchant/products',
    merchantOrders: '/api/merchant/orders',
    upload: '/api/upload'
  }
}

export default config
