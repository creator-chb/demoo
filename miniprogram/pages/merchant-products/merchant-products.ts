import api from '../../utils/api'
import config from '../../utils/config'

Page({
  data: {
    products: [] as any[],
    categories: [] as any[],
    currentCategoryId: 0,   // 0表示全部
    showModal: false,
    editingId: 0,           // 0表示新增，>0表示编辑
    formName: '',
    formDescription: '',
    formCategoryId: 0,
    formCategoryIndex: 0,
    formSortOrder: '0',
    formStatus: 1,
    formImage: ''
  },

  onLoad() {
    this.loadCategories()
    this.loadProducts()
  },

  onShow() {
    this.loadProducts()
  },

  async loadCategories() {
    try {
      const res = await api.get(config.api.merchantCategories, {}, true)
      if (res.code === 0) {
        this.setData({ categories: res.data })
      }
    } catch (err) {
      console.error('加载分类失败', err)
    }
  },

  async loadProducts() {
    try {
      const params: any = {}
      if (this.data.currentCategoryId > 0) {
        params.category_id = this.data.currentCategoryId
      }
      const res = await api.get(config.api.merchantProducts, params, true)
      if (res.code === 0) {
        this.setData({ products: res.data })
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 切换分类筛选
  switchCategory(e: any) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategoryId: categoryId })
    this.loadProducts()
  },

  // 打开新增弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      editingId: 0,
      formName: '',
      formDescription: '',
      formCategoryId: this.data.categories.length > 0 ? this.data.categories[0].id : 0,
      formCategoryIndex: 0,
      formSortOrder: '0',
      formStatus: 1,
      formImage: ''
    })
  },

  // 打开编辑弹窗
  showEditModal(e: any) {
    const product = e.currentTarget.dataset.item
    const categoryIndex = this.data.categories.findIndex(c => c.id === product.category_id)
    this.setData({
      showModal: true,
      editingId: product.id,
      formName: product.name,
      formDescription: product.description || '',
      formCategoryId: product.category_id,
      formCategoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      formSortOrder: String(product.sort_order),
      formStatus: product.status,
      formImage: product.image_url || ''
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  onNameInput(e: any) {
    this.setData({ formName: e.detail.value })
  },

  onDescInput(e: any) {
    this.setData({ formDescription: e.detail.value })
  },

  onCategoryChange(e: any) {
    const index = e.detail.value
    this.setData({
      formCategoryIndex: index,
      formCategoryId: this.data.categories[index].id
    })
  },

  onSortInput(e: any) {
    this.setData({ formSortOrder: e.detail.value })
  },

  onStatusChange() {
    this.setData({ formStatus: this.data.formStatus === 1 ? 0 : 1 })
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await new Promise<WechatMiniprogram.ChooseImageSuccessCallbackResult>((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        })
      })
      const tempFilePath = res.tempFilePaths[0]
      wx.showLoading({ title: '上传中...' })
      const uploadRes = await api.upload(tempFilePath)
      wx.hideLoading()
      if (uploadRes.code === 0) {
        this.setData({ formImage: uploadRes.data.url })
        wx.showToast({ title: '上传成功', icon: 'success' })
      } else {
        wx.showToast({ title: uploadRes.message || '上传失败', icon: 'none' })
      }
    } catch (err) {
      wx.hideLoading()
      console.error('选择或上传图片失败', err)
    }
  },

  // 删除图片
  removeImage() {
    this.setData({ formImage: '' })
  },

  // 保存（新增或编辑）
  async handleSave() {
    const { editingId, formName, formDescription, formCategoryId, formSortOrder, formStatus, formImage } = this.data
    if (!formName.trim()) {
      wx.showToast({ title: '请输入产品名称', icon: 'none' })
      return
    }
    if (!formCategoryId) {
      wx.showToast({ title: '请选择分类', icon: 'none' })
      return
    }
    const data = {
      name: formName,
      description: formDescription,
      category_id: formCategoryId,
      sort_order: parseInt(formSortOrder) || 0,
      status: formStatus,
      image_url: formImage
    }
    try {
      let res
      if (editingId === 0) {
        res = await api.post(config.api.merchantProducts, data, true)
      } else {
        res = await api.put(config.api.merchantProducts + '/' + editingId, data, true)
      }
      if (res.code === 0) {
        wx.showToast({ title: editingId ? '更新成功' : '创建成功', icon: 'success' })
        this.closeModal()
        this.loadProducts()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  // 切换上下架
  async toggleStatus(e: any) {
    const product = e.currentTarget.dataset.item
    const newStatus = product.status === 1 ? 0 : 1
    try {
      const res = await api.put(config.api.merchantProducts + '/' + product.id, { status: newStatus }, true)
      if (res.code === 0) {
        wx.showToast({ title: newStatus === 1 ? '已上架' : '已下架', icon: 'success' })
        this.loadProducts()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  // 删除产品
  async handleDelete(e: any) {
    const id = e.currentTarget.dataset.id
    const res = await new Promise<any>((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该产品吗？',
        success: resolve
      })
    })
    if (!res.confirm) return
    try {
      const result = await api.delete(config.api.merchantProducts + '/' + id, {}, true)
      if (result.code === 0) {
        wx.showToast({ title: '删除成功', icon: 'success' })
        this.loadProducts()
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '删除失败', icon: 'none' })
    }
  }
})
