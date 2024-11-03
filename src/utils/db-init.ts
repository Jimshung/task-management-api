import dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';

dotenv.config();

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}
       CHARACTER SET ${process.env.DB_CHARSET}
       COLLATE ${process.env.DB_COLLATION}`,
    );
    console.log(`數據庫 ${process.env.DB_DATABASE} 創建成功`);
  } catch (error) {
    console.error('創建數據庫失敗:', error);
    throw error;
  } finally {
    await connection.end();
  }
}
