import { Model, Optional } from 'sequelize';
export interface MerchantAttributes {
    id: number;
    username: string;
    password: string;
    name: string | null;
    created_at?: Date;
}
export interface MerchantCreationAttributes extends Optional<MerchantAttributes, 'id' | 'name' | 'created_at'> {
}
declare class Merchant extends Model<MerchantAttributes, MerchantCreationAttributes> implements MerchantAttributes {
    id: number;
    username: string;
    password: string;
    name: string | null;
    readonly created_at: Date;
}
export default Merchant;
//# sourceMappingURL=Merchant.d.ts.map