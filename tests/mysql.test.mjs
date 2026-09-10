import test, { after } from 'node:test';
import assert from 'node:assert/strict';
process.env.GYM_TEST_MODE = '1';
const { pool } = await import('../backend/src/config/database.ts');
const { config } = await import('../backend/src/config/env.ts');
const { transaction } = await import('../backend/src/models/database.model.ts');
const { act } = await import('../backend/src/services/gym.service.ts');
const { todayVN, addDays } = await import('../backend/src/utils/gym.ts');
assert.equal(
  config.database.database,
  'quan_ly_phong_gym_test',
  'Không chạy trên DB chính',
);
const actor = {
  id: 'demo-v2-user-0',
  name: 'Admin',
  username: 'admin',
  role: 'ADMIN',
  active: 1,
};
const run = (b) => transaction((db) => act(db, b, actor), true);
const phone = () =>
  '0' +
  String(Date.now()).slice(-7) +
  String(Math.floor(Math.random() * 100)).padStart(2, '0');
const member = () =>
  run({
    action: 'member.save',
    name: 'MySQL integration',
    phone: phone(),
    gender: 'Nam',
  });
const plan = () =>
  run({
    action: 'plan.save',
    name: 'MySQL integration',
    days: 30,
    price: 350000,
  });
const pay = (m, p, extra = {}) =>
  run({
    action: 'payment.create',
    member_id: m.id,
    plan_id: p.id,
    method: 'Tiền mặt',
    request_id: crypto.randomUUID(),
    ...extra,
  });
