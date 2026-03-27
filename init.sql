-- =============================================
-- 点单系统数据库初始化脚本
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `order_system` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `order_system`;

-- =============================================
-- 创建表结构
-- =============================================

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1启用 0禁用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 产品表
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL COMMENT '分类ID',
  `name` VARCHAR(200) NOT NULL COMMENT '产品名称',
  `description` TEXT COMMENT '产品描述',
  `image_url` VARCHAR(500) COMMENT '主图地址',
  `images` JSON COMMENT '多图地址数组',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1上架 0下架',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
  `user_openid` VARCHAR(100) NOT NULL COMMENT '用户OpenID',
  `product_id` INT NOT NULL COMMENT '产品ID',
  `table_id` VARCHAR(50) NOT NULL COMMENT '桌号',
  `status` ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 商家表
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) UNIQUE NOT NULL COMMENT '用户名',
  `password` VARCHAR(200) NOT NULL COMMENT '密码(bcrypt加密)',
  `name` VARCHAR(100) COMMENT '商家名称',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 配置表
CREATE TABLE IF NOT EXISTS `configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键名',
  `config_value` TEXT COMMENT '配置值',
  `description` VARCHAR(200) COMMENT '配置描述',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入商家账号 (密码: admin123 的 bcrypt 哈希值)
INSERT INTO `merchants` (`username`, `password`, `name`) VALUES
('admin', '$2a$10$XnLyERW0L76RZ0WorG/o/uWzSNBADo8MWSKjzfTiCYLIurSa7yklq', '系统管理员');

-- 插入默认配置
INSERT INTO `configs` (`config_key`, `config_value`, `description`) VALUES
('qrcode_image', 'https://via.placeholder.com/200?text=QRCode', '支付二维码图片地址'),
('coming_soon_text', '敬请期待，更多精彩产品即将上线！', '敬请期待文字');
