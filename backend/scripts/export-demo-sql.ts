import { writeFileSync } from 'node:fs';
import mysql from 'mysql2';
import { seedDemo } from './demo-data.ts';
import type { Database } from '../src/models/database.model.ts';
const statements: string[] = [];
const recorder = {
  prepare(sql: string) {
    return {
      bind(...values: unknown[]) {
        const normalized = values.map((v) =>
          typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)
            ? new Date(v).toISOString().replace('T', ' ').replace('Z', '')
            : v,
        );
        return {
          run() {
            statements.push(
              mysql.format(
                sql.replace(/\bcondition\b/g, '`condition`'),
                normalized as any[],
              ) + ';',
            );
          },
        };
      },
    };
  },
  async batch(items: any[]) {
    for (const item of items) item.run();
  },
};
await seedDemo(recorder as unknown as Database);
writeFileSync(
  new URL('../sql/02_demo_data.sql', import.meta.url),
  '-- OPTIONAL demo data, generated ' +
    new Date().toISOString() +
    '\n-- Password hashes are for documented DEMO accounts only.\n-- Run AFTER 01_schema.sql inside the selected database.\nSTART TRANSACTION;\n' +
    statements.join('\n') +
    '\nCOMMIT;\n',
);
