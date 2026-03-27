"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.Merchant = exports.Order = exports.Product = exports.Category = void 0;
// 导入所有模型
const Category_1 = __importDefault(require("./Category"));
exports.Category = Category_1.default;
const Product_1 = __importDefault(require("./Product"));
exports.Product = Product_1.default;
const Order_1 = __importDefault(require("./Order"));
exports.Order = Order_1.default;
const Merchant_1 = __importDefault(require("./Merchant"));
exports.Merchant = Merchant_1.default;
const Config_1 = __importDefault(require("./Config"));
exports.Config = Config_1.default;
// 定义模型关联关系
// Product belongsTo Category (一个产品属于一个分类)
Product_1.default.belongsTo(Category_1.default, {
    foreignKey: 'category_id',
    as: 'category',
});
// Category hasMany Products (一个分类有多个产品)
Category_1.default.hasMany(Product_1.default, {
    foreignKey: 'category_id',
    as: 'products',
});
// Order belongsTo Product (一个订单关联一个产品)
Order_1.default.belongsTo(Product_1.default, {
    foreignKey: 'product_id',
    as: 'product',
});
// Product hasMany Orders (一个产品可以有多个订单)
Product_1.default.hasMany(Order_1.default, {
    foreignKey: 'product_id',
    as: 'orders',
});
// 默认导出所有模型
exports.default = {
    Category: Category_1.default,
    Product: Product_1.default,
    Order: Order_1.default,
    Merchant: Merchant_1.default,
    Config: Config_1.default,
};
//# sourceMappingURL=index.js.map