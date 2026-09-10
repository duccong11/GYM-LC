import type { Database, Statement } from '../src/models/database.model.ts';
import { addDays, todayVN } from '../src/utils/gym.ts';
import { hashPassword } from '../src/utils/security.ts';
export async function seedDemo(db: Database) {
  const today = todayVN(),
    now = new Date().toISOString(),
    commands: Statement[] = [];
  const planData = [
    ['01', 'Gói 1 tháng', 30, 350000],
    ['03', 'Gói 3 tháng', 90, 900000],
    ['06', 'Gói 6 tháng', 180, 1600000],
    ['12', 'Gói 12 tháng', 365, 3000000],
    ['day', 'Gói trải nghiệm', 1, 50000],
  ];
  for (const [key, name, days, price] of planData)
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO plans(id,name,days,price,description) VALUES(?,?,?,?,?)',
        )
        .bind(
          'demo-v2-plan-' + key,
          name,
          days,
          price,
          'Dữ liệu minh họa · Tập tự do',
        ),
    );
  const employeeNames = [
    'Quản trị GYM',
    'Nguyễn Hồng Nhung',
    'Trần Quốc Bảo',
    'Lê Ngọc Mai',
    'Võ Minh Long',
  ];
  for (let i = 0; i < 5; i++) {
    const username = i === 0 ? 'admin' : 'staff' + i;
    const hash = await hashPassword(
      i === 0 ? 'GymAdmin2026!' : 'GymStaff2026!',
    );
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          'demo-v2-user-' + i,
          employeeNames[i],
          username,
          hash,
          '091100000' + i,
          username + '@example.com',
          i === 0 ? 'Quản lý' : 'Lễ tân',
          i === 0 ? 'ADMIN' : 'STAFF',
          1,
          now,
        ),
    );
  }
  const coachNames = [
    'Nguyễn Mạnh Hùng',
    'Trần Thùy Dung',
    'Phạm Gia Huy',
    'Võ Thanh Trúc',
    'Lê Tuấn Anh',
  ];
  for (let i = 0; i < 5; i++) {
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO trainers(id,name,phone,email,specialty,experience,schedule,active) VALUES(?,?,?,?,?,?,?,?)',
        )
        .bind(
          'demo-v2-trainer-' + i,
          coachNames[i],
          '092200000' + i,
          'coach' + i + '@example.com',
          ['Thể hình', 'Yoga', 'Boxing', 'Aerobic', 'Phục hồi'][i],
          i * 2,
          'Thứ 2–Thứ 7, 07:00–16:00',
          i === 4 ? 0 : 1,
        ),
    );
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          'demo-v2-coach-user-' + i,
          coachNames[i],
          'coach' + (i + 1),
          await hashPassword('GymCoach2026!'),
          '092200000' + i,
          'coach' + i + '@example.com',
          'Huấn luyện viên',
          'TRAINER',
          i === 4 ? 0 : 1,
          now,
        ),
    );
  }
  for (let i = 0; i < 4; i++) {
    const name = ['Gym', 'Yoga', 'Boxing', 'Aerobic'][i];
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO rooms(id,name,type,capacity,description) VALUES(?,?,?,?,?)',
        )
        .bind(
          'demo-v2-room-' + i,
          'Phòng ' + name,
          name,
          [50, 20, 15, 30][i],
          'Phòng tập',
        ),
    );
  }
  for (let i = 0; i < 10; i++)
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO equipment(id,name,room_id,quantity,purchased_at,condition) VALUES(?,?,?,?,?,?)',
        )
        .bind(
          'demo-v2-equipment-' + i,
          [
            'Máy chạy bộ',
            'Xe đạp tập',
            'Tạ đơn',
            'Ghế đẩy ngực',
            'Thảm yoga',
            'Bóng tập',
            'Bao cát',
            'Găng boxing',
            'Dây nhảy',
            'Máy kéo xô',
          ][i],
          'demo-v2-room-' + (i % 4),
          i === 0 ? 1 : i + 1,
          addDays(today, -60 - i),
          ['Tốt', 'Đang sử dụng', 'Hỏng', 'Đang bảo trì'][i % 4],
        ),
    );
  const names = [
    'Nguyễn Bảo An',
    'Trần Minh Châu',
    'Lê Hoàng Duy',
    'Phạm Ngọc Hân',
    'Võ Khánh Linh',
    'Đặng Gia Minh',
    'Bùi Thanh Phong',
    'Đỗ Quỳnh Anh',
    'Hồ Quốc Huy',
    'Ngô Phương Thảo',
    'Dương Đức Long',
    'Lý Ngọc Diệp',
    'Mai Tuấn Kiệt',
    'Cao Thùy Trang',
    'Vũ Hải Nam',
  ];
  for (let i = 0; i < 15; i++) {
    const mid = 'demo-v2-member-' + i;
    commands.push(
      db
        .prepare(
          'INSERT IGNORE INTO members(id,name,phone,email,gender,created_at,birth_date,address) VALUES(?,?,?,?,?,?,?,?)',
        )
        .bind(
          mid,
          names[i],
          '09330000' + String(i).padStart(2, '0'),
          'member' + i + '@example.com',
          i % 2 ? 'Nam' : 'Nữ',
          addDays(today, -20) + 'T02:00:00Z',
          '2000-01-' + String(i + 1).padStart(2, '0'),
          'Hồ sơ minh họa',
        ),
    );
    if (i < 13) {
      const p = planData[i % 4],
        days = Number(p[2]);
      const start =
        i < 2
          ? addDays(today, -days - 2)
          : i === 12
            ? addDays(today, 2)
            : i === 11
              ? addDays(today, -days + 1)
              : addDays(today, -5);
      commands.push(
        db
          .prepare(
            'INSERT IGNORE INTO payments(id,member_id,plan_id,plan_name,amount,method,start_date,end_date,created_at,request_id,requested_start) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
          )
          .bind(
            'demo-v2-payment-' + i,
            mid,
            'demo-v2-plan-' + p[0],
            p[1],
            p[3],
            i % 2 ? 'Tiền mặt' : 'Chuyển khoản',
            start,
            addDays(start, days - 1),
            addDays(today, -3) + 'T03:00:00Z',
            'demo-v2-request-' + i,
            start,
          ),
      );
      if (i >= 2 && i < 8)
        commands.push(
          db
            .prepare(
              'INSERT IGNORE INTO checkins(id,member_id,date,created_at,checkout_at) VALUES(?,?,?,?,?)',
            )
            .bind(
              'demo-v2-checkin-' + i,
              mid,
              addDays(today, -1),
              addDays(today, -1) + 'T02:00:00Z',
              addDays(today, -1) + 'T03:00:00Z',
            ),
        );
    }
  }
  await db.batch(commands);
  return {
    ok: true,
    message:
      'Đã bổ sung dữ liệu mẫu. Không thay đổi bản ghi trùng mã hoặc số điện thoại.',
  };
}
