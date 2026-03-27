// 导入所有模型
import Category from './Category';
import Product from './Product';
import Order from './Order';
import Merchant from './Merchant';
import Config from './Config';

// 定义模型关联关系

// Product belongsTo Category (一个产品属于一个分类)
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Category hasMany Products (一个分类有多个产品)
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
});

// Order belongsTo Product (一个订单关联一个产品)
Order.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

// Product hasMany Orders (一个产品可以有多个订单)
Product.hasMany(Order, {
  foreignKey: 'product_id',
  as: 'orders',
});

// 导出所有模型
export {
  Category,
  Product,
  Order,
  Merchant,
  Config,
};

// 导出模型属性接口
export { CategoryAttributes, CategoryCreationAttributes } from './Category';
export { ProductAttributes, ProductCreationAttributes } from './Product';
export { OrderAttributes, OrderCreationAttributes, OrderStatus } from './Order';
export { MerchantAttributes, MerchantCreationAttributes } from './Merchant';
export { ConfigAttributes, ConfigCreationAttributes } from './Config';

// 默认导出所有模型
export default {
  Category,
  Product,
  Order,
  Merchant,
  Config,
};
