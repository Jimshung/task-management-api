import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  name: 'mysql',
  url: '',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ?? 3306,
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'todo_db',
  driver: 'mysql2',
  connectTimeout: 30000,
  acquireTimeout: 30000,
  connectionLimit: 10,
  charset: process.env.DB_CHARSET ?? 'utf8mb4',
  collation: process.env.DB_COLLATION ?? 'utf8mb4_unicode_ci',
  timezone: process.env.DB_TIMEZONE ?? '+08:00',
  connector: 'loopback-connector-mysql',
  createDatabase: true,
  insecureAuth: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: true
};
