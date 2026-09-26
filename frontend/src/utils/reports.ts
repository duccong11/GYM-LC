export type Receipt = {
  id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  method: string;
  created_at: string;
  registration_id?: string | null;
  cancelled?: number | boolean;
};
export type Enrollment = {
  id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  created_at: string;
};
export type ReportGroup = 'day' | 'month' | 'year';
export function localDay(value: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}
export function summarize(
  payments: Receipt[],
  registrations: Enrollment[],
  from: string,
  to: string,
  group: ReportGroup,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
    !Number.isFinite(Date.parse(from)) ||
    !Number.isFinite(Date.parse(to)) ||
    from > to ||
    Date.parse(to) - Date.parse(from) > 3660 * 86400000
  )
    throw new RangeError('Khoảng báo cáo không hợp lệ.');
  const within = (date: string) => {
    const day = localDay(date);
    return !!day && day >= from && day <= to;
  };
  const receipts = payments.filter((p) => !p.cancelled && within(p.created_at));
  const buckets = new Map<
    string,
    { period: string; amount: number; count: number }
  >();
  for (
    const date = new Date(from + 'T00:00:00Z');
    date.toISOString().slice(0, 10) <= to;
    date.setUTCDate(date.getUTCDate() + 1)
  ) {
    const key = date
      .toISOString()
      .slice(0, group === 'day' ? 10 : group === 'month' ? 7 : 4);
    if (!buckets.has(key))
      buckets.set(key, { period: key, amount: 0, count: 0 });
  }
  for (const p of receipts) {
    const key = localDay(p.created_at).slice(
      0,
      group === 'day' ? 10 : group === 'month' ? 7 : 4,
    );
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.amount += Number(p.amount);
      bucket.count++;
    }
  }
  const plans = new Map<string, { id: string; name: string; count: number }>();
  const count = (p: { plan_id: string; plan_name: string }) => {
    const item = plans.get(p.plan_id) || {
      id: p.plan_id,
      name: p.plan_name,
      count: 0,
    };
    item.count++;
    plans.set(p.plan_id, item);
  };
  registrations
    .filter((r) => r.status !== 'CANCELLED' && within(r.created_at))
    .forEach(count);
  receipts.filter((p) => !p.registration_id).forEach(count);
  return {
    receipts,
    buckets: [...buckets.values()],
    revenue: receipts.reduce((n, p) => n + Number(p.amount), 0),
    cash: receipts
      .filter((p) => p.method === 'Tiền mặt')
      .reduce((n, p) => n + Number(p.amount), 0),
    transfer: receipts
      .filter((p) => p.method === 'Chuyển khoản')
      .reduce((n, p) => n + Number(p.amount), 0),
    choices: [...plans.values()].reduce((n, p) => n + p.count, 0),
    top: [...plans.values()]
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.name.localeCompare(b.name, 'vi') ||
          a.id.localeCompare(b.id),
      )
      .slice(0, 3),
  };
}
