import { Model, Optional } from 'sequelize';
export interface CategoryAttributes {
    id: number;
    name: string;
    sort_order: number;
    status: number;
    created_at?: Date;
    updated_at?: Date;
}
export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'sort_order' | 'status' | 'created_at' | 'updated_at'> {
}
declare class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    id: number;
    name: string;
    sort_order: number;
    status: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default Category;
//# sourceMappingURL=Category.d.ts.map