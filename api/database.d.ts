import mysql from 'mysql2/promise';
export declare function initializeDatabase(): Promise<void>;
export declare function getConnection(): Promise<mysql.PoolConnection>;
export declare function query<T = any>(sql: string, values?: any[]): Promise<T[]>;
export declare function execute(sql: string, values?: any[]): Promise<mysql.QueryResult>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=database.d.ts.map