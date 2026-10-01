import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { config } from '../src/config/env.ts';
const { database, ...credentials } = config.database;
const c = await mysql.createConnection({
  ...credentials,
  multipleStatements: true,
});
try {
  await c.query(
    'CREATE DATABASE IF NOT EXISTS `' +
      database +
      '` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
  );
  await c.changeUser({ database });
  await c.query(
    readFileSync(new URL('../sql/01_schema.sql', import.meta.url), 'utf8'),
  );
  console.log('Schema MySQL sẵn sàng:', database);
} finally {
  await c.end();
}
