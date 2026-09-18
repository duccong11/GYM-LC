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
