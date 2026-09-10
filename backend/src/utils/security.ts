export type Role = 'ADMIN' | 'STAFF' | 'TRAINER';
export type User = {
  id: string;
  name: string;
  username: string;
  role: Role;
  phone: string;
  email: string;
  position: string;
  active: number;
};
export const roleLabel: Record<Role, string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên',
  TRAINER: 'Huấn luyện viên',
};
export const permissions: Record<Role, string[]> = {
  ADMIN: [
    'overview',
    'members',
    'plans',
    'payments',
    'checkins',
    'trainers',
    'users',
    'rooms',
    'equipment',
  ],
  STAFF: [
    'overview',
    'members',
    'plans',
    'payments',
    'checkins',
    'trainers',
    'rooms',
    'equipment',
  ],
  TRAINER: ['members', 'plans', 'checkins', 'trainers', 'rooms', 'equipment'],
};
export function canMutate(role: Role, action: string) {
  if (!['ADMIN', 'STAFF', 'TRAINER'].includes(role)) return false;
  if (role === 'ADMIN') return true;
  if (action === 'checkin.create' || action === 'checkin.checkout') return true;
  return (
    role === 'STAFF' &&
    [
      'member.save',
      'member.archive',
      'payment.create',
      'equipment.save',
    ].includes(action)
  );
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
