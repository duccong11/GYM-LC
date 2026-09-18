import type { Request, Response } from 'express';
import { transaction } from '../models/database.model.ts';
import { findSession } from '../models/session.model.ts';
import {
  authorize,
  sameOrigin,
  sessionCookie,
} from '../middleware/auth.middleware.ts';
import {
  digest,
  randomToken,
  verifyPassword,
  hashPassword,
  type User,
} from '../utils/security.ts';
import {
  fail,
  stringField,
  contact,
  validatePassword,
} from '../utils/validation.ts';
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
    const c = contact(b),
      username = stringField(
        b,
        'username',
        'Tên đăng nhập',
        5,
        30,
      ).toLowerCase();
    if (!/^[a-z0-9_]+$/.test(username))
      fail('Tên đăng nhập chỉ gồm chữ, số và gạch dưới.');
    if (!c.email) fail('Email không được để trống.');
    const password = validatePassword(b.password);
    if (password !== b.confirm_password) fail('Xác nhận mật khẩu không khớp.');
    if (b.role !== undefined && b.role !== 'MEMBER')
      fail('Đăng ký công khai chỉ dành cho hội viên.', 403);
    const hash = await hashPassword(password);
    await transaction(async (db) => {
      if (
        await db
          .prepare('SELECT id FROM accounts WHERE username=? OR email=?')
          .bind(username, c.email)
          .first()
      )
        fail('Tên đăng nhập hoặc email đã tồn tại.', 409);
      if (
        await db
          .prepare('SELECT id FROM members WHERE phone=? OR email=?')
          .bind(c.phone, c.email)
          .first()
      )
        fail(
          'Hồ sơ hội viên đã tồn tại. Liên hệ nhân viên để liên kết tài khoản.',
          409,
        );
      const aid = crypto.randomUUID(),
        mid = crypto.randomUUID(),
        now = new Date().toISOString();
      await db
        .prepare(
          "INSERT INTO members(id,name,phone,email,gender,created_at) VALUES(?,?,?,?,'Khác',?)",
        )
        .bind(mid, c.name, c.phone, c.email, now)
        .run();
      await db
        .prepare('UPDATE members SET code=? WHERE id=?')
        .bind('HV' + mid.replaceAll('-', '').slice(0, 16).toUpperCase(), mid)
        .run();
      await db
        .prepare(
          "INSERT INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at,member_id) VALUES(?,?,?,?,?,?,'Hội viên','MEMBER',1,?,?)",
        )
        .bind(aid, c.name, username, hash, c.phone, c.email, now, mid)
        .run();
    }, true);
    return res
      .status(201)
      .json({ ok: true, message: 'Đăng ký thành công. Vui lòng đăng nhập.' });
  }
  if (b.action !== 'login') fail('Thao tác không hợp lệ.');
  const username = stringField(
    b,
    'username',
    'Tên đăng nhập',
    1,
    100,
  ).toLowerCase();
  if (
    typeof b.password !== 'string' ||
    !b.password.trim() ||
    b.password.length > 128
  )
    fail('Mật khẩu không được trống và tối đa 128 ký tự.');
  // Failed attempts must commit even when login is rejected.
  const attempts = await transaction(async (db) => {
    const now = new Date().toISOString(),
      reset = new Date(Date.now() + 900000).toISOString();
    await db
      .prepare(
        'INSERT INTO login_attempts(username,attempts,reset_at) VALUES(?,1,?) ON DUPLICATE KEY UPDATE attempts=IF(reset_at<=?,1,attempts+1),reset_at=IF(reset_at<=?,?,reset_at)',
      )
      .bind(username, reset, now, now, reset)
      .run();
    return (await db
      .prepare('SELECT attempts FROM login_attempts WHERE username=?')
      .bind(username)
      .first<{ attempts: number }>())!.attempts;
  }, true);
  if (attempts > 5)
    fail('Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.', 429);
  const result = await transaction(async (db) => {
    const a = await db
      .prepare('SELECT * FROM accounts WHERE username=? OR email=?')
      .bind(username, username)
      .first<User & { password_hash: string }>();
    const hash =
      a?.password_hash ||
      (await hashPassword('dummy-password-value', 'dummy-salt-for-timing'));
    if (!(await verifyPassword(b.password, hash)) || !a?.active)
      fail(
        'Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.',
        401,
      );
    const token = randomToken(),
      csrf = randomToken(),
      old = await findSession(db, req.get('cookie'));
    await db
      .prepare('DELETE FROM login_attempts WHERE username=?')
      .bind(username)
      .run();
    await db
      .prepare('DELETE FROM sessions WHERE expires_at<=?')
      .bind(new Date().toISOString())
      .run();
    if (old)
      await db
        .prepare('DELETE FROM sessions WHERE id=?')
        .bind(old.session_id)
        .run();
    await db
      .prepare(
        'INSERT INTO sessions(id,account_id,csrf,expires_at) VALUES(?,?,?,?)',
      )
      .bind(
        await digest(token),
        a!.id,
        csrf,
        new Date(Date.now() + 28800000).toISOString(),
      )
      .run();
    return {
      token,
      csrf,
      user: { id: a!.id, name: a!.name, username: a!.username, role: a!.role },
    };
  }, true);
  res
    .set('Set-Cookie', sessionCookie(result.token))
    .json({ ok: true, csrf: result.csrf, user: result.user });
}
