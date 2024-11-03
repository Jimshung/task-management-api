import { DataSourceConfig } from '../types/database.types';

export const config: DataSourceConfig = {
  name: process.env.DB_NAME ?? 'todo_app',
  connector: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '3306'),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE ?? '',
  // 連接池配置
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  // 事務配置
  transactionOptions: {
    isolationLevel: 'READ COMMITTED', // 明確指定隔離級別
    timeout: 15000,
  },
  // 其他配置
  timezone: process.env.DB_TIMEZONE,
  charset: process.env.DB_CHARSET,
  collation: process.env.DB_COLLATION,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  debug: process.env.NODE_ENV === 'development',
  supportForeignKeys: true,
};
