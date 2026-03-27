import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Merchant 属性接口
export interface MerchantAttributes {
  id: number;
  username: string;
  password: string;
  name: string | null;
  created_at?: Date;
}

// 创建时可选字段
export interface MerchantCreationAttributes extends Optional<MerchantAttributes, 'id' | 'name' | 'created_at'> {}

// Merchant 模型类
class Merchant extends Model<MerchantAttributes, MerchantCreationAttributes> implements MerchantAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public name!: string | null;
  public readonly created_at!: Date;
}

// 初始化模型
Merchant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '密码(bcrypt加密)',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '商家名称',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'merchants',
    timestamps: false,
    createdAt: 'created_at',
  }
);

export default Merchant;
