import type { Database } from './database.model.ts';
import type { User } from '../utils/security.ts';
import { todayVN } from '../utils/gym.ts';
export async function snapshot(db: Database, user: User) {
  const coach = user.role === 'TRAINER';
  const members = await db
    .prepare('SELECT * FROM members ORDER BY created_at DESC,id')
    .all();
  const plans = await db
    .prepare('SELECT * FROM plans WHERE deleted=0 ORDER BY price,id')
    .all();
  const payments = await db
    .prepare(
      coach
        ? "SELECT id,member_id,plan_id,plan_name,0 AS amount,'' AS method,start_date,end_date,created_at,'' AS request_id,status,requested_start FROM payments ORDER BY created_at DESC,id"
        : 'SELECT * FROM payments ORDER BY created_at DESC,id',
    )
    .all();
  const checkins = await db
    .prepare(
      'SELECT id,member_id,date,created_at,checkout_at,legacy_closed FROM checkins ORDER BY created_at DESC,id',
    )
    .all();
  const trainers = await db
    .prepare('SELECT * FROM trainers WHERE deleted=0 ORDER BY name,id')
    .all();
  const rooms = await db
    .prepare('SELECT * FROM rooms WHERE deleted=0 ORDER BY name,id')
    .all();
  const equipment = await db
    .prepare('SELECT * FROM equipment WHERE deleted=0 ORDER BY name,id')
    .all();
  const users =
    user.role === 'ADMIN'
      ? (
          await db
            .prepare(
              'SELECT id,name,username,phone,email,position,role,active,created_at FROM accounts ORDER BY created_at DESC,id',
            )
            .all()
        ).results
      : [];
  const count = coach
    ? null
    : await db
        .prepare("SELECT COUNT(*) AS n FROM accounts WHERE role<>'TRAINER'")
        .first<{ n: number }>();
  return {
    members: members.results,
    plans: plans.results,
    payments: payments.results,
    checkins: checkins.results,
    trainers: trainers.results,
    rooms: rooms.results,
    equipment: equipment.results,
    users,
    staffCount: count?.n || 0,
    today: todayVN(),
  };
}
