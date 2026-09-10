import { transaction } from '../src/models/database.model.ts';
import { pool } from '../src/config/database.ts';
import { seedDemo } from './demo-data.ts';
try {
  console.log(await transaction((db) => seedDemo(db), true));
} finally {
  await pool.end();
}