after(() => pool.end());
test('MySQL CRUD hội viên và lưu trữ giữ hồ sơ', async () => {
  const m = await member();
  await run({ action: 'member.archive', id: m.id });
  await run({ action: 'member.archive', id: m.id, archived: false });
  const [r] = await pool.execute('SELECT archived FROM members WHERE id=?', [
    m.id,
  ]);
  assert.equal(r[0].archived, 0);
});
test('MySQL unique SĐT', async () => {
  const p = phone(),
    b = { action: 'member.save', name: 'Unique Phone', phone: p };
  await run(b);
  await assert.rejects(
    () => run(b),
    (e) => e.code === 'ER_DUP_ENTRY',
  );
});
test('MySQL validation ngày sinh tương lai', async () => {
  await assert.rejects(() =>
    run({
      action: 'member.save',
      name: 'Invalid date',
      phone: phone(),
      birth_date: '2999-01-01',
    }),
  );
});
test('MySQL request trùng đồng thời chỉ tạo một hóa đơn', async () => {
  const m = await member(),
    p = await plan(),
    key = crypto.randomUUID();
  const r = await Promise.all([
    pay(m, p, { request_id: key }),
    pay(m, p, { request_id: key }),
  ]);
  assert.equal(r[0].id, r[1].id);
  await assert.rejects(() =>
    pay(m, p, { request_id: key, method: 'Chuyển khoản' }),
  );
});
test('MySQL gia hạn đồng thời không chồng ngày', async () => {
  const m = await member(),
    p = await plan();
  await Promise.all([pay(m, p), pay(m, p)]);
  const [r] = await pool.execute(
    'SELECT * FROM payments WHERE member_id=? ORDER BY start_date',
    [m.id],
  );
  assert.equal(r.length, 2);
  assert.equal(r[1].start_date, addDays(r[0].end_date, 1));
});
test('MySQL chặn khoảng ngày trùng', async () => {
  const m = await member(),
    p = await plan();
  await pay(m, p);
  await assert.rejects(
    () => pay(m, p, { start_date: todayVN() }),
    (e) => e.status === 409,
  );
});
test('MySQL giá hóa đơn giữ nguyên khi sửa gói', async () => {
  const m = await member(),
    p = await plan();
  const payment = await pay(m, p);
  await run({
    action: 'plan.save',
    id: p.id,
    name: 'New price',
    days: 30,
    price: 900000,
  });
  const [r] = await pool.execute('SELECT amount FROM payments WHERE id=?', [
    payment.id,
  ]);
  assert.equal(r[0].amount, 350000);
});
test('MySQL không thu số tiền bị sửa hoặc gói ngừng hoạt động', async () => {
  const m = await member(),
    p = await plan();
  await assert.rejects(() => pay(m, p, { amount: 1 }));
  await run({ action: 'plan.toggle', id: p.id, active: false });
  await assert.rejects(() => pay(m, p));
});
test('MySQL check-in đồng thời và ra vào lại', async () => {
  const m = await member(),
    p = await plan();
  await pay(m, p);
  const r = await Promise.allSettled([
    run({ action: 'checkin.create', member_id: m.id }),
    run({ action: 'checkin.create', member_id: m.id }),
  ]);
  assert.equal(r.filter((x) => x.status === 'fulfilled').length, 1);
  await run({ action: 'checkin.checkout', member_id: m.id });
  await run({ action: 'checkin.create', member_id: m.id });
});
test('MySQL check-in từ chối hết hạn', async () => {
  const m = await member(),
    p = await plan();
  await pay(m, p);
  await pool.execute(
    'UPDATE payments SET start_date=?,end_date=? WHERE member_id=?',
    [addDays(todayVN(), -40), addDays(todayVN(), -1), m.id],
  );
  await assert.rejects(() =>
    run({ action: 'checkin.create', member_id: m.id }),
  );
});
test('MySQL phòng có thiết bị không xóa được', async () => {
  const r = await run({
    action: 'room.save',
    name: 'Integration Room',
    type: 'Gym',
    capacity: 20,
    active: 1,
  });
  const e = await run({
    action: 'equipment.save',
    name: 'Integration Device',
    room_id: r.id,
    quantity: 1,
    purchased_at: '2026-01-01',
    condition: 'Tốt',
  });
  await assert.rejects(() => run({ action: 'room.delete', id: r.id }));
  await run({ action: 'equipment.delete', id: e.id });
  await run({ action: 'room.delete', id: r.id });
});
test('MySQL CRUD HLV', async () => {
  const b = {
    action: 'trainer.save',
    name: 'Integration Trainer',
    phone: phone(),
    specialty: 'Yoga',
    schedule: 'Thứ hai',
    experience: 2,
    active: 1,
  };
  const r = await run(b);
  await run({ ...b, id: r.id, specialty: 'Gym' });
  await run({ action: 'trainer.delete', id: r.id });
});
test('MySQL tài khoản sửa và khóa', async () => {
  const b = {
    action: 'user.save',
    name: 'Integration Staff',
    username: 'it' + Date.now(),
    password: 'Example2026!',
    phone: phone(),
    role: 'STAFF',
    active: 1,
  };
  const r = await run(b);
  await run({ ...b, id: r.id, position: 'Lễ tân' });
  await run({ action: 'user.toggle', id: r.id, active: false });
  const [rows] = await pool.execute(
    'SELECT active,password_hash FROM accounts WHERE id=?',
    [r.id],
  );
  assert.equal(rows[0].active, 0);
  assert(rows[0].password_hash.startsWith('pbkdf2:'));
});
test('MySQL không tự khóa quản trị', async () => {
  await assert.rejects(() =>
    run({ action: 'user.toggle', id: actor.id, active: false }),
  );
});
test('MySQL service kiểm tra actor và role', async () => {
  await assert.rejects(() =>
    transaction(
      (db) => act(db, { action: 'user.save' }, { ...actor, role: 'STAFF' }),
      true,
    ),
  );
  await assert.rejects(() =>
    transaction(
      (db) =>
        act(db, { action: 'checkin.create' }, { ...actor, role: 'UNKNOWN' }),
      true,
    ),
  );
});
test('MySQL khóa ngoại và CHECK thực thi tại DB', async () => {
  await assert.rejects(() =>
    pool.execute(
      'INSERT INTO equipment(id,name,room_id,quantity,purchased_at,`condition`) VALUES(?,?,?,?,?,?)',
      [crypto.randomUUID(), 'Invalid', 'missing', 1, '2026-01-01', 'Tốt'],
    ),
  );
  await assert.rejects(() =>
    pool.execute('INSERT INTO rooms(id,name,type,capacity) VALUES(?,?,?,?)', [
      crypto.randomUUID(),
      'Bad capacity',
      'Gym',
      0,
    ]),
  );
});
