import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { config } from './mysql.config';

@lifeCycleObserver('datasource')
export class MysqlDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  public static dataSourceName = 'mysql';
  public static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mysql', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  public async start(): Promise<void> {
    await this.connect();
  }

  public async stop(): Promise<void> {
    await this.disconnect();
  }
}
