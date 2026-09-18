import { readFileSync } from 'node:fs';
import { pool } from '../config/database.ts';
export async function migrateWorkflows() {
  const c = await pool.getConnection();
  try {
    const [lock]: any = await c.query(
      "SELECT GET_LOCK(CONCAT(DATABASE(), ':gym-migration'),30) AS acquired",
    );
    if (lock[0].acquired !== 1)
      throw new Error('Không lấy được khóa migration');
    try {
      const add = async (table: string, column: string, definition: string) => {
        const [r]: any = await c.query(
          'SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?',
          [table, column],
        );
        if (!r.length)
          await c.query(
            'ALTER TABLE ' + table + ' ADD COLUMN ' + column + ' ' + definition,
          );
      };
      await add(
        'accounts',
        'member_id',
        'VARCHAR(80) NULL UNIQUE REFERENCES members(id)',
      );
      await add(
        'accounts',
        'trainer_id',
        'VARCHAR(80) NULL UNIQUE REFERENCES trainers(id)',
      );
      await add('payments', 'cancellation_reason', 'VARCHAR(500) NULL');
      await c.query(
        'ALTER TABLE login_attempts MODIFY username VARCHAR(100) NOT NULL',
      );
      await add('payments', 'cancelled', 'TINYINT NOT NULL DEFAULT 0');
      await add('payments', 'registration_id', 'VARCHAR(80) NULL');
      const sql = readFileSync(
        new URL('../../sql/03_actor_workflows.sql', import.meta.url),
        'utf8',
      );
      for (const statement of sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean))
        await c.query(statement);
      await c.query(
        "INSERT IGNORE INTO registrations(id,member_id,plan_id,plan_name,price,start_date,end_date,status,created_at) SELECT id,member_id,plan_id,plan_name,amount,start_date,end_date,'ACTIVE',created_at FROM payments WHERE registration_id IS NULL AND cancelled=0",
      );
      await c.query(
        'UPDATE payments SET registration_id=id WHERE registration_id IS NULL',
      );
      for (const table of ['accounts', 'members', 'trainers'])
        await c.query(
          'ALTER TABLE ' +
            table +
            ' MODIFY name VARCHAR(100) NOT NULL, MODIFY phone VARCHAR(11) NOT NULL',
        );
      await c.query('ALTER TABLE plans MODIFY name VARCHAR(100) NOT NULL');
      for (const table of ['payments', 'registrations'])
        await c.query(
          'ALTER TABLE ' + table + ' MODIFY plan_name VARCHAR(100) NOT NULL',
        );
      const [checks]: any = await c.query(
        "SELECT constraint_name,check_clause FROM information_schema.check_constraints WHERE constraint_schema=DATABASE() AND constraint_name IN ('plans_price_check','payments_amount_check')",
      );
      for (const check of checks) {
        const table =
            check.CONSTRAINT_NAME === 'plans_price_check'
              ? 'plans'
              : 'payments',
          col = table === 'plans' ? 'price' : 'amount',
          min = table === 'plans' ? 0 : 1;
        if (!String(check.CHECK_CLAUSE).includes('between ' + min + ' and'))
          await c.query(
            'ALTER TABLE ' +
              table +
              ' DROP CHECK ' +
              check.CONSTRAINT_NAME +
              ', ADD CONSTRAINT ' +
              check.CONSTRAINT_NAME +
              ' CHECK (' +
              col +
              ' BETWEEN ' +
              min +
              ' AND 100000000)',
          );
      }
      for (const [table, prefix] of Object.entries({
        members: 'HV',
        plans: 'GT',
        trainers: 'HLV',
        registrations: 'DK',
        payments: 'TT',
        schedules: 'LT',
      })) {
        await add(table, 'code', 'VARCHAR(20) NULL UNIQUE');
        await c.query(
          'UPDATE ' +
            table +
            ' SET code=CONCAT(?,UPPER(LEFT(SHA2(id,256),16))) WHERE code IS NULL',
          [prefix],
        );
      }
      const constraints = [
        [
          'accounts',
          'accounts_member_link_fk',
          'FOREIGN KEY(member_id) REFERENCES members(id)',
        ],
        [
          'accounts',
          'accounts_trainer_link_fk',
          'FOREIGN KEY(trainer_id) REFERENCES trainers(id)',
        ],
        [
          'payments',
          'payments_registration_fk',
          'FOREIGN KEY(registration_id) REFERENCES registrations(id)',
        ],
      ];
      for (const [table, name, definition] of constraints) {
        const [found]: any = await c.query(
          'SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema=DATABASE() AND table_name=? AND constraint_name=?',
          [table, name],
        );
        if (!found.length)
          await c.query(
            'ALTER TABLE ' +
              table +
              ' ADD CONSTRAINT ' +
              name +
              ' ' +
              definition,
          );
      }
    } finally {
      await c.query(
        "SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':gym-migration'))",
      );
    }
  } finally {
    c.release();
  }
}
