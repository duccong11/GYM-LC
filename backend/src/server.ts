import { app } from './app.ts';
import { pool } from './config/database.ts';
import { config } from './config/env.ts';
try {
  await pool.query('SELECT id FROM mutation_lock WHERE id=1');
  const server = app.listen(config.port, config.host, () =>
    console.log('GYM backend: http://' + config.host + ':' + config.port),
  );
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () =>
      server.close(() => {
        void pool.end().then(() => process.exit(0));
      }),
    );
} catch (e: any) {
  console.error(
    'Không kết nối được MySQL hoặc chưa tạo schema. Kiểm tra backend/.env và chạy pnpm db:setup. Mã:',
    e.code || e.name,
  );
  await pool.end();
  process.exitCode = 1;
}
