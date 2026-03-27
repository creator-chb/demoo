"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// Merchant 模型类
class Merchant extends sequelize_1.Model {
}
// 初始化模型
Merchant.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '用户名',
    },
    password: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false,
        comment: '密码(bcrypt加密)',
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: '商家名称',
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'merchants',
    timestamps: false,
    createdAt: 'created_at',
});
exports.default = Merchant;
//# sourceMappingURL=Merchant.js.map