import { migrateWorkflows } from '../src/models/migration.model.ts';
import { pool } from '../src/config/database.ts';
try {
  await migrateWorkflows();
  console.log('Migration actor/workflows hoàn tất.');
} finally {
  await pool.end();
}
