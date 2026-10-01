import type { Database } from './database.model.ts';

export async function recordAudit(db: Database, actorId: string, action: unknown, entityId: string) {
  await db.prepare(
    'INSERT INTO audit_logs(id,actor_id,action,entity_id,created_at) VALUES(?,?,?,?,?)',
  ).bind(crypto.randomUUID(), actorId, action, entityId, new Date().toISOString()).run();
}
