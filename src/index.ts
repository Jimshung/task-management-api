import dotenv from 'dotenv';
dotenv.config();

import { ApplicationConfig, TodoAppApplication } from './application';

export * from './application';

export async function main(
  options: ApplicationConfig = {},
): Promise<TodoAppApplication> {
  const app = new TodoAppApplication(options);
  await app.boot();
  await app.start();
  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
      gracePeriodForClose: 5000,
      openApiSpec: {
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
