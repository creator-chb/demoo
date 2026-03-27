import api from '../../utils/api'
import config from '../../utils/config'

Page({
  data: {
    categories: [] as any[],
    showModal: false,
    editingId: 0,        // 0表示新增，>0表示编辑
    formName: '',
    formSortOrder: '0',
    formStatus: 1
  },

  onLoad() {
    this.loadCategories()
  },

  onShow() {
    this.loadCategories()
  },

  async loadCategories() {
    try {
      const res = await api.get(config.api.merchantCategories, {}, true)
      if (res.code === 0) {
        this.setData({ categories: res.data })
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 打开新增弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      editingId: 0,
      formName: '',
      formSortOrder: '0',
      formStatus: 1
    })
  },

  // 打开编辑弹窗
  showEditModal(e: any) {
    const cat = e.currentTarget.dataset.item
    this.setData({
      showModal: true,
      editingId: cat.id,
      formName: cat.name,
      formSortOrder: String(cat.sort_order),
      formStatus: cat.status
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  onNameInput(e: any) {
    this.setData({ formName: e.detail.value })
  },

  onSortInput(e: any) {
    this.setData({ formSortOrder: e.detail.value })
  },

  onStatusChange() {
    this.setData({ formStatus: this.data.formStatus === 1 ? 0 : 1 })
  },

  // 保存（新增或编辑）
  async handleSave() {
    const { editingId, formName, formSortOrder, formStatus } = this.data
    if (!formName.trim()) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' })
      return
    }
    const data = {
      name: formName,
      sort_order: parseInt(formSortOrder) || 0,
      status: formStatus
    }
    try {
      let res
      if (editingId === 0) {
        res = await api.post(config.api.merchantCategories, data, true)
      } else {
        res = await api.put(config.api.merchantCategories + '/' + editingId, data, true)
      }
      if (res.code === 0) {
        wx.showToast({ title: editingId ? '更新成功' : '创建成功', icon: 'success' })
        this.closeModal()
        this.loadCategories()
      } else {
        wx.showToast({ title: res.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    }
  },

  // 删除
  async handleDelete(e: any) {
    const id = e.currentTarget.dataset.id
    const res = await new Promise<any>((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该分类吗？',
        success: resolve
      })
    })
    if (!res.confirm) return
    try {
      const result = await api.delete(config.api.merchantCategories + '/' + id, {}, true)
      if (result.code === 0) {
        wx.showToast({ title: '删除成功', icon: 'success' })
        this.loadCategories()
      } else {
        wx.showToast({ title: result.message, icon: 'none' })
      }
    } catch (err: any) {
      wx.showToast({ title: err.message || '删除失败', icon: 'none' })
    }
  }
})
