"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// Config 模型类
class Config extends sequelize_1.Model {
}
// 初始化模型
Config.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    config_key: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '配置键名',
    },
    config_value: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '配置值',
    },
    description: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
        comment: '配置描述',
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'configs',
    timestamps: false,
    updatedAt: 'updated_at',
});
exports.default = Config;
//# sourceMappingURL=Config.js.map