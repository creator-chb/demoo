import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'order_system',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123456',
};

// 创建 Sequelize 实例
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
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
  }
);

// 数据库同步方法
export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
    throw error;
  }
};

// 测试数据库连接
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
};

export default sequelize;
