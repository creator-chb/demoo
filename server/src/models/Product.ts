import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Product 属性接口
export interface ProductAttributes {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  status: number;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

// 创建时可选字段
export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'description' | 'image_url' | 'images' | 'status' | 'sort_order' | 'created_at' | 'updated_at'> {}

// Product 模型类
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public category_id!: number;
  public name!: string;
  public description!: string | null;
  public image_url!: string | null;
  public images!: string[] | null;
  public status!: number;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// 初始化模型
Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '产品名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '产品描述',
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '主图地址',
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '多图地址数组',
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 1上架 0下架',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序顺序',
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
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Product;
