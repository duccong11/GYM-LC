import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({
  path: fileURLToPath(
    new URL(
      process.env.GYM_TEST_MODE === '1' ? '../../.env.test' : '../../.env',
      import.meta.url,
    ),
  ),
  quiet: true,
});
export const config = {
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 4000),
  origins: (
    process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000'
  ).split(','),
  production: process.env.NODE_ENV === 'production',
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || (process.env.GYM_TEST_MODE === '1' ? 'quan_ly_phong_gym_test' : 'quan_ly_phong_gym'),
  },
};
if (!/^[a-zA-Z0-9_]+$/.test(config.database.database))
  throw new Error('DB_NAME chỉ gồm chữ, số và dấu gạch dưới.');

if(process.env.GYM_TEST_MODE==='1'&&!/_(test|migration_check|sql_check)$/.test(config.database.database))throw new Error('Chế độ kiểm thử không được dùng database chính.');
