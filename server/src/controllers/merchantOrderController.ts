import { Response } from 'express';
import { Op } from 'sequelize';
import { Order, Product, Category } from '../models';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { notifyOrderUpdate, notifyCustomerOrderUpdate } from '../websocket';

/**
 * GET /api/merchant/orders - 获取订单列表
 * 支持 query: status（可选, 'all'|'pending'|'processing'|'completed'|'cancelled'）
 * 关联查询产品信息
 * 按 created_at DESC 排序
 */
export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;

  // 构建查询条件
  const whereClause: { status?: string | { [Op.in]: string[] } } = {};
  
  // 处理状态过滤
  if (status && status !== 'all') {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (validStatuses.includes(status as string)) {
      whereClause.status = status as string;
    }
  }

  const orders = await Order.findAll({
    where: whereClause,
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description', 'image_url', 'category_id'],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return res.json({
    code: 0,
    message: 'success',
    data: orders
  });
});

/**
 * PUT /api/merchant/orders/:id/accept - 接单
 * 业务逻辑: 将 status 从 'pending' 更新为 'processing'
 * 只有 'pending' 状态的订单可以接单
 */
export const acceptOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // 查找订单
  const order = await Order.findByPk(id, {
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description', 'image_url', 'category_id'],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  });

  if (!order) {
    return res.status(404).json({
      code: 404,
      message: '订单不存在',
      data: null
    });
  }

  // 检查订单状态
  if (order.status !== 'pending') {
    return res.status(400).json({
      code: 400,
      message: `订单当前状态为"${getStatusText(order.status)}"，无法接单`,
      data: null
    });
  }

  // 更新订单状态
  await order.update({ status: 'processing' });

  // 推送 WebSocket 通知
  notifyOrderUpdate({
    id: order.id,
    order_no: order.order_no,
    table_id: order.table_id,
    status: order.status,
    user_openid: order.user_openid,
    updated_at: order.updated_at
  });

  // 推送用户端 WebSocket 通知
  notifyCustomerOrderUpdate(order.user_openid, {
    id: order.id,
    order_no: order.order_no,
    status: 'processing',
    updated_at: order.updated_at
  });

  return res.json({
    code: 0,
    message: '接单成功',
    data: order
  });
});

/**
 * PUT /api/merchant/orders/:id/complete - 完成订单（核心解锁）
 * 业务逻辑: 将 status 更新为 'completed'
 * 只有 'pending' 或 'processing' 状态的订单可以完成
 * 这是释放用户"限购锁"的关键操作
 */
export const completeOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // 查找订单
  const order = await Order.findByPk(id, {
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description', 'image_url', 'category_id'],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  });

  if (!order) {
    return res.status(404).json({
      code: 404,
      message: '订单不存在',
      data: null
    });
  }

  // 检查订单状态：只有 pending 或 processing 状态可以完成
  if (!['pending', 'processing'].includes(order.status)) {
    return res.status(400).json({
      code: 400,
      message: `订单当前状态为"${getStatusText(order.status)}"，无法完成`,
      data: null
    });
  }

  // 更新订单状态为已完成
  await order.update({ status: 'completed' });

  // 推送 WebSocket 通知
  notifyOrderUpdate({
    id: order.id,
    order_no: order.order_no,
    table_id: order.table_id,
    status: order.status,
    user_openid: order.user_openid,
    updated_at: order.updated_at
  });

  // 推送用户端 WebSocket 通知
  notifyCustomerOrderUpdate(order.user_openid, {
    id: order.id,
    order_no: order.order_no,
    status: 'completed',
    updated_at: order.updated_at
  });

  return res.json({
    code: 0,
    message: '订单已完成',
    data: order
  });
});

/**
 * PUT /api/merchant/orders/:id/reset - 强制重置
 * 业务逻辑: 将 status 更新为 'cancelled'（无论当前状态）
 * 针对异常情况（用户误操作、离店等）
 */
export const resetOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // 查找订单
  const order = await Order.findByPk(id, {
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description', 'image_url', 'category_id'],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  });

  if (!order) {
    return res.status(404).json({
      code: 404,
      message: '订单不存在',
      data: null
    });
  }

  // 记录原状态
  const originalStatus = order.status;

  // 强制更新订单状态为已取消
  await order.update({ status: 'cancelled' });

  // 推送 WebSocket 通知
  notifyOrderUpdate({
    id: order.id,
    order_no: order.order_no,
    table_id: order.table_id,
    status: order.status,
    user_openid: order.user_openid,
    updated_at: order.updated_at
  });

  // 推送用户端 WebSocket 通知
  notifyCustomerOrderUpdate(order.user_openid, {
    id: order.id,
    order_no: order.order_no,
    status: 'cancelled',
    updated_at: order.updated_at
  });

  return res.json({
    code: 0,
    message: '订单已重置',
    data: {
      ...order.toJSON(),
      originalStatus
    }
  });
});

/**
 * 获取订单状态的中文描述
 */
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
}

export default {
  getOrders,
  acceptOrder,
  completeOrder,
  resetOrder
};
