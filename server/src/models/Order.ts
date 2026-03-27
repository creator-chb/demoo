import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Order 状态枚举
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// Order 属性接口
export interface OrderAttributes {
  id: number;
  order_no: string;
  user_openid: string;
  product_id: number;
  table_id: string;
  status: OrderStatus;
  created_at?: Date;
  updated_at?: Date;
}

// 创建时可选字段
export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {}

// Order 模型类
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public order_no!: string;
  public user_openid!: string;
  public product_id!: number;
  public table_id!: string;
  public status!: OrderStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化模型
Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单号',
    },
    user_openid: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '用户OpenID',
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '产品ID',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    table_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '桌号',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      defaultValue: 'pending',
      comment: '订单状态: pending待处理 processing处理中 completed已完成 cancelled已取消',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Order;
