"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.syncDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'order_system',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123456',
};
// 创建 Sequelize 实例
exports.sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    timezone: '+08:00', // 东八区
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // 连接级别字符集设置 - 解决中文乱码问题
    dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true, // 使用下划线命名
        freezeTableName: true, // 禁止表名复数化
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
});
// 数据库同步方法
const syncDatabase = async (force = false) => {
    try {
        await exports.sequelize.sync({ force, alter: !force });
        console.log('数据库同步成功');
    }
    catch (error) {
        console.error('数据库同步失败:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
// 测试数据库连接
const testConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('数据库连接成功');
        return true;
    }
    catch (error) {
        console.error('数据库连接失败:', error);
        return false;
    }
};
exports.testConnection = testConnection;
exports.default = exports.sequelize;
//# sourceMappingURL=database.js.map