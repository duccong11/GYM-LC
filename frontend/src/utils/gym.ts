export type Member = {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  created_at: string;
  archived: number;
  birth_date?: string;
  address?: string;
};
export type Plan = {
  id: string;
  name: string;
  days: number;
  price: number;
  description: string;
  active: number;
};
export type Payment = {
  id: string;
  member_id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  method: string;
  start_date: string;
  end_date: string;
  created_at: string;
  request_id: string;
};
export type Checkin = {
  id: string;
  member_id: string;
  date: string;
  created_at: string;
  checkout_at?: string | null;
};
export type GymData = {
  members: Member[];
  plans: Plan[];
  payments: Payment[];
  checkins: Checkin[];
  today: string;
};
export function todayVN(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function addDays(day: string, n: number) {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function membership(member: Member, payments: Payment[], today: string) {
  const all = payments
    .filter((p) => p.member_id === member.id)
    .sort((a, b) => b.end_date.localeCompare(a.end_date));
  const current = all.find((p) => p.start_date <= today && p.end_date >= today);
  const last = current || all[0];
  const status = member.archived
    ? 'Đã lưu trữ'
    : current
      ? 'Đang hoạt động'
      : !last
        ? 'Chưa có gói'
        : all.some((p) => p.start_date > today)
          ? 'Chưa đến hạn'
          : 'Hết hạn';
  const remaining = current
    ? Math.round((Date.parse(current.end_date) - Date.parse(today)) / 86400000)
    : null;
  return { status, current, last, remaining };
}
export const money = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);
export const dateLabel = (s: string) =>
  s
    ? new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(s.length === 10 ? s + 'T00:00:00Z' : s))
    : '—';
export function validateMember(b: Record<string, unknown>) {
  const name = String(b.name ?? '').trim(),
    phone = String(b.phone ?? '').trim(),
    email = String(b.email ?? '').trim(),
    gender = String(b.gender ?? 'Khác');
  if (name.length < 2 || name.length > 80)
    throw new Error('Họ tên phải có từ 2 đến 80 ký tự.');
  if (!/^0\d{9}$/.test(phone))
    throw new Error('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');
  if (
    email &&
    (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    throw new Error('Email không hợp lệ.');
  if (!['Nam', 'Nữ', 'Khác'].includes(gender))
    throw new Error('Giới tính không hợp lệ.');
  return { name, phone, email, gender };
}
export function validatePlan(b: Record<string, unknown>) {
  const name = String(b.name ?? '').trim(),
    days = Number(b.days),
    price = Number(b.price),
    description = String(b.description ?? '').trim();
  if (name.length < 2 || name.length > 60)
    throw new Error('Tên gói phải có từ 2 đến 60 ký tự.');
  if (!Number.isInteger(days) || days < 1 || days > 730)
    throw new Error('Thời hạn phải từ 1 đến 730 ngày.');
  if (!Number.isInteger(price) || price < 1000 || price > 100000000)
    throw new Error('Giá gói phải là số nguyên từ 1.000 đến 100.000.000 đồng.');
  if (description.length > 200) throw new Error('Mô tả tối đa 200 ký tự.');
  return { name, days, price, description };
}
