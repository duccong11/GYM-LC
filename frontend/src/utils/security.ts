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
