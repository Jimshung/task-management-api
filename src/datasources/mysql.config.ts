import { DataSourceConfig } from '../types/database.types';

export const config: DataSourceConfig = {
  name: 'mysql',
  connector: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  // 連接池配置
  pool: {
    max: 10, // 最大連接數
    min: 2, // 最小連接數
    idleTimeoutMillis: 30000, // 空閒超時
    acquireTimeoutMillis: 30000, // 獲取連接超時
    createTimeoutMillis: 30000, // 創建連接超時
    destroyTimeoutMillis: 5000, // 銷毀連接超時
    reapIntervalMillis: 1000, // 清理間隔
    createRetryIntervalMillis: 200, // 創建重試間隔
  },
  // 其他高級配置
  timezone: process.env.DB_TIMEZONE,
  charset: process.env.DB_CHARSET,
  collation: process.env.DB_COLLATION,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true,
  debug: process.env.NODE_ENV === 'development',
};
