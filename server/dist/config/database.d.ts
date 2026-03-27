import { Sequelize } from 'sequelize';
export declare const sequelize: Sequelize;
export declare const syncDatabase: (force?: boolean) => Promise<void>;
export declare const testConnection: () => Promise<boolean>;
export default sequelize;
//# sourceMappingURL=database.d.ts.map