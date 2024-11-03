import { DataSource } from '@loopback/repository';
import { TodoAppApplication } from './application';

export async function migrate(args: string[]): Promise<void> {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';
  console.log('遷移資料庫架構（%s 存在的架構）', existingSchema);

  const app = new TodoAppApplication();

  try {
    await app.boot();
    console.log('應用啟動成功');

    await app.migrateSchema({
      existingSchema,
      models: ['Todo', 'Item'],
      foreignKeys: true,
      indexes: true,
      forceMigrate: true,
      validateForeignConstraints: true,
      alterations: true,
    });

    console.log('資料庫遷移完成');

    const dataSource = app.getSync('datasources.mysql') as DataSource;
    const result = await dataSource.execute(
      `SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = '${process.env.DB_DATABASE}'
        AND TABLE_NAME = 'item'`,
    );

    console.log('外鍵檢查結果:', result);

    if (!Array.isArray(result) || result.length === 0) {
      console.log('未檢測到外鍵，嘗試手動創建...');
      await dataSource.execute(`
        ALTER TABLE item
        ADD CONSTRAINT fk_item_todo
        FOREIGN KEY (todoId) REFERENCES todo(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      `);
      console.log('外鍵創建完成');
    }
  } catch (err) {
    console.error('遷移過程中發生錯誤:', err);
    throw err;
  } finally {
    await app.stop();
  }
}

migrate(process.argv).catch((err: Error) => {
  console.error('無法遷移資料庫架構', err);
  process.exit(1);
});
