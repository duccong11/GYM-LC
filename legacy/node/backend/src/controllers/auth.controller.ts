import type { Request, Response } from 'express';
import { transaction } from '../models/database.model.ts';
import { findSession } from '../models/session.model.ts';
import {
  authorize,
  sameOrigin,
  sessionCookie,
} from '../middleware/auth.middleware.ts';
import { fail } from '../utils/validation.ts';
import { loginAccount, registerMember } from '../services/auth.service.ts';
export async function getAuth(req: Request, res: Response) {
  const user = await transaction((db) => findSession(db, req.get('cookie')));
  if (!user) return res.status(401).json({ error: 'Chưa đăng nhập.' });
  return res.json({ user, csrf: user.csrf });
}
export async function postAuth(req: Request, res: Response) {
  sameOrigin(req);
  if (!req.is('application/json')) fail('Yêu cầu phải là JSON.', 415);
  const b = req.body;
  if (!b || typeof b !== 'object' || Array.isArray(b))
    fail('Dữ liệu không hợp lệ.');
  if (b.action === 'logout') {
    await transaction(async (db) => {
      const u = await authorize(db, req, true);
      await db
        .prepare('DELETE FROM sessions WHERE id=?')
        .bind(u.session_id)
        .run();
    }, true);
    return res.set('Set-Cookie', sessionCookie('', 0)).json({ ok: true });
  }
  if (b.action === 'register') {
    await registerMember(b);
    return res
      .status(201)
      .json({ ok: true, message: 'Đăng ký thành công. Vui lòng đăng nhập.' });
  }
  if (b.action !== 'login') fail('Thao tác không hợp lệ.');
  const result = await loginAccount(b, req.get('cookie'));
  res
    .set('Set-Cookie', sessionCookie(result.token))
    .json({ ok: true, csrf: result.csrf, user: result.user });
}
