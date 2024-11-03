import dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';
import { TodoAppApplication } from '..';
import { MysqlDataSource } from '../datasources';
import { DataSourceConfig } from '../types/database.types';

dotenv.config();

export async function initializeTestDatabase(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'wewe9073',
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS todo_db_test
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`,
    );
    console.log('測試資料庫創建成功');

    const app = new TodoAppApplication();

    const testConfig: DataSourceConfig = {
      name: 'mysql',
      connector: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? '3306'),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'wewe9073',
      database: process.env.DB_DATABASE ?? 'todo_db_test',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
    };

    app.bind('datasources.config.mysql').to(testConfig);

    await app.boot();

    const dataSource = await app.get<MysqlDataSource>('datasources.mysql');
    await dataSource.automigrate();
    console.log('資料庫表格創建成功');

    await app.stop();
  } catch (error) {
    console.error('初始化測試資料庫失敗:', error);
    throw error;
  } finally {
    await connection.end();
  }
}
