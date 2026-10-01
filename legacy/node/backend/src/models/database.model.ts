import type {
  PoolConnection,
  RowDataPacket,
  ResultSetHeader,
} from 'mysql2/promise';
import { pool } from '../config/database.ts';
// Model gateway: parameterized MySQL statements on one transaction connection.
export class Statement {
  private db: Database;
  private sql: string;
  private values: unknown[];
  constructor(db: Database, sql: string, values: unknown[] = []) {
    this.db = db;
    this.sql = sql;
    this.values = values.map(normalizeValue);
  }
  bind(...values: unknown[]) {
    return new Statement(this.db, this.sql, values);
  }
  async all<T = Record<string, unknown>>() {
    return { results: await this.db.rows<T>(this.sql, this.values as any[]) };
  }
  async first<T = Record<string, unknown>>() {
    return (await this.all<T>()).results[0] ?? null;
  }
  async run() {
    const [result] = await this.db.connection.execute<ResultSetHeader>(
      this.sql,
      this.values as any[],
    );
    return { meta: { changes: result.affectedRows } };
  }
}
export class Database {
  public connection: PoolConnection;
  constructor(connection: PoolConnection) {
    this.connection = connection;
  }
  prepare(sql: string) {
    return new Statement(
      this,
      sql.replace(/(?<!`)\bcondition\b(?!`)/g, '`condition`'),
    );
  }
  async rows<T>(sql: string, values: unknown[] = []): Promise<T[]> {
    const [rows] = await this.connection.execute<RowDataPacket[]>(
      sql,
      values.map(normalizeValue) as any[],
    );
    return rows.map(normalizeRow) as T[];
  }
  async batch(statements: Statement[]) {
    const out = [];
    for (const s of statements) out.push(await s.run());
    return out;
  }
}
export async function transaction<T>(
  work: (db: Database) => Promise<T>,
  write = false,
): Promise<T> {
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const db = new Database(c);
    // One application write lock serializes cross-table invariants for this small gym.
    if (write)
      await c.query('SELECT id FROM mutation_lock WHERE id=1 FOR UPDATE');
    const result = await work(db);
    await c.commit();
    return result;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}

function normalizeValue(v: unknown) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)
    ? new Date(v).toISOString().replace('T', ' ').replace('Z', '')
    : v;
}
function normalizeRow(row: any) {
  for (const key of ['created_at', 'checkout_at', 'expires_at', 'reset_at'])
    if (row[key] && /^\d{4}-\d{2}-\d{2} /.test(row[key]))
      row[key] = row[key].replace(' ', 'T') + 'Z';
  if (row.legacy_closed) row.checkout_at = 'legacy';
  for (const key of ['birth_date', 'requested_start'])
    if (key in row && row[key] === null) row[key] = '';
  return row;
}
