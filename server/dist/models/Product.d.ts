import { Model, Optional } from 'sequelize';
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
export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'description' | 'image_url' | 'images' | 'status' | 'sort_order' | 'created_at' | 'updated_at'> {
}
declare class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    images: string[] | null;
    status: number;
    sort_order: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Product;
//# sourceMappingURL=Product.d.ts.map