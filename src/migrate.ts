import { TodoAppApplication } from './application';

export async function migrate(args: string[]) {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';
  console.log('開始遷移數據庫架構...');
  console.log('遷移模式:', existingSchema);

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
    });

    console.log('數據庫遷移完成');
  } catch (err) {
    console.error('遷移過程中發生錯誤:', err);
    throw err;
  } finally {
    await app.stop();
  }
}

migrate(process.argv).catch(err => {
  console.error('無法遷移數據庫架構', err);
  process.exit(1);
});
