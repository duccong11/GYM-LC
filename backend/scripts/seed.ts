import { transaction } from '../src/models/database.model.ts';
import { pool } from '../src/config/database.ts';
import { migrateWorkflows } from '../src/models/migration.model.ts';
import { seedDemo } from './demo-data.ts';
try {
  await migrateWorkflows();
  console.log(await transaction((db) => seedDemo(db), true));
  for (let i = 0; i < 5; i++)
    await pool.execute(
      "UPDATE accounts SET trainer_id=? WHERE id=? AND role='TRAINER' AND trainer_id IS NULL",
      ['demo-v2-trainer-' + i, 'demo-v2-coach-user-' + i],
    );
  await migrateWorkflows();
} finally {
  await pool.end();
}
