import { TodoAppApplication } from './application';

export async function migrate(args: string[]) {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';
  console.log('Migrating schemas (%s existing schema)', existingSchema);

  const app = new TodoAppApplication();
  await app.boot();
  await app.migrateSchema({ existingSchema });

  // 關閉應用程序
  await app.stop();
}

migrate(process.argv).catch(err => {
  console.error('Cannot migrate database schema', err);
  process.exit(1);
});
