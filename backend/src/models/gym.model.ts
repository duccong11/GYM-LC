import type { Database } from './database.model.ts';
import { permissions, type User } from '../utils/security.ts';
import { todayVN } from '../utils/gym.ts';
export async function snapshot(db: Database, user: User) {
  const can = (resource: string) => permissions[user.role]?.includes(resource);
  const scoped = user.role === 'MEMBER' || user.role === 'TRAINER';
  const ids =
    user.role === 'MEMBER'
      ? user.member_id
        ? [user.member_id]
        : []
      : user.role === 'TRAINER'
        ? (
            await db
              .prepare(
                "SELECT DISTINCT member_id FROM schedules WHERE trainer_id=? AND status='ACTIVE'",
              )
              .bind(user.trainer_id || '')
              .all<{ member_id: string }>()
          ).results.map((r) => r.member_id)
        : [];
  const scope = ids.length
    ? ' IN (' + ids.map(() => '?').join(',') + ')'
    : ' IN (NULL)';
  const read = async (sql: string, args: unknown[] = []) =>
    (
      await db
        .prepare(sql)
        .bind(...args)
        .all()
    ).results;
  const members = can('members')
    ? await read(
        'SELECT * FROM members' +
          (scoped ? ' WHERE id' + scope : '') +
          ' ORDER BY created_at DESC,id',
        scoped ? ids : [],
      )
    : [];
  const plans = can('plans')
    ? await read('SELECT * FROM plans WHERE deleted=0 ORDER BY price,id')
    : [];
  const payments = can('payments')
    ? await read(
        'SELECT * FROM payments WHERE cancelled=0 ORDER BY created_at DESC,id',
      )
    : scoped
      ? await read(
          "SELECT id,member_id,plan_id,plan_name,0 AS amount,'' AS method,start_date,end_date,created_at,'' AS request_id FROM payments WHERE cancelled=0 AND member_id" +
            scope,
          ids,
        )
      : [];
  const free = can('members')
    ? await read(
        "SELECT id,member_id,plan_id,plan_name,0 AS amount,'' AS method,start_date,end_date,created_at,'' AS request_id FROM registrations WHERE price=0 AND status='ACTIVE'" +
          (scoped ? ' AND member_id' + scope : ''),
        scoped ? ids : [],
      )
    : [];
  const entitlements = [...payments, ...free];
  const registrations = can('registrations')
    ? await read(
        'SELECT * FROM registrations' +
          (scoped ? ' WHERE member_id' + scope : '') +
          ' ORDER BY created_at DESC,id',
        scoped ? ids : [],
      )
    : [];
  const schedules = can('schedules')
    ? await read(
        'SELECT s.*,m.name AS member_name,t.name AS trainer_name,r.name AS room_name FROM schedules s JOIN members m ON m.id=s.member_id JOIN trainers t ON t.id=s.trainer_id JOIN rooms r ON r.id=s.room_id' +
          (user.role === 'MEMBER'
            ? ' WHERE s.member_id=?'
            : user.role === 'TRAINER'
              ? ' WHERE s.trainer_id=?'
              : '') +
          ' ORDER BY s.date DESC,s.start_time,s.id',
        user.role === 'MEMBER'
          ? [user.member_id || '']
          : user.role === 'TRAINER'
            ? [user.trainer_id || '']
            : [],
      )
    : [];
  const checkins = can('checkins')
    ? await read('SELECT * FROM checkins ORDER BY created_at DESC,id')
    : [];
  const trainers = can('trainers')
    ? await read('SELECT * FROM trainers WHERE deleted=0 ORDER BY name,id')
    : [];
  const rooms = can('rooms')
    ? await read('SELECT * FROM rooms WHERE deleted=0 ORDER BY name,id')
    : [];
  const equipment = can('equipment')
    ? await read('SELECT * FROM equipment WHERE deleted=0 ORDER BY name,id')
    : [];
  const users = can('users')
    ? await read(
        'SELECT id,name,username,phone,email,position,role,active,member_id,trainer_id,created_at FROM accounts ORDER BY created_at DESC,id',
      )
    : [];
  const system = can('system')
    ? await read('SELECT * FROM system_settings')
    : [];
  const audit = can('system')
    ? await read(
        'SELECT id,actor_id,action,entity_id,created_at FROM audit_logs ORDER BY created_at DESC,id LIMIT 200',
      )
    : [];
  const staffCount = can('overview')
    ? (
        await db
          .prepare(
            "SELECT COUNT(*) AS n FROM accounts WHERE role IN ('MANAGER','STAFF') AND active=1",
          )
          .first<{ n: number }>()
      )?.n || 0
    : 0;
  return {
    members,
    plans,
    payments,
    entitlements,
    registrations,
    schedules,
    checkins,
    trainers,
    rooms,
    equipment,
    users,
    system,
    audit,
    staffCount,
    today: todayVN(),
  };
}
