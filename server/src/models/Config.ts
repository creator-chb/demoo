import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Config 属性接口
export interface ConfigAttributes {
  id: number;
  config_key: string;
  config_value: string | null;
  description: string | null;
  updated_at?: Date;
}

// 创建时可选字段
export interface ConfigCreationAttributes extends Optional<ConfigAttributes, 'id' | 'config_value' | 'description' | 'updated_at'> {}

// Config 模型类
class Config extends Model<ConfigAttributes, ConfigCreationAttributes> implements ConfigAttributes {
  public id!: number;
  public config_key!: string;
  public config_value!: string | null;
  public description!: string | null;
  public readonly updated_at!: Date;
}

// 初始化模型
Config.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    config_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '配置键名',
    },
    config_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '配置值',
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '配置描述',
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'configs',
    timestamps: false,
    updatedAt: 'updated_at',
  }
);

export default Config;
