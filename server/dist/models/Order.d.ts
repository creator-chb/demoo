import { Model, Optional } from 'sequelize';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export interface OrderAttributes {
    id: number;
    order_no: string;
    user_openid: string;
    product_id: number;
    table_id: string;
    status: OrderStatus;
    created_at?: Date;
    updated_at?: Date;
}
export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {
}
declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    id: number;
    order_no: string;
    user_openid: string;
    product_id: number;
    table_id: string;
    status: OrderStatus;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Order;
//# sourceMappingURL=Order.d.ts.map