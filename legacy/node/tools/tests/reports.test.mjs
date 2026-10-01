import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, localDay } from '../../frontend/src/utils/reports.ts';
const receipt = (id, at, amount, extra = {}) => ({
  id,
  plan_id: 'p1',
  plan_name: 'Gói A',
  amount,
  method: 'Tiền mặt',
  created_at: at,
  ...extra,
});
test('Doanh thu dùng ngày Việt Nam, bao gồm hai biên và bỏ giao dịch hủy', () => {
  const rows = [
    receipt('1', '2026-08-31T16:59:59Z', 999),
    receipt('2', '2026-08-31T17:00:00Z', 100),
    receipt('3', '2026-09-30T16:59:59Z', 200, { method: 'Chuyển khoản' }),
    receipt('4', '2026-09-30T17:00:00Z', 999),
    receipt('5', '2026-09-15T00:00:00Z', 999, { cancelled: 1 }),
  ];
  const r = summarize(rows, [], '2026-09-01', '2026-09-30', 'day');
  assert.equal(r.revenue, 300);
  assert.equal(r.cash, 100);
  assert.equal(r.transfer, 200);
  assert.equal(r.receipts.length, 2);
  assert.equal(r.buckets.length, 30);
  assert.equal(r.buckets[1].amount, 0);
  assert.equal(localDay('invalid'), '');
});
test('Tổng hợp tháng/năm giữ nguyên tổng tiền và xử lý năm nhuận', () => {
  const rows = [
    receipt('1', '2024-02-29T00:00:00Z', 100),
    receipt('2', '2025-01-01T00:00:00Z', 200),
  ];
  const r = summarize(rows, [], '2024-02-01', '2025-01-31', 'month');
  assert.equal(r.buckets.length, 12);
  assert.equal(r.revenue, 300);
  const y = summarize(rows, [], '2024-02-01', '2025-01-31', 'year');
  assert.deepEqual(
    y.buckets.map((b) => b.amount),
    [100, 200],
  );
});
test('Top 3 đếm đăng ký, miễn phí và mua trực tiếp, không đếm trùng hoặc hủy', () => {
  const at = '2026-09-10T00:00:00Z';
  const regs = ['a', 'a', 'a', 'b', 'b', 'c', 'd'].map((plan, i) => ({
    id: 'r' + i,
    plan_id: plan,
    plan_name: plan.toUpperCase(),
    status: i === 1 ? 'PENDING' : 'ACTIVE',
    created_at: at,
  }));
  regs.push({
    id: 'cancel',
    plan_id: 'd',
    plan_name: 'D',
    status: 'CANCELLED',
    created_at: at,
  });
  const pay = [
    receipt('1', at, 100, { plan_id: 'a', registration_id: 'r0' }),
    receipt('2', at, 100, { plan_id: 'b', plan_name: 'B' }),
    receipt('3', at, 100, { plan_id: 'd', cancelled: 1 }),
  ];
  const r = summarize(pay, regs, '2026-09-01', '2026-09-30', 'month');
  assert.equal(r.choices, 7);
  assert.deepEqual(
    r.top.map((p) => [p.id, p.count]),
    [
      ['b', 3],
      ['a', 2],
      ['c', 1],
    ],
  );
});
test('Không có doanh thu trả số 0; ngày đảo hoặc bỏ trống bị từ chối', () => {
  const r = summarize([], [], '2026-09-01', '2026-09-01', 'day');
  assert.equal(r.revenue, 0);
  assert.deepEqual(r.top, []);
  assert.throws(() => summarize([], [], '', '2026-09-01', 'day'), RangeError);
  assert.throws(
    () => summarize([], [], '2026-09-02', '2026-09-01', 'day'),
    RangeError,
  );
});
