import type { Request } from 'express';
import { config } from '../config/env.ts';
import { fail } from '../utils/validation.ts';
import { findSession } from '../models/session.model.ts';
import type { Database } from '../models/database.model.ts';
export function sameOrigin(req: Request) {
  if (!config.origins.includes(req.get('origin') || ''))
    fail('Nguồn yêu cầu không hợp lệ.', 403);
}
export async function authorize(db: Database, req: Request, write = false) {
  const user = await findSession(db, req.get('cookie'));
  if (!user) fail('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401);
  if (write) {
    sameOrigin(req);
    if (req.get('x-csrf-token') !== user!.csrf)
      fail('Mã bảo vệ phiên không hợp lệ.', 403);
  }
  return user!;
}
export const sessionCookie = (value: string, maxAge = 28800) =>
  'gym_session=' +
  value +
  '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' +
  maxAge +
  (config.production ? '; Secure' : '');
