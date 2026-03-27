"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// Product 模型类
class Product extends sequelize_1.Model {
}
// 初始化模型
Product.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: '分类ID',
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        comment: '产品名称',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '产品描述',
    },
    image_url: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: '主图地址',
    },
    images: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        comment: '多图地址数组',
    },
    status: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        comment: '状态: 1上架 0下架',
    },
    sort_order: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        comment: '排序顺序',
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
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.default = Product;
//# sourceMappingURL=Product.js.map