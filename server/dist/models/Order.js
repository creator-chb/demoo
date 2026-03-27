"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// Order 模型类
class Order extends sequelize_1.Model {
}
// 初始化模型
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    order_no: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '订单号',
    },
    user_openid: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        comment: '用户OpenID',
    },
    product_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '产品ID',
        references: {
            model: 'products',
            key: 'id',
        },
    },
    table_id: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        comment: '桌号',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
        defaultValue: 'pending',
        comment: '订单状态: pending待处理 processing处理中 completed已完成 cancelled已取消',
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Order;
//# sourceMappingURL=Order.js.map