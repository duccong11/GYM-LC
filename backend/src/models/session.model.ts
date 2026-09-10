import { digest } from '../utils/security.ts';
import type { User } from '../utils/security.ts';
import type { Database } from './database.model.ts';
export type SessionUser = User & { csrf: string; session_id: string };
export async function findSession(db: Database, cookie: string = '') {
  const token = cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('gym_session='))
    ?.slice(12);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return db
    .prepare(
      'SELECT a.id,a.name,a.username,a.role,a.phone,a.email,a.position,a.active,s.csrf,s.id AS session_id FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.id=? AND s.expires_at>? AND a.active=1',
    )
    .bind(await digest(token), new Date().toISOString())
    .first<SessionUser>();
}
