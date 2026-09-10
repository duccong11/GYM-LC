import { todayVN, addDays } from './gym.ts';
export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export const fail = (message: string, status = 400): never => {
  throw new AppError(message, status);
};
export function stringField(
  b: Record<string, unknown>,
  key: string,
  label: string,
  min = 0,
  max = 200,
) {
  const raw = b[key] ?? '';
  if (typeof raw !== 'string') return fail(label + ' không đúng kiểu dữ liệu.');
  const s = raw.trim();
  if (s.length < min || s.length > max)
    return fail(label + ' phải có ' + min + '–' + max + ' ký tự.');
  return s;
}
export function integerField(
  b: Record<string, unknown>,
  key: string,
  label: string,
  min: number,
  max: number,
) {
  if (b[key] === '' || b[key] === null || typeof b[key] === 'boolean')
    return fail(label + ' không hợp lệ.');
  const n = Number(b[key]);
  if (!Number.isInteger(n) || n < min || n > max)
    return fail(label + ' phải là số nguyên từ ' + min + ' đến ' + max + '.');
  return n;
}
export function dateField(value: unknown, label = 'Ngày', required = true) {
  if (!value && !required) return '';
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value + 'T00:00:00Z')) ||
    new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value
  )
    fail(label + ' không hợp lệ.');
  return value as string;
}
export function contact(b: Record<string, unknown>) {
  const name = stringField(b, 'name', 'Họ tên', 2, 80),
    phone = stringField(b, 'phone', 'Số điện thoại', 10, 10),
    email = stringField(b, 'email', 'Email', 0, 120);
  if (!/^0\d{9}$/.test(phone))
    fail('Số điện thoại phải có 10 chữ số bắt đầu bằng 0.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail('Email không hợp lệ.');
  return { name, phone, email };
}
export function validatePassword(value: unknown) {
  if (
    typeof value !== 'string' ||
    value.length < 8 ||
    value.length > 128 ||
    !/[A-Za-z]/.test(value) ||
    !/[0-9]/.test(value)
  )
    fail('Mật khẩu cần 8–128 ký tự, gồm chữ và số.');
  return value as string;
}
export function registrationDates(
  start: unknown,
  days: number,
  today = todayVN(),
) {
  const s = dateField(start, 'Ngày bắt đầu');
  if (s < today || s > addDays(today, 730))
    fail('Ngày bắt đầu phải từ hôm nay đến 730 ngày tới.');
  if (!Number.isInteger(days) || days < 1 || days > 730)
    fail('Thời hạn không hợp lệ.');
  return { start: s, end: addDays(s, days - 1) };
}
export function validateEntity(
  kind: string,
  b: Record<string, unknown>,
): Record<string, string | number> {
  if (kind === 'trainer') {
    const c = contact(b);
    return {
      ...c,
      specialty: stringField(b, 'specialty', 'Chuyên môn', 2, 120),
      experience: integerField(b, 'experience', 'Kinh nghiệm', 0, 60),
      schedule: stringField(b, 'schedule', 'Lịch làm việc', 2, 200),
      active: integerField(b, 'active', 'Trạng thái', 0, 1),
    };
  }
  if (kind === 'room')
    return {
      name: stringField(b, 'name', 'Tên phòng', 2, 80),
      type: stringField(b, 'type', 'Loại phòng', 2, 40),
      capacity: integerField(b, 'capacity', 'Sức chứa', 1, 1000),
      description: stringField(b, 'description', 'Mô tả'),
      active: integerField(b, 'active', 'Trạng thái', 0, 1),
    };
  if (kind === 'equipment') {
    const purchased = dateField(b.purchased_at, 'Ngày mua');
    if (purchased > todayVN() || purchased < '1900-01-01')
      fail('Ngày mua không được ở tương lai hoặc trước năm 1900.');
    const condition = stringField(b, 'condition', 'Tình trạng', 1, 30);
    if (!['Tốt', 'Đang sử dụng', 'Hỏng', 'Đang bảo trì'].includes(condition))
      fail('Tình trạng thiết bị không hợp lệ.');
    return {
      name: stringField(b, 'name', 'Tên thiết bị', 2, 80),
      room_id: stringField(b, 'room_id', 'Phòng', 1, 80),
      quantity: integerField(b, 'quantity', 'Số lượng', 1, 10000),
      purchased_at: purchased,
      condition,
    };
  }
  return fail('Module không hợp lệ.');
}
