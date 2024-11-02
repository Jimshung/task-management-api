import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as dotenv from 'dotenv';
import { DataSourceConfig } from '../types/database.types';

dotenv.config();

const config = {
  name: 'mysql',
  connector: 'mysql' as 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'test',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  collation: process.env.DB_COLLATION || 'utf8mb4_general_ci',
  timezone: process.env.DB_TIMEZONE || '+08:00',
};

@lifeCycleObserver('datasource')
export class MysqlDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'mysql';

  constructor(
    @inject('datasources.config.mysql', { optional: true })
    dsConfig: DataSourceConfig = config,
  ) {
    super(dsConfig);
  }

  /**
   * 啟動時的生命週期鉤子
   */
  async start(): Promise<void> {
    try {
      await this.ping();
      console.log('數據庫連接成功');
    } catch (error) {
      console.error('數據庫連接失敗:', error);
      // 重試邏輯
      await this.handleConnectionError(error);
    }
  }

  /**
   * 停止時的生命週期鉤子
   */
  async stop(): Promise<void> {
    try {
      await this.disconnect();
      console.log('數據庫連接已關閉');
    } catch (error) {
      console.error('關閉數據庫連接時出錯:', error);
      throw error;
    }
  }

  private async handleConnectionError(error: Error): Promise<void> {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
        await this.ping();
        console.log('數據庫重新連接成功');
        return;
      } catch (retryError) {
        retries++;
        console.error(`重試失敗 (${retries}/${maxRetries}):`, retryError);
      }
    }
    throw new Error('數據庫連接重試次數已達上限');
  }
}
