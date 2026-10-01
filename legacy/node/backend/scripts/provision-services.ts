import { mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { pool } from '../src/config/database.ts';
import { migrateWorkflows } from '../src/models/migration.model.ts';
import { transaction } from '../src/models/database.model.ts';
import { hashPassword } from '../src/utils/security.ts';
// Explicit setup command only. Never reset an existing user's password.
try {
  await migrateWorkflows();
  const result = await transaction(async (db) => {
    const existing = await db
      .prepare('SELECT role,active FROM accounts WHERE username=?')
      .bind('quanly')
      .first<{ role: string; active: number }>();
    if (existing && (existing.role !== 'MANAGER' || existing.active !== 1))
      throw new Error(
        'Tên quanly đã tồn tại với quyền/trạng thái khác; không tự thay đổi tài khoản.',
      );
    const password = existing
      ? null
      : 'Gym!' + randomBytes(10).toString('base64url') + '9';
    if (password)
      await db
        .prepare(
          'INSERT INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at) VALUES(?,?,?,?,?,?,?,?,1,?)',
        )
        .bind(
          crypto.randomUUID(),
          'Quản lý phòng GYM',
          'quanly',
          await hashPassword(password),
          '',
          '',
          'Quản lý',
          'MANAGER',
          new Date().toISOString(),
        )
        .run();
    let added = 0;
    for (const [key, name] of [
      ['gym', 'Gym'],
      ['yoga', 'Yoga'],
      ['boxing', 'Boxing'],
    ]) {
      let service = await db
        .prepare('SELECT id,deleted FROM services WHERE name=?')
        .bind(name)
        .first<{ id: string; deleted: number }>();
      if (service?.deleted) continue;
      if (!service) {
        service = { id: 'setup-service-' + key, deleted: 0 };
        await db
          .prepare('INSERT INTO services(id,name,description) VALUES(?,?,?)')
          .bind(
            service.id,
            name,
            'Dịch vụ ' +
              name +
              '; quản lý có thể chỉnh sửa mô tả và phân công HLV.',
          )
          .run();
      }
      for (let i = 1; i <= 2; i++) {
        const id = 'setup-trainer-' + key + '-' + i;
        if (
          !(await db
            .prepare('SELECT id FROM trainers WHERE id=?')
            .bind(id)
            .first())
        ) {
          let phone: string;
          do {
            phone =
              '09' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
          } while (
            await db
              .prepare('SELECT id FROM trainers WHERE phone=?')
              .bind(phone)
              .first()
          );
          await db
            .prepare(
              'INSERT INTO trainers(id,code,name,phone,email,specialty,experience,schedule,active,deleted) VALUES(?,?,?,?,?,?,0,?,1,0)',
            )
            .bind(
              id,
              'HLV' + key.toUpperCase() + i,
              'HLV ' + name + ' ' + String(i).padStart(2, '0'),
              phone,
              '',
              name,
              'Hồ sơ mẫu: cập nhật giờ làm việc khi sử dụng thực tế',
            )
            .run();
          added++;
          await db
            .prepare(
              'INSERT INTO trainer_services(trainer_id,service_id) VALUES(?,?)',
            )
            .bind(id, service.id)
            .run();
        }
      }
    }
    return { username: 'quanly', password, trainersAdded: added };
  }, true);
  if (result.password) {
    mkdirSync('outputs', { recursive: true });
    writeFileSync(
      'outputs/tai-khoan-quan-ly.txt',
      `Tên đăng nhập: ${result.username}\nMật khẩu ban đầu: ${result.password}\nQuyền: MANAGER\n`,
    );
  }
  console.log(
    JSON.stringify({
      username: result.username,
      created: !!result.password,
      trainersAdded: result.trainersAdded,
      credentialsFile: result.password
        ? 'outputs/tai-khoan-quan-ly.txt'
        : 'Giữ nguyên mật khẩu hiện có',
    }),
  );
} finally {
  await pool.end();
}
