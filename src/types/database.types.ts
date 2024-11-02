import { AnyObject } from '@loopback/repository';

export interface DatabaseColumn {
  Field: string;
  Type: string;
  Null: 'YES' | 'NO';
  Key: 'PRI' | 'MUL' | '';
  Default: string | null;
  Extra: string;
}

export interface TableInfo {
  TABLE_NAME: string;
  TABLE_SCHEMA: string;
}

export interface DataSourceConfig {
  name: string;
  connector: 'mysql';
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  [key: string]: AnyObject | undefined | string | number | boolean;
}
