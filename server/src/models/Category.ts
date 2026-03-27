import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Category 属性接口
export interface CategoryAttributes {
  id: number;
  name: string;
  sort_order: number;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

// 创建时可选字段
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'sort_order' | 'status' | 'created_at' | 'updated_at'> {}

// Category 模型类
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public sort_order!: number;
  public status!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化模型
Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序顺序',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 1启用 0禁用',
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
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Category;
