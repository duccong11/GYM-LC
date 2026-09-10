import type { Request, Response } from 'express';
import { transaction } from '../models/database.model.ts';
import { snapshot } from '../models/gym.model.ts';
import { authorize } from '../middleware/auth.middleware.ts';
import { permissions } from '../utils/security.ts';
import { fail } from '../utils/validation.ts';
import { mutateGym } from './gym.controller.ts';
export const resourceNames = {
  members: 'member',
  plans: 'plan',
  payments: 'payment',
  checkins: 'checkin',
  trainers: 'trainer',
  users: 'user',
  rooms: 'room',
  equipment: 'equipment',
} as const;
export function readResource(name: keyof typeof resourceNames) {
  return async (req: Request, res: Response) => {
    const data = await transaction(async (db) => {
      const user = await authorize(db, req);
      if (!permissions[user.role].includes(name))
        fail('Bạn không có quyền truy cập.', 403);
      return (await snapshot(db, user))[name];
    });
    if (req.params.id) {
      const row = data.find((x: any) => x.id === req.params.id);
      if (!row) fail('Không tìm thấy bản ghi.', 404);
      return res.json(row);
    }
    res.json(data);
  };
}
export function writeResource(action: string) {
  return async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
      fail('Dữ liệu không hợp lệ.');
    req.body = {
      ...req.body,
      action,
      ...(req.params.id ? { id: req.params.id } : {}),
    };
    return mutateGym(req, res);
  };
}
