import test, { before, after } from 'node:test';
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
const { todayVN, addDays } = await import('../../backend/src/utils/gym.ts');
assert.equal(config.database.database, 'quan_ly_phong_gym_test');
const run = (body, role = 'MANAGER') =>
  transaction((db) => act(db, body, { id: 'test', role }), true);
const phone = () =>
  '09' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
let coach, other, service, member, room, body;
before(async () => {
  await migrateWorkflows();
  const base = {
    action: 'trainer.save',
    phone: phone(),
    name: 'Service test coach',
    specialty: 'Gym',
    experience: 1,
    schedule: 'Theo lịch',
    active: 1,
  };
  coach = await run(base);
  other = await run({ ...base, phone: phone(), name: 'Yoga coach' });
  service = await run({
    action: 'service.save',
    name: 'Gym test ' + crypto.randomUUID(),
    description: 'Kiểm thử',
    active: 1,
    trainer_ids: [coach.id],
  });
  member = await run({
    action: 'member.save',
    name: 'Service test member',
    phone: phone(),
  });
  room = await run({
    action: 'room.save',
    name: 'Service test room',
    type: 'Gym',
    capacity: 10,
    active: 1,
  });
  const plan = await run({
    action: 'plan.save',
    name: 'Service test free plan',
    days: 30,
    price: 0,
  });
  await run({
    action: 'registration.save',
    member_id: member.id,
    plan_id: plan.id,
    start_date: todayVN(),
  });
  body = {
    action: 'schedule.save',
    member_id: member.id,
    trainer_id: coach.id,
    room_id: room.id,
    service_id: service.id,
    date: addDays(todayVN(), 1),
    start_time: '09:00',
    end_time: '10:00',
  };
});
after(async () => {
  await pool.end();
});
test('Chỉ quản lý được thêm/sửa dịch vụ; nhân viên đọc, admin không đọc nghiệp vụ', async () => {
  for (const role of ['STAFF', 'ADMIN', 'TRAINER', 'MEMBER'])
    await assert.rejects(
      () => run({ action: 'service.save' }, role),
      (e) => e.status === 403,
    );
  const staff = await transaction((db) => snapshot(db, { role: 'STAFF' }));
  assert(staff.services.some((s) => s.id === service.id));
  assert(
    staff.trainerServices.some(
      (s) => s.service_id === service.id && s.trainer_id === coach.id,
    ),
  );
  const admin = await transaction((db) => snapshot(db, { role: 'ADMIN' }));
  assert.equal(admin.services.length, 0);
});
test('Từ chối HLV sai dịch vụ, dịch vụ không tồn tại, thiếu dịch vụ', async () => {
  await assert.rejects(
    () => run({ ...body, trainer_id: other.id }),
    (e) => e.status === 400,
  );
  await assert.rejects(
    () => run({ ...body, service_id: 'missing' }),
    (e) => e.status === 400,
  );
  await assert.rejects(
    () => run({ ...body, service_id: '' }),
    (e) => e.status === 400,
  );
});
test('Đăng ký thời gian: chống trùng HLV/hội viên/phòng; cho phép hai buổi nối tiếp', async () => {
  const first = await run(body, 'STAFF');
  const [stored] = await pool.query(
    'SELECT service_id FROM schedules WHERE id=?',
    [first.id],
  );
  assert.equal(stored[0].service_id, service.id);
  await assert.rejects(
    () => run({ ...body, start_time: '09:30', end_time: '10:30' }),
    (e) => e.status === 409,
  );
  await run({ ...body, start_time: '10:00', end_time: '11:00' });
  await assert.rejects(
    () => run({ action: 'service.delete', id: service.id }),
    (e) => e.status === 409,
  );
  await assert.rejects(
    () =>
      run({
        action: 'service.save',
        id: service.id,
        name: 'Changed service',
        description: '',
        active: 1,
        trainer_ids: [],
      }),
    (e) => e.status === 409,
  );
  await assert.rejects(
    () =>
      run({
        action: 'service.save',
        id: service.id,
        name: 'Changed service',
        description: '',
        active: 0,
        trainer_ids: [coach.id],
      }),
    (e) => e.status === 409,
  );
});
test('Dịch vụ nhiều HLV, tên trùng và lưu trữ dịch vụ không có lịch', async () => {
  const name = 'Yoga test ' + crypto.randomUUID();
  const s = await run({
    action: 'service.save',
    name,
    description: '',
    active: 1,
    trainer_ids: [coach.id, other.id, coach.id],
  });
  const [links] = await pool.query(
    'SELECT trainer_id FROM trainer_services WHERE service_id=?',
    [s.id],
  );
  assert.equal(links.length, 2);
  await assert.rejects(
    () =>
      run({
        action: 'service.save',
        name,
        description: '',
        active: 1,
        trainer_ids: [],
      }),
    (e) => e.status === 409,
  );
  await run({ action: 'service.delete', id: s.id });
  await assert.rejects(
    () =>
      run({
        ...body,
        service_id: s.id,
        start_time: '11:00',
        end_time: '12:00',
      }),
    (e) => e.status === 400,
  );
});

test('Nhân viên bị chặn sửa thiết bị ngay tại máy chủ', async () => {
  await assert.rejects(run({action: 'equipment.save'}, 'STAFF'), e => e.status === 403);
});
