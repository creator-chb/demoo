"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.getMyOrders = exports.createOrder = void 0;
const models_1 = require("../models");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const sequelize_1 = require("sequelize");
const websocket_1 = require("../websocket");
// 生成订单号: 'ORD' + 时间戳 + 4位随机数
const generateOrderNo = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${timestamp}${random}`;
};
// POST /api/orders - 创建订单
exports.createOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { user_openid, product_id, table_id } = req.body;
    // 1. 验证参数完整性
    if (!user_openid || !product_id || !table_id) {
        return res.json({
            code: 400,
            message: '参数不完整，需要 user_openid, product_id, table_id',
            data: null
        });
    }
    // 使用事务确保原子性，防止并发问题
    const transaction = await database_1.sequelize.transaction();
    try {
        // 2. 查询该 user_openid 是否存在 status 为 'pending' 或 'processing' 的订单
        const existingOrder = await models_1.Order.findOne({
            where: {
                user_openid,
                status: {
                    [sequelize_1.Op.in]: ['pending', 'processing']
                }
            },
            transaction,
            lock: transaction.LOCK.UPDATE // 行级锁，防止并发
        });
        // 3. 如果存在未完成订单，返回错误
        if (existingOrder) {
            await transaction.rollback();
            return res.json({
                code: 400,
                message: '您当前已有未完成的订单，请等待商家确认完成',
                data: null
            });
        }
        // 4. 创建新订单
        const order = await models_1.Order.create({
            order_no: generateOrderNo(),
            user_openid,
            product_id,
            table_id,
            status: 'pending'
        }, { transaction });
        // 提交事务
        await transaction.commit();
        // 推送新订单通知到商家端
        (0, websocket_1.notifyNewOrder)({
            id: order.id,
            order_no: order.order_no,
            table_id: order.table_id,
            product_id: order.product_id,
            user_openid: order.user_openid,
            status: order.status,
            created_at: order.created_at
        });
        // 5. 返回成功
        res.json({
            code: 0,
            message: '下单成功',
            data: order
        });
    }
    catch (error) {
        // 发生错误时回滚事务
        await transaction.rollback();
        throw error;
    }
});
// GET /api/orders/my - 获取用户订单列表
exports.getMyOrders = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { openid } = req.query;
    // 验证 openid 参数
    if (!openid) {
        return res.json({
            code: 400,
            message: 'openid 参数必须',
            data: null
        });
    }
    const orders = await models_1.Order.findAll({
        where: { user_openid: openid },
        order: [['created_at', 'DESC']],
        include: [
            {
                model: models_1.Product,
                as: 'product',
                attributes: ['id', 'name', 'image_url', 'description']
            }
        ]
    });
    res.json({
        code: 0,
        message: 'success',
        data: orders
    });
});
// PUT /api/orders/:id/cancel - 用户取消订单
exports.cancelOrder = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { user_openid } = req.body;
    // 验证参数
    if (!user_openid) {
        return res.json({
            code: 400,
            message: 'user_openid 参数必须',
            data: null
        });
    }
    // 1. 查找订单
    const order = await models_1.Order.findByPk(id);
    if (!order) {
        return res.json({
            code: 404,
            message: '订单不存在',
            data: null
        });
    }
    // 2. 验证 user_openid 匹配
    if (order.user_openid !== user_openid) {
        return res.json({
            code: 403,
            message: '无权操作此订单',
            data: null
        });
    }
    // 3. 只有 status 为 'pending' 的订单可取消
    if (order.status !== 'pending') {
        return res.json({
            code: 400,
            message: '只有待处理的订单可以取消',
            data: null
        });
    }
    // 4. 更新 status 为 'cancelled'
    order.status = 'cancelled';
    await order.save();
    // 5. 返回成功
    res.json({
        code: 0,
        message: '取消成功',
        data: order
    });
});
//# sourceMappingURL=orderController.js.map