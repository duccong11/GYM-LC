import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
process.env.GYM_TEST_MODE = '1';
const { pool } = await import('../../backend/src/config/database.ts');
const { config } = await import('../../backend/src/config/env.ts');
const { transaction } =
  await import('../../backend/src/models/database.model.ts');
const { migrateWorkflows } =
  await import('../../backend/src/models/migration.model.ts');
const { act } = await import('../../backend/src/services/gym.service.ts');
const { snapshot } = await import('../../backend/src/models/gym.model.ts');
const { todayVN } = await import('../../backend/src/utils/gym.ts');
const { app } = await import('../../backend/src/app.ts');
assert.equal(config.database.database, 'quan_ly_phong_gym_test');
let server, base, m, p, t, r, reg, payment, schedule;
const actor = {
  id: 'demo-v2-user-0',
  name: 'Test',
  role: 'MANAGER',
  active: 1,
};
const run = (b, role = 'MANAGER') =>
  transaction((db) => act(db, b, { ...actor, role }), true);
const phone = () =>
  '09' +
  String(crypto.getRandomValues(new Uint32Array(1))[0])
    .padStart(8, '0')
    .slice(-8);
const rejected = (fn, status) => assert.rejects(fn, (e) => e.status === status);
before(async () => {
  await migrateWorkflows();
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
});
test('Actor: ADMIN chỉ quản trị, MANAGER không quản lý tài khoản, HLV không thu tiền', async () => {
  for (const [role, action] of [
    ['ADMIN', 'member.save'],
    ['ADMIN', 'payment.create'],
    ['MANAGER', 'user.save'],
    ['STAFF', 'payment.delete'],
    ['TRAINER', 'schedule.save'],
    ['MEMBER', 'registration.save'],
  ])
    await rejected(() => run({ action }, role), 403);
  const admin = await transaction((db) =>
    snapshot(db, { ...actor, role: 'ADMIN' }),
  );
  assert.equal(admin.members.length, 0);
  assert.equal(admin.payments.length, 0);
  assert.equal(admin.schedules.length, 0);
  assert(admin.users.length > 0);
  const manager = await transaction((db) => snapshot(db, actor));
  assert.equal(manager.users.length, 0);
  assert.equal(manager.audit.length, 0);
});
test('UC-MEM/PKG/TRN: dữ liệu nền và mã duy nhất', async () => {
  m = await run({
    action: 'member.save',
    name: 'Workflow member',
    phone: phone(),
    email: 'flow' + crypto.randomUUID() + '@example.test',
  });
  p = await run({
    action: 'plan.save',
    name: 'Workflow plan',
    price: 350000,
    days: 30,
  });
  t = await run({
    action: 'trainer.save',
    name: 'Workflow trainer',
    phone: phone(),
    specialty: 'Gym',
    experience: 2,
    schedule: 'Thứ 2–7',
    active: 1,
  });
  r = await run({
    action: 'room.save',
    name: 'Workflow room',
    type: 'Gym',
    capacity: 20,
    active: 1,
  });
  const [rows] = await pool.query('SELECT code FROM members WHERE id=?', [
    m.id,
  ]);
  assert.match(rows[0].code, /^HV[A-Z0-9]+$/);
  await rejected(
    () =>
      run({
        action: 'member.save',
        name: 'Duplicate',
        phone: phone(),
        code: rows[0].code,
      }),
    409,
  );
  await rejected(
    () =>
      run({
        action: 'member.save',
        name: 'Bad code',
        phone: phone(),
        code: 'A!',
      }),
    400,
  );
});
test('UC-REG: chờ thanh toán không check-in; không đăng ký trùng', async () => {
  reg = await run(
    {
      action: 'registration.save',
      member_id: m.id,
      plan_id: p.id,
      start_date: todayVN(),
    },
    'STAFF',
  );
  await rejected(
    () => run({ action: 'checkin.create', member_id: m.id }, 'STAFF'),
    400,
  );
  await rejected(
    () =>
      run({
        action: 'registration.save',
        member_id: m.id,
        plan_id: p.id,
        start_date: todayVN(),
      }),
    409,
  );
});
test('UC-PAY: thu tiền, gửi lại không tạo thêm, đăng ký đã thu không sửa', async () => {
  const body = {
    code:
      'TT' + crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase(),
    action: 'payment.create',
    registration_id: reg.id,
    method: 'Tiền mặt',
    request_id: crypto.randomUUID(),
  };
  payment = await run(body, 'STAFF');
  assert.equal((await run(body, 'STAFF')).id, payment.id);
  await rejected(
    () =>
      run({
        action: 'registration.save',
        id: reg.id,
        member_id: m.id,
        plan_id: p.id,
        start_date: todayVN(),
      }),
    409,
  );
  await rejected(
    () =>
      run({
        action: 'payment.update',
        id: payment.id,
        method: 'Tiền mặt',
        amount: 1,
      }),
    409,
  );
});
test('UC-SCH: thời lượng, trùng lịch và bảo vệ bản ghi đang tham chiếu', async () => {
  const body = {
    action: 'schedule.save',
    member_id: m.id,
    trainer_id: t.id,
    room_id: r.id,
    date: todayVN(),
    start_time: '08:00',
    end_time: '09:00',
  };
  await rejected(() => run({ ...body, end_time: '08:15' }), 400);
  schedule = await run(body, 'STAFF');
  await rejected(
    () => run({ ...body, start_time: '08:30', end_time: '09:30' }),
    409,
  );
  await rejected(() => run({ action: 'trainer.delete', id: t.id }), 409);
  await rejected(() => run({ action: 'room.delete', id: r.id }), 409);
  await rejected(
    () =>
      run({ action: 'payment.delete', id: payment.id, reason: 'Test cancel' }),
    409,
  );
  const adjacent = await run({
    ...body,
    start_time: '09:00',
    end_time: '09:30',
  });
  await run({ action: 'schedule.delete', id: adjacent.id });
});
test('Phạm vi dữ liệu: hội viên chỉ thấy mình, HLV chỉ thấy lịch được giao', async () => {
  const member = await transaction((db) =>
    snapshot(db, { ...actor, role: 'MEMBER', member_id: m.id }),
  );
  assert.deepEqual(
    member.members.map((x) => x.id),
    [m.id],
  );
  assert(member.schedules.every((x) => x.member_id === m.id));
  assert(member.payments.every((x) => x.amount === 0));
  assert.equal(member.users.length, 0);
  const trainer = await transaction((db) =>
    snapshot(db, { ...actor, role: 'TRAINER', trainer_id: t.id }),
  );
  assert.deepEqual(
    trainer.members.map((x) => x.id),
    [m.id],
  );
  assert(trainer.schedules.every((x) => x.trainer_id === t.id));
  const unlinked = await transaction((db) =>
    snapshot(db, { ...actor, role: 'TRAINER' }),
  );
  assert.equal(unlinked.members.length, 0);
  assert.equal(unlinked.schedules.length, 0);
});
test('UC-PAY/STS: hủy có lý do, loại khỏi doanh thu và chặn check-in', async () => {
  await run({ action: 'schedule.delete', id: schedule.id });
  await run({
    action: 'payment.delete',
    id: payment.id,
    reason: 'Hủy theo yêu cầu hội viên',
  });
  const [rows] = await pool.query(
    'SELECT cancelled,cancellation_reason FROM payments WHERE id=?',
    [payment.id],
  );
  assert.equal(rows[0].cancelled, 1);
  assert(rows[0].cancellation_reason.includes('hội viên'));
  const data = await transaction((db) => snapshot(db, actor));
  assert(!data.payments.some((x) => x.id === payment.id));
  await rejected(() => run({ action: 'checkin.create', member_id: m.id }), 400);
});
test('AUTH API: chống tự cấp quyền, đăng ký hội viên và phạm vi REST', async () => {
  const body = {
    action: 'register',
    name: 'Public member',
    username: 'u' + crypto.randomUUID().replaceAll('-', '').slice(0, 15),
    phone: phone(),
    email: 'u' + crypto.randomUUID() + '@example.test',
    password: 'GymTest2026!',
    confirm_password: 'GymTest2026!',
  };
  const send = (payload, cookie = '', csrf = '') =>
    fetch(base + '/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: config.origins[0],
        Cookie: cookie,
        'X-CSRF-Token': csrf,
      },
      body: JSON.stringify(payload),
    });
  assert.equal((await send({ ...body, role: 'ADMIN' })).status, 403);
  assert.equal((await send(body)).status, 201);
  const login = await send({
    action: 'login',
    username: body.email,
    password: body.password,
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0],
    auth = await login.json();
  assert.equal(auth.user.role, 'MEMBER');
  const data = await (
    await fetch(base + '/api/gym', { headers: { Cookie: cookie } })
  ).json();
  assert.equal(data.members.length, 1);
  assert.equal(
    (await fetch(base + '/api/users', { headers: { Cookie: cookie } })).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + '/api/members/' + m.id, {
        headers: { Cookie: cookie },
      })
    ).status,
    404,
  );
  assert.equal(
    (await send({ action: 'logout' }, cookie, auth.csrf)).status,
    200,
  );
  assert.equal(
    (await fetch(base + '/api/gym', { headers: { Cookie: cookie } })).status,
    401,
  );
});

test('Gói miễn phí kích hoạt đăng ký, không tạo doanh thu; hủy thu hồi quyền tập', async () => {
  const freeMember = await run({
    action: 'member.save',
    name: 'Free member',
    phone: phone(),
  });
  const freePlan = await run({
    action: 'plan.save',
    name: 'Free plan',
    days: 1,
    price: 0,
  });
  const freeReg = await run({
    action: 'registration.save',
    member_id: freeMember.id,
    plan_id: freePlan.id,
    start_date: todayVN(),
  });
  const state = await transaction((db) => snapshot(db, actor));
  assert(state.entitlements.some((x) => x.member_id === freeMember.id));
  assert(!state.payments.some((x) => x.member_id === freeMember.id));
  await run({ action: 'checkin.create', member_id: freeMember.id });
  await rejected(
    () => run({ action: 'registration.delete', id: freeReg.id }),
    409,
  );
  await run({ action: 'checkin.checkout', member_id: freeMember.id });
  await run({ action: 'registration.delete', id: freeReg.id });
  await rejected(
    () => run({ action: 'checkin.create', member_id: freeMember.id }),
    400,
  );
});
