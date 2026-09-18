import type { Database } from '../models/database.model.ts';
import type { User } from '../utils/security.ts';
import {
  fail,
  stringField,
  dateField,
  registrationDates,
} from '../utils/validation.ts';
import { todayVN } from '../utils/gym.ts';
export async function workflow(
  db: Database,
  b: Record<string, unknown>,
  actor: User,
) {
  const action = String(b.action),
    id = String(b.id || crypto.randomUUID()),
    now = new Date().toISOString();
  if (action === 'system.save') {
    const name = stringField(b, 'gym_name', 'Tên phòng GYM', 2, 100),
      hours = stringField(b, 'opening_hours', 'Giờ hoạt động', 2, 100);
    await db
      .prepare(
        'UPDATE system_settings SET gym_name=?,opening_hours=? WHERE id=1',
      )
      .bind(name, hours)
      .run();
    return { ok: true, id: '1' };
  }
  if (action === 'registration.save') {
    const mid = stringField(b, 'member_id', 'Hội viên', 1, 80),
      pid = stringField(b, 'plan_id', 'Gói tập', 1, 80);
    const member = await db
      .prepare('SELECT id FROM members WHERE id=? AND archived=0')
      .bind(mid)
      .first();
    const plan: any = await db
      .prepare('SELECT * FROM plans WHERE id=? AND active=1 AND deleted=0')
      .bind(pid)
      .first();
    if (!member || !plan)
      fail('Hội viên hoặc gói tập không còn hoạt động.', 400);
    const dates = registrationDates(b.start_date, plan.days);
    if (b.id) {
      const old: any = await db
        .prepare('SELECT * FROM registrations WHERE id=?')
        .bind(id)
        .first();
      if (!old) fail('Không tìm thấy đăng ký.', 404);
      if (old.status !== 'PENDING')
        fail('Chỉ được sửa đăng ký đang chờ thanh toán.', 409);
      if (actor.role === 'STAFF' && old.member_id !== mid)
        fail('Nhân viên không được chuyển đăng ký sang hội viên khác.', 403);
    }
    if (
      await db
        .prepare(
          "SELECT id FROM registrations WHERE member_id=? AND status<>'CANCELLED' AND start_date<=? AND end_date>=? AND id<>?",
        )
        .bind(mid, dates.end, dates.start, id)
        .first()
    )
      fail('Hội viên đã có đăng ký trùng thời hạn.', 409);
    if (b.id)
      await db
        .prepare(
          'UPDATE registrations SET member_id=?,plan_id=?,plan_name=?,price=?,start_date=?,end_date=? WHERE id=?',
        )
        .bind(mid, pid, plan.name, plan.price, dates.start, dates.end, id)
        .run();
    else
      await db
        .prepare(
          "INSERT INTO registrations(id,member_id,plan_id,plan_name,price,start_date,end_date,status,created_at) VALUES(?,?,?,?,?,?,?,'PENDING',?)",
        )
        .bind(id, mid, pid, plan.name, plan.price, dates.start, dates.end, now)
        .run();
    if (plan.price === 0)
      await db
        .prepare("UPDATE registrations SET status='ACTIVE' WHERE id=?")
        .bind(id)
        .run();
    return { ok: true, id };
  }
  if (action === 'registration.delete') {
    const old: any = await db
      .prepare('SELECT * FROM registrations WHERE id=?')
      .bind(id)
      .first();
    if (!old) fail('Không tìm thấy đăng ký.', 404);
    if (
      await db
        .prepare(
          'SELECT id FROM checkins WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0',
        )
        .bind(old.member_id)
        .first()
    )
      fail('Cần check-out trước khi hủy đăng ký.', 409);
    if (
      await db
        .prepare(
          'SELECT id FROM payments WHERE registration_id=? AND cancelled=0',
        )
        .bind(id)
        .first()
    )
      fail('Cần hủy thanh toán trước khi hủy đăng ký đã thu tiền.', 409);
    if (
      await db
        .prepare(
          "SELECT id FROM schedules WHERE member_id=? AND status='ACTIVE' AND date BETWEEN ? AND ?",
        )
        .bind(old.member_id, old.start_date, old.end_date)
        .first()
    )
      fail('Cần hủy lịch tập trong thời hạn trước khi hủy đăng ký.', 409);
    await db
      .prepare("UPDATE registrations SET status='CANCELLED' WHERE id=?")
      .bind(id)
      .run();
    return { ok: true, id };
  }
  if (action === 'payment.update' || action === 'payment.delete') {
    const p: any = await db
      .prepare('SELECT * FROM payments WHERE id=? AND cancelled=0')
      .bind(id)
      .first();
    if (!p) fail('Không tìm thấy thanh toán còn hiệu lực.', 404);
    if (action === 'payment.update') {
      if (!['Tiền mặt', 'Chuyển khoản'].includes(String(b.method)))
        fail('Phương thức không hợp lệ.');
      for (const field of [
        'member_id',
        'plan_id',
        'amount',
        'start_date',
        'end_date',
      ])
        if (b[field] !== undefined && String(b[field]) !== String(p[field]))
          fail(
            'Không thay đổi số tiền hoặc thời hạn của hóa đơn đã thu. Hủy giao dịch rồi lập lại.',
            409,
          );
      await db
        .prepare('UPDATE payments SET method=? WHERE id=?')
        .bind(b.method, id)
        .run();
    } else {
      const reason = stringField(b, 'reason', 'Lý do hủy', 5, 500);
      if (
        await db
          .prepare(
            'SELECT id FROM checkins WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0',
          )
          .bind(p.member_id)
          .first()
      )
        fail('Hội viên đang trong phòng tập, cần check-out trước.', 409);
      if (
        await db
          .prepare(
            "SELECT id FROM schedules WHERE member_id=? AND status='ACTIVE' AND date BETWEEN ? AND ?",
          )
          .bind(p.member_id, p.start_date, p.end_date)
          .first()
      )
        fail('Cần hủy lịch tập liên quan trước.', 409);
      await db
        .prepare(
          'UPDATE payments SET cancelled=1,cancellation_reason=? WHERE id=?',
        )
        .bind(reason, id)
        .run();
      await db
        .prepare("UPDATE registrations SET status='CANCELLED' WHERE id=?")
        .bind(p.registration_id)
        .run();
    }
    return { ok: true, id };
  }
  if (action === 'schedule.save') {
    const mid = stringField(b, 'member_id', 'Hội viên', 1, 80),
      tid = stringField(b, 'trainer_id', 'HLV', 1, 80),
      rid = stringField(b, 'room_id', 'Phòng', 1, 80);
    const date = dateField(b.date),
      start = stringField(b, 'start_time', 'Giờ bắt đầu', 5, 5),
      end = stringField(b, 'end_time', 'Giờ kết thúc', 5, 5),
      note = stringField(b, 'note', 'Ghi chú', 0, 500);
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(start) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(end) ||
      end <= start
    )
      fail('Giờ kết thúc phải sau giờ bắt đầu.');
    const minutes = (v: string) =>
      Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
    if (
      minutes(end) - minutes(start) < 30 ||
      minutes(end) - minutes(start) > 180
    )
      fail('Thời lượng buổi tập phải từ 30 đến 180 phút.');
    if (date < todayVN()) fail('Không tạo hoặc sửa lịch trong quá khứ.');
    if (
      !(await db
        .prepare('SELECT id FROM members WHERE id=? AND archived=0')
        .bind(mid)
        .first()) ||
      !(await db
        .prepare(
          'SELECT id FROM trainers WHERE id=? AND active=1 AND deleted=0',
        )
        .bind(tid)
        .first()) ||
      !(await db
        .prepare('SELECT id FROM rooms WHERE id=? AND active=1 AND deleted=0')
        .bind(rid)
        .first())
    )
      fail('Hội viên, HLV hoặc phòng không còn hoạt động.');
    if (
      !(await db
        .prepare(
          "SELECT id FROM registrations WHERE member_id=? AND status='ACTIVE' AND start_date<=? AND end_date>=?",
        )
        .bind(mid, date, date)
        .first())
    )
      fail('Hội viên cần có gói đã thanh toán còn hiệu lực vào ngày tập.');
    if (
      b.id &&
      !(await db
        .prepare("SELECT id FROM schedules WHERE id=? AND status='ACTIVE'")
        .bind(id)
        .first())
    )
      fail('Không tìm thấy lịch đang hoạt động.', 404);
    if (
      await db
        .prepare(
          "SELECT id FROM schedules WHERE status='ACTIVE' AND date=? AND start_time<? AND end_time>? AND id<>? AND (member_id=? OR trainer_id=? OR room_id=?)",
        )
        .bind(date, end, start, id, mid, tid, rid)
        .first()
    )
      fail('Trùng lịch hội viên, HLV hoặc phòng tập.', 409);
    if (b.id)
      await db
        .prepare(
          'UPDATE schedules SET member_id=?,trainer_id=?,room_id=?,date=?,start_time=?,end_time=?,note=? WHERE id=?',
        )
        .bind(mid, tid, rid, date, start, end, note, id)
        .run();
    else
      await db
        .prepare(
          "INSERT INTO schedules(id,member_id,trainer_id,room_id,date,start_time,end_time,note,status,created_at) VALUES(?,?,?,?,?,?,?,?,'ACTIVE',?)",
        )
        .bind(id, mid, tid, rid, date, start, end, note, now)
        .run();
    return { ok: true, id };
  }
  if (action === 'schedule.delete') {
    const r = await db
      .prepare(
        "UPDATE schedules SET status='CANCELLED' WHERE id=? AND status='ACTIVE'",
      )
      .bind(id)
      .run();
    if (!r.meta.changes) fail('Không tìm thấy lịch đang hoạt động.', 404);
    return { ok: true, id };
  }
  return null;
}
