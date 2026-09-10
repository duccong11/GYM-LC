import type { Database } from '../models/database.model.ts';
import {
  addDays,
  todayVN,
  validateMember,
  validatePlan,
  type Member,
  type Plan,
  type Payment,
} from '../utils/gym.ts';
import {
  AppError,
  fail,
  contact,
  dateField,
  integerField,
  registrationDates,
  stringField,
  validateEntity,
  validatePassword,
} from '../utils/validation.ts';
import { canMutate, hashPassword, type User } from '../utils/security.ts';
export async function act(
  db: Database,
  b: Record<string, unknown>,
  actor: User,
) {
  const action = stringField(b, 'action', 'Thao tác', 1, 50);
  if (!canMutate(actor.role, action))
    fail('Bạn không có quyền thực hiện thao tác này.', 403);
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    today = todayVN();
  if (action === 'member.save') {
    contact(b);
    const m = validateMember(b),
      birth = dateField(b.birth_date, 'Ngày sinh', false),
      address = stringField(b, 'address', 'Địa chỉ', 0, 250);
    if (birth && (birth > today || birth < '1900-01-01'))
      fail('Ngày sinh phải từ 1900 đến hôm nay.');
    if (b.id) {
      const r = await db
        .prepare(
          'UPDATE members SET name=?,phone=?,email=?,gender=?,birth_date=?,address=? WHERE id=? AND archived=0',
        )
        .bind(
          m.name,
          m.phone,
          m.email,
          m.gender,
          birth || null,
          address,
          String(b.id),
        )
        .run();
      if (!r.meta.changes) fail('Không tìm thấy hội viên đang quản lý.', 404);
    } else
      await db
        .prepare(
          'INSERT INTO members(id,name,phone,email,gender,created_at,birth_date,address) VALUES(?,?,?,?,?,?,?,?)',
        )
        .bind(
          id,
          m.name,
          m.phone,
          m.email,
          m.gender,
          now,
          birth || null,
          address,
        )
        .run();
    return { ok: true, id: b.id || id };
  }
  if (action === 'member.archive' || action === 'member.delete') {
    const r = await db
      .prepare('UPDATE members SET archived=? WHERE id=?')
      .bind(b.archived === false ? 0 : 1, String(b.id))
      .run();
    if (!r.meta.changes) fail('Không tìm thấy hội viên.', 404);
    return { ok: true };
  }
  if (action === 'plan.save') {
    stringField(b, 'name', 'Tên gói', 2, 60);
    stringField(b, 'description', 'Mô tả', 0, 200);
    integerField(b, 'days', 'Thời hạn', 1, 730);
    integerField(b, 'price', 'Giá gói', 1000, 100000000);
    const p = validatePlan(b);
    if (b.id) {
      const r = await db
        .prepare(
          'UPDATE plans SET name=?,days=?,price=?,description=? WHERE id=? AND deleted=0',
        )
        .bind(p.name, p.days, p.price, p.description, String(b.id))
        .run();
      if (!r.meta.changes) fail('Không tìm thấy gói tập.', 404);
    } else
      await db
        .prepare(
          'INSERT INTO plans(id,name,days,price,description) VALUES(?,?,?,?,?)',
        )
        .bind(id, p.name, p.days, p.price, p.description)
        .run();
    return { ok: true, id: b.id || id };
  }
  if (action === 'plan.toggle' || action === 'plan.delete') {
    if (action === 'plan.toggle' && typeof b.active !== 'boolean')
      fail('Trạng thái phải là boolean.');
    const r = await db
      .prepare(
        action === 'plan.delete'
          ? 'UPDATE plans SET deleted=1,active=0 WHERE id=? AND deleted=0'
          : 'UPDATE plans SET active=? WHERE id=? AND deleted=0',
      )
      .bind(
        ...(action === 'plan.delete'
          ? [String(b.id)]
          : [b.active ? 1 : 0, String(b.id)]),
      )
      .run();
    if (!r.meta.changes) fail('Không tìm thấy gói tập.', 404);
    return { ok: true };
  }
  if (action === 'payment.create') {
    if (!['Tiền mặt', 'Chuyển khoản'].includes(String(b.method)))
      fail('Phương thức thanh toán không hợp lệ.');
    const requestId = stringField(b, 'request_id', 'Mã yêu cầu', 16, 80),
      memberId = stringField(b, 'member_id', 'Hội viên', 1, 80),
      planId = stringField(b, 'plan_id', 'Gói tập', 1, 80);
    if (!/^[\w-]+$/.test(requestId)) fail('Mã yêu cầu không hợp lệ.');
    const requested = b.start_date
      ? dateField(b.start_date, 'Ngày bắt đầu')
      : '';
    const replay = async () => {
      const old = await db
        .prepare('SELECT * FROM payments WHERE request_id=?')
        .bind(requestId)
        .first<Payment & { requested_start: string }>();
      if (!old) return null;
      if (
        old.member_id !== memberId ||
        old.plan_id !== planId ||
        old.method !== b.method ||
        old.requested_start !== requested ||
        (b.amount !== undefined && Number(b.amount) !== old.amount)
      )
        fail('Mã yêu cầu đã được dùng cho nội dung thanh toán khác.', 409);
      return { ok: true, id: old.id };
    };
    const old = await replay();
    if (old) return old;
    const m = await db
      .prepare('SELECT * FROM members WHERE id=? AND archived=0')
      .bind(memberId)
      .first<Member>();
    const p = await db
      .prepare('SELECT * FROM plans WHERE id=? AND active=1 AND deleted=0')
      .bind(planId)
      .first<Plan>();
    if (!m || !p) fail('Hội viên hoặc gói tập không còn hoạt động.');
    const plan = p!;
    if (
      b.amount !== undefined &&
      (typeof b.amount === 'boolean' || Number(b.amount) !== plan.price)
    )
      fail('Số tiền phải bằng giá gói tập.');
    if (b.status !== undefined && b.status !== 'Đã thanh toán')
      fail('Chỉ ghi nhận hóa đơn khi đã thu đủ tiền.');
    let start = requested;
    if (requested) start = registrationDates(requested, plan.days, today).start;
    const previous = await db
      .prepare(
        'SELECT MAX(end_date) AS last_end FROM payments WHERE member_id=?',
      )
      .bind(memberId)
      .first<{ last_end: string | null }>();
    if (!start)
      start =
        previous?.last_end && previous.last_end >= today
          ? addDays(previous.last_end, 1)
          : today;
    const end = addDays(start, plan.days - 1);
    if (
      await db
        .prepare(
          'SELECT id FROM payments WHERE member_id=? AND start_date<=? AND end_date>=? LIMIT 1',
        )
        .bind(memberId, end, start)
        .first()
    )
      fail('Thời hạn bị trùng. Hãy chọn ngày bắt đầu khác.', 409);
    await db
      .prepare(
        'INSERT INTO payments(id,member_id,plan_id,plan_name,amount,method,start_date,end_date,created_at,request_id,requested_start) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        id,
        memberId,
        plan.id,
        plan.name,
        plan.price,
        b.method,
        start,
        end,
        now,
        requestId,
        requested || null,
      )
      .run();
    return { ok: true, id };
  }
  if (action === 'checkin.create') {
    const r = await db
      .prepare(
        'INSERT INTO checkins(id,member_id,date,created_at,checkout_at) SELECT ?,m.id,?,?,NULL FROM members m WHERE m.id=? AND m.archived=0 AND EXISTS(SELECT 1 FROM payments p WHERE p.member_id=m.id AND p.start_date<=? AND p.end_date>=?)',
      )
      .bind(id, today, now, String(b.member_id), today, today)
      .run();
    if (!r.meta.changes)
      fail('Hội viên chưa có gói còn hạn hoặc đã bị lưu trữ.');
    return { ok: true, id };
  }
  if (action === 'checkin.checkout') {
    const r = await db
      .prepare(
        'UPDATE checkins SET checkout_at=? WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0',
      )
      .bind(now, String(b.member_id))
      .run();
    if (!r.meta.changes) fail('Hội viên chưa check-in hoặc đã check-out.', 409);
    return { ok: true };
  }
  const kinds: Record<string, string> = {
    trainer: 'trainers',
    room: 'rooms',
    equipment: 'equipment',
  };
  const [kind, operation] = action.split('.'),
    table = kinds[kind];
  if (table && ['save', 'delete'].includes(operation)) {
    if (operation === 'delete') {
      if (
        kind === 'room' &&
        (await db
          .prepare(
            'SELECT id FROM equipment WHERE room_id=? AND deleted=0 LIMIT 1',
          )
          .bind(String(b.id))
          .first())
      )
        fail('Phòng còn thiết bị. Chuyển hoặc xóa thiết bị trước.', 409);
      const r = await db
        .prepare('UPDATE ' + table + ' SET deleted=1 WHERE id=? AND deleted=0')
        .bind(String(b.id))
        .run();
      if (!r.meta.changes) fail('Không tìm thấy bản ghi.', 404);
      return { ok: true };
    }
    const data = validateEntity(kind, b);
    if (
      kind === 'equipment' &&
      !(await db
        .prepare('SELECT id FROM rooms WHERE id=? AND deleted=0 AND active=1')
        .bind(data.room_id)
        .first())
    )
      fail('Phòng không tồn tại hoặc ngừng hoạt động.');
    const keys = Object.keys(data),
      values = Object.values(data);
    if (b.id) {
      const r = await db
        .prepare(
          'UPDATE ' +
            table +
            ' SET ' +
            keys.map((k) => k + '=?').join(',') +
            ' WHERE id=? AND deleted=0',
        )
        .bind(...values, String(b.id))
        .run();
      if (!r.meta.changes) fail('Không tìm thấy bản ghi.', 404);
    } else
      await db
        .prepare(
          'INSERT INTO ' +
            table +
            '(id,' +
            keys.join(',') +
            ') VALUES(' +
            ['?', ...keys.map(() => '?')].join(',') +
            ')',
        )
        .bind(id, ...values)
        .run();
    return { ok: true, id: b.id || id };
  }
  if (action === 'user.save') {
    const c = contact(b),
      username = stringField(
        b,
        'username',
        'Tên đăng nhập',
        3,
        32,
      ).toLowerCase(),
      role = String(b.role),
      position = stringField(b, 'position', 'Chức vụ', 0, 80);
    if (!/^[a-z0-9_.-]+$/.test(username))
      fail(
        'Tên đăng nhập chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.',
      );
    if (!['ADMIN', 'STAFF', 'TRAINER'].includes(role))
      fail('Vai trò không hợp lệ.');
    const active = integerField(b, 'active', 'Trạng thái', 0, 1);
    if (b.id === actor.id && (role !== actor.role || !active))
      fail('Không được tự khóa hoặc hạ quyền tài khoản đang dùng.', 409);
    const password = b.password
      ? await hashPassword(validatePassword(b.password))
      : null;
    if (b.id) {
      const current = await db
        .prepare('SELECT * FROM accounts WHERE id=?')
        .bind(String(b.id))
        .first<User>();
      if (!current) fail('Không tìm thấy nhân viên.', 404);
      const r = await db
        .prepare(
          "UPDATE accounts SET name=?,username=?,phone=?,email=?,position=?,role=?,active=?,password_hash=COALESCE(?,password_hash) WHERE id=? AND (role<>'ADMIN' OR active=0 OR (?='ADMIN' AND ?=1) OR (SELECT n FROM (SELECT COUNT(*) AS n FROM accounts WHERE role='ADMIN' AND active=1) AS admin_count)>1)",
        )
        .bind(
          c.name,
          username,
          c.phone,
          c.email,
          position,
          role,
          active,
          password,
          String(b.id),
          role,
          active,
        )
        .run();
      if (!r.meta.changes)
        fail('Phải giữ ít nhất một Admin đang hoạt động.', 409);
      if (password || current!.role !== role || !active)
        await db
          .prepare('DELETE FROM sessions WHERE account_id=?')
          .bind(String(b.id))
          .run();
    } else {
      if (!password) fail('Mật khẩu không được bỏ trống.');
      await db
        .prepare(
          'INSERT INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          id,
          c.name,
          username,
          password,
          c.phone,
          c.email,
          position,
          role,
          active,
          now,
        )
        .run();
    }
    return { ok: true, id: b.id || id };
  }
  if (action === 'user.toggle') {
    if (typeof b.active !== 'boolean') fail('Trạng thái phải là boolean.');
    if (b.id === actor.id && !b.active)
      fail('Không được tự khóa tài khoản đang dùng.', 409);
    const r = await db
      .prepare(
        "UPDATE accounts SET active=? WHERE id=? AND (?=1 OR role<>'ADMIN' OR (SELECT n FROM (SELECT COUNT(*) AS n FROM accounts WHERE role='ADMIN' AND active=1) AS admin_count)>1)",
      )
      .bind(b.active ? 1 : 0, String(b.id), b.active ? 1 : 0)
      .run();
    if (!r.meta.changes)
      fail('Không tìm thấy tài khoản hoặc đây là Admin cuối cùng.', 409);
    if (!b.active)
      await db
        .prepare('DELETE FROM sessions WHERE account_id=?')
        .bind(String(b.id))
        .run();
    return { ok: true };
  }
  fail('Thao tác không được hỗ trợ.');
}
