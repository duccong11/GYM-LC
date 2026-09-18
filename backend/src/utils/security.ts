export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'TRAINER' | 'MEMBER';
export type User = {
  id: string;
  name: string;
  username: string;
  role: Role;
  phone: string;
  email: string;
  position: string;
  active: number;
  member_id?: string | null;
  trainer_id?: string | null;
};
export const roleLabel: Record<Role, string> = {
  ADMIN: 'Quản trị hệ thống',
  MANAGER: 'Quản lý phòng GYM',
  STAFF: 'Nhân viên',
  TRAINER: 'Huấn luyện viên',
  MEMBER: 'Hội viên',
};
export const permissions: Record<Role, string[]> = {
  ADMIN: ['users', 'system'],
  MANAGER: [
    'search',
    'overview',
    'members',
    'plans',
    'registrations',
    'payments',
    'schedules',
    'reports',
    'checkins',
    'trainers',
    'rooms',
    'equipment',
  ],
  STAFF: [
    'search',
    'members',
    'plans',
    'registrations',
    'payments',
    'schedules',
    'checkins',
    'trainers',
    'rooms',
    'equipment',
  ],
  TRAINER: ['search', 'schedules', 'members', 'plans', 'rooms'],
  MEMBER: ['search', 'members', 'plans', 'registrations', 'schedules'],
};
const actions: Record<Role, string[]> = {
  ADMIN: ['user.save', 'user.toggle', 'user.delete', 'system.save'],
  MANAGER: [
    'member.save',
    'member.archive',
    'member.delete',
    'plan.save',
    'plan.toggle',
    'plan.delete',
    'registration.save',
    'registration.delete',
    'payment.create',
    'payment.update',
    'payment.delete',
    'schedule.save',
    'schedule.delete',
    'trainer.save',
    'trainer.delete',
    'room.save',
    'room.delete',
    'equipment.save',
    'equipment.delete',
    'checkin.create',
    'checkin.checkout',
  ],
  STAFF: [
    'member.save',
    'registration.save',
    'schedule.save',
    'payment.create',
    'equipment.save',
    'checkin.create',
    'checkin.checkout',
  ],
  TRAINER: [],
  MEMBER: [],
};
export function canMutate(role: Role, action: string) {
  return actions[role]?.includes(action) ?? false;
}
const hex = (a: ArrayBuffer) =>
  Array.from(new Uint8Array(a))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
export const randomToken = () =>
  hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export async function digest(value: string) {
  return hex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
  );
}
export async function hashPassword(password: string, salt = randomToken()) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256,
  );
  return 'pbkdf2:100000:' + salt + ':' + hex(hash);
}
export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2' || parts[1] !== '100000')
    return false;
  const actual = await hashPassword(password, parts[2]);
  let difference = actual.length ^ stored.length;
  for (let i = 0; i < actual.length; i++)
    difference |= actual.charCodeAt(i) ^ (stored.charCodeAt(i) || 0);
  return difference === 0;
}
