import { workflow } from './workflow.service.ts';
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
async function actCore(db: Database, b: Record<string, unknown>, actor: User) {
  const action = stringField(b, 'action', 'Thao tác', 1, 50);
  if (!canMutate(actor.role, action))
    fail('Bạn không có quyền thực hiện thao tác này.', 403);
  const flow = await workflow(db, b, actor);
  if (flow) return flow;
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
    if (
      m.email &&
      (await db
        .prepare('SELECT id FROM members WHERE email=? AND id<>?')
        .bind(m.email, String(b.id || ''))
        .first())
    )
      fail('Email hội viên đã tồn tại.', 409);
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
    if (
      b.archived !== false &&
      (await db
        .prepare(
          "SELECT id FROM schedules WHERE member_id=? AND status='ACTIVE' AND date>=?",
        )
        .bind(String(b.id), today)
        .first())
    )
      fail('Cần hủy lịch tập sắp tới trước khi lưu trữ hội viên.', 409);
    const r = await db
      .prepare('UPDATE members SET archived=? WHERE id=?')
      .bind(b.archived === false ? 0 : 1, String(b.id))
      .run();
    if (!r.meta.changes) fail('Không tìm thấy hội viên.', 404);
    return { ok: true };
  }
  if (action === 'plan.save') {
    stringField(b, 'name', 'Tên gói', 3, 100);
    stringField(b, 'description', 'Mô tả', 0, 200);
    integerField(b, 'days', 'Thời hạn', 1, 730);
    integerField(b, 'price', 'Giá gói', 0, 100000000);
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
    const registration: any = b.registration_id
      ? await db
          .prepare('SELECT * FROM registrations WHERE id=?')
          .bind(String(b.registration_id))
          .first()
      : null;
    if (b.registration_id && !registration)
      fail('Không tìm thấy đăng ký.', 404);
    if (registration?.status === 'CANCELLED') fail('Đăng ký đã bị hủy.', 409);
    if (registration)
      b = {
        ...b,
        member_id: registration.member_id,
        plan_id: registration.plan_id,
        start_date: registration.start_date,
      };

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
        .first<Payment & { requested_start: string; cancelled: number }>();
      if (!old) return null;
      if (old.cancelled) fail('Giao dịch của mã yêu cầu này đã bị hủy.', 409);
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
    if (registration && registration.status !== 'PENDING')
      fail('Đăng ký đã được thanh toán.', 409);
    const m = await db
      .prepare('SELECT * FROM members WHERE id=? AND archived=0')
      .bind(memberId)
      .first<Member>();
    const p = await db
      .prepare('SELECT * FROM plans WHERE id=? AND active=1 AND deleted=0')
      .bind(planId)
      .first<Plan>();
    if (!m || !p) fail('Hội viên hoặc gói tập không còn hoạt động.');
    const plan = registration
      ? {
          ...p!,
          price: registration.price,
          name: registration.plan_name,
          days:
            Math.round(
              (Date.parse(registration.end_date) -
                Date.parse(registration.start_date)) /
                86400000,
            ) + 1,
        }
      : p!;
    if (plan.price === 0)
      fail('Gói miễn phí được kích hoạt tại Đăng ký gói, không lập phiếu thu.');
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
        'SELECT MAX(end_date) AS last_end FROM payments WHERE cancelled=0 AND member_id=?',
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
          'SELECT id FROM payments WHERE cancelled=0 AND member_id=? AND start_date<=? AND end_date>=? LIMIT 1',
        )
        .bind(memberId, end, start)
        .first()
    )
      fail('Thời hạn bị trùng. Hãy chọn ngày bắt đầu khác.', 409);
    const regId = registration?.id || crypto.randomUUID();
    if (!registration) {
      if (
        await db
          .prepare(
            "SELECT id FROM registrations WHERE member_id=? AND status<>'CANCELLED' AND start_date<=? AND end_date>=?",
          )
          .bind(memberId, end, start)
          .first()
      )
        fail(
          'Đã có đăng ký trong khoảng ngày này. Hãy thu tiền từ mục Đăng ký gói.',
          409,
        );
      await db
        .prepare(
          "INSERT INTO registrations(id,member_id,plan_id,plan_name,price,start_date,end_date,status,created_at) VALUES(?,?,?,?,?,?,?,'ACTIVE',?)",
        )
        .bind(regId, memberId, plan.id, plan.name, plan.price, start, end, now)
        .run();
    } else
      await db
        .prepare("UPDATE registrations SET status='ACTIVE' WHERE id=?")
        .bind(regId)
        .run();
    await db
      .prepare(
        'INSERT INTO payments(id,member_id,plan_id,plan_name,amount,method,start_date,end_date,created_at,request_id,requested_start,registration_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
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
        regId,
      )
      .run();
    return { ok: true, id };
  }
  if (action === 'checkin.create') {
    const r = await db
      .prepare(
        "INSERT INTO checkins(id,member_id,date,created_at,checkout_at) SELECT ?,m.id,?,?,NULL FROM members m WHERE m.id=? AND m.archived=0 AND EXISTS(SELECT 1 FROM registrations p WHERE p.status='ACTIVE' AND p.member_id=m.id AND p.start_date<=? AND p.end_date>=?)",
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
        ['trainer', 'room'].includes(kind) &&
        (await db
          .prepare(
            'SELECT id FROM schedules WHERE ' +
              kind +
              "_id=? AND status='ACTIVE' AND date>=?",
          )
          .bind(String(b.id), today)
          .first())
      )
        fail('Cần hủy hoặc chuyển lịch tập sắp tới trước khi xóa.', 409);
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
      kind === 'trainer' &&
      data.email &&
      (await db
        .prepare('SELECT id FROM trainers WHERE email=? AND id<>?')
        .bind(data.email, String(b.id || ''))
        .first())
    )
      fail('Email HLV đã tồn tại.', 409);
    if (
      ['trainer', 'room'].includes(kind) &&
      b.id &&
      data.active === 0 &&
      (await db
        .prepare(
          'SELECT id FROM schedules WHERE ' +
            kind +
            "_id=? AND status='ACTIVE' AND date>=?",
        )
        .bind(String(b.id), today)
        .first())
    )
      fail('Cần xử lý lịch tập sắp tới trước khi ngừng hoạt động.', 409);
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
        5,
        30,
      ).toLowerCase(),
      role = String(b.role),
      position = stringField(b, 'position', 'Chức vụ', 0, 80);
    if (!/^[a-z0-9_.-]+$/.test(username))
      fail(
        'Tên đăng nhập chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.',
      );
    if (!['ADMIN', 'MANAGER', 'STAFF', 'TRAINER', 'MEMBER'].includes(role))
      fail('Vai trò không hợp lệ.');
    let memberId =
      role === 'MEMBER'
        ? stringField(b, 'member_id', 'Hồ sơ hội viên', 1, 80)
        : null;
    let trainerId =
      role === 'TRAINER'
        ? stringField(b, 'trainer_id', 'Hồ sơ HLV', 1, 80)
        : null;
    if (memberId) {
      const row: any = await db
        .prepare('SELECT id FROM members WHERE (id=? OR code=?) AND archived=0')
        .bind(memberId, memberId)
        .first();
      if (!row) fail('Hồ sơ hội viên không tồn tại hoặc đã lưu trữ.');
      memberId = row.id;
    }
    if (trainerId) {
      const row: any = await db
        .prepare(
          'SELECT id FROM trainers WHERE (id=? OR code=?) AND deleted=0 AND active=1',
        )
        .bind(trainerId, trainerId)
        .first();
      if (!row) fail('Hồ sơ HLV không tồn tại hoặc ngừng hoạt động.');
      trainerId = row.id;
    }
    if (
      c.email &&
      (await db
        .prepare('SELECT id FROM accounts WHERE email=? AND id<>?')
        .bind(c.email, String(b.id || ''))
        .first())
    )
      fail('Email tài khoản đã tồn tại.', 409);
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
    await db
      .prepare('UPDATE accounts SET member_id=?,trainer_id=? WHERE id=?')
      .bind(memberId, trainerId, String(b.id || id))
      .run();
    if (b.id)
      await db
        .prepare('DELETE FROM sessions WHERE account_id=?')
        .bind(String(b.id))
        .run();
    return { ok: true, id: b.id || id };
  }
  if (action === 'user.delete') {
    b = { ...b, active: false };
  }
  if (action === 'user.toggle' || action === 'user.delete') {
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

export async function act(
  db: Database,
  b: Record<string, unknown>,
  actor: User,
) {
  if (!canMutate(actor.role, String(b.action)))
    fail('Bạn không có quyền thực hiện thao tác này.', 403);
  const map: Record<string, [string, string]> = {
    'member.save': ['members', 'HV'],
    'plan.save': ['plans', 'GT'],
    'trainer.save': ['trainers', 'HLV'],
    'registration.save': ['registrations', 'DK'],
    'schedule.save': ['schedules', 'LT'],
    'payment.create': ['payments', 'TT'],
  };
  const item = map[String(b.action)];
  let code: string | undefined;
  if (item) {
    if (b.code !== undefined) {
      code = stringField(
        b,
        'code',
        'Mã nghiệp vụ',
        item[0] === 'plans' ? 3 : 5,
        20,
      ).toUpperCase();
      if (!/^[A-Z0-9]+$/.test(code)) fail('Mã chỉ gồm chữ không dấu và số.');
      const existing: any = await db
        .prepare('SELECT * FROM ' + item[0] + ' WHERE code=? AND id<>?')
        .bind(code, String(b.id || ''))
        .first();
      if (
        existing &&
        !(b.action === 'payment.create' && existing.request_id === b.request_id)
      )
        fail('Mã nghiệp vụ đã tồn tại.', 409);
    } else if (!b.id)
      code =
        item[1] +
        crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase();
  }
  const result = await actCore(db, b, actor);
  if (item && code && result?.id) {
    const old: any = await db
      .prepare('SELECT code FROM ' + item[0] + ' WHERE id=?')
      .bind(result.id)
      .first();
    if (!old?.code || b.id)
      await db
        .prepare('UPDATE ' + item[0] + ' SET code=? WHERE id=?')
        .bind(code, result.id)
        .run();
  }
  if (b.action === 'payment.create' && result?.id)
    await db
      .prepare(
        "UPDATE registrations r JOIN payments p ON p.registration_id=r.id SET r.code=CONCAT('DK',UPPER(LEFT(SHA2(r.id,256),16))) WHERE p.id=? AND r.code IS NULL",
      )
      .bind(result.id)
      .run();
  return result;
}
