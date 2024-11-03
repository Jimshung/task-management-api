import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import * as dotenv from 'dotenv';
import { TodoAppApplication } from '../..';
import { DataSourceConfig } from '../../types/database.types';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

export async function setupApplication(
  options: {
    enableLogging?: boolean;
  } = {},
): Promise<AppWithClient> {
  const app = new TodoAppApplication({
    rest: givenHttpServerConfig(),
  });

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
    createDatabase: true,
    synchronize: true,
    migrateDatabase: true,
    debug: options.enableLogging ?? process.env.DEBUG_SQL === 'true',
    logger: options.enableLogging ?? process.env.DEBUG_SQL === 'true',
  };

  app.bind('datasources.config.mysql').to(testConfig);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);
  return { app, client };
}

export interface AppWithClient {
  app: TodoAppApplication;
  client: Client;
}
