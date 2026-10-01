import { DatabaseSync } from 'node:sqlite';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { transaction } from '../src/models/database.model.ts';
import { pool } from '../src/config/database.ts';
const input = process.argv[2];
if (!input || !existsSync(input))
  throw new Error(
    'Cách dùng: node backend/scripts/import-sqlite.ts <file.sqlite>. Chỉ nhập vào MySQL rỗng.',
  );
const sqlite = new DatabaseSync(resolve(input), { readOnly: true });
try {
  const counts = await transaction(async (db) => {
    const tables = [
      'accounts',
      'members',
      'plans',
      'trainers',
      'rooms',
      'equipment',
      'payments',
      'checkins',
    ];
    for (const t of tables) {
      const count = await db
        .prepare('SELECT COUNT(*) AS n FROM ' + t)
        .first<{ n: number }>();
      if (count!.n)
        throw new Error(
          'MySQL đã có dữ liệu ở ' +
            t +
            '. Dừng để tránh ghi đè; dùng database mới.',
        );
    }
    const result: Record<string, number> = {};
    for (const table of tables) {
      const rows = sqlite.prepare('SELECT * FROM ' + table).all() as Record<
        string,
        unknown
      >[];
      for (const row of rows) {
        if (row.birth_date === '') row.birth_date = null;
        if (row.requested_start === '') row.requested_start = null;
        if (table === 'checkins') {
          row.legacy_closed = row.checkout_at === 'legacy' ? 1 : 0;
          if (row.checkout_at === 'legacy') row.checkout_at = null;
        }
        const keys = Object.keys(row);
        await db
          .prepare(
            'INSERT INTO ' +
              table +
              '(' +
              keys.map((k) => '`' + k + '`').join(',') +
              ') VALUES(' +
              keys.map(() => '?').join(',') +
              ')',
          )
          .bind(...Object.values(row))
          .run();
      }
      result[table] = rows.length;
    }
    return result;
  }, true);
  mkdirSync('outputs', { recursive: true });
  writeFileSync(
    'outputs/mysql-import-result.json',
    JSON.stringify({ at: new Date().toISOString(), counts }, null, 2),
  );
  console.log('Nhập thành công, giữ nguyên ID và dữ liệu:', counts);
} finally {
  sqlite.close();
  await pool.end();
}
