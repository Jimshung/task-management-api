import dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';

dotenv.config();

async function initializeDatabase(): Promise<void> {
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
    console.log(`資料庫 ${process.env.DB_DATABASE} 創建成功`);
  } catch (error) {
    console.error('創建資料庫失敗:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initializeDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('初始化資料庫時發生錯誤:', error);
    process.exit(1);
  });
