import { Model, Optional } from 'sequelize';
export interface ConfigAttributes {
    id: number;
    config_key: string;
    config_value: string | null;
    description: string | null;
    updated_at?: Date;
}
export interface ConfigCreationAttributes extends Optional<ConfigAttributes, 'id' | 'config_value' | 'description' | 'updated_at'> {
}
declare class Config extends Model<ConfigAttributes, ConfigCreationAttributes> implements ConfigAttributes {
    id: number;
    config_key: string;
    config_value: string | null;
    description: string | null;
    readonly updated_at: Date;
}
export default Config;
//# sourceMappingURL=Config.d.ts.map