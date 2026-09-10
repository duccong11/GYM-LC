import type { Request, Response } from 'express';
import { transaction } from '../models/database.model.ts';
import { snapshot } from '../models/gym.model.ts';
import { authorize } from '../middleware/auth.middleware.ts';
import { act } from '../services/gym.service.ts';
import { fail } from '../utils/validation.ts';
export async function getGym(req: Request, res: Response) {
  const result = await transaction(async (db) => {
    const user = await authorize(db, req);
    return { ...(await snapshot(db, user)), user, csrf: user.csrf };
  });
  res.json(result);
}
export async function mutateGym(req: Request, res: Response) {
  if (!req.is('application/json')) fail('Yêu cầu phải là JSON.', 415);
  if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object')
    fail('Dữ liệu không hợp lệ.');
  const result = await transaction(async (db) => {
    const user = await authorize(db, req, true);
    const result = await act(db, req.body, user);
    await db
      .prepare(
        'INSERT INTO audit_logs(id,actor_id,action,entity_id,created_at) VALUES(?,?,?,?,?)',
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        req.body.action,
        String(result?.id || req.body.id || req.body.member_id || ''),
        new Date().toISOString(),
      )
      .run();
    return result;
  }, true);
  res.json(result);
}
