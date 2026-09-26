import { test, expect, type Page } from '@playwright/test';
const unique = () =>
  Date.now().toString().slice(-8) + Math.floor(Math.random() * 10);
async function login(
  page: Page,
  username = 'manager',
  password = 'GymManager2026!',
) {
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập', { exact: true }).fill(username);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Đăng xuất', exact: true }),
  ).toBeVisible();
}
async function api(page: Page, payload: Record<string, unknown>) {
  const auth = await page.request.get('/api/auth');
  const a = await auth.json();
  const r = await page.request.post('/api/gym', {
    headers: { Origin: 'http://127.0.0.1:3100', 'X-CSRF-Token': a.csrf },
    data: payload,
  });
  expect(r.ok(), await r.text()).toBeTruthy();
  return r.json();
}
async function setupMember(page: Page) {
  const u = unique();
  const m = await api(page, {
    action: 'member.save',
    name: 'E2E ' + u,
    phone: '0' + u,
    gender: 'Nam',
  });
  return { id: m.id, name: 'E2E ' + u };
}

test('E2E-14: báo cáo doanh thu ngày/tháng/năm, xuất CSV và kiểm tra khoảng ngày', async ({
  page,
}) => {
  await login(page);
  const state = await (await page.request.get('/api/gym')).json();
  await page.goto('/reports');
  await expect(
    page.getByRole('heading', { name: 'Báo cáo doanh thu', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Năm nay', exact: true }).click();
  const first = state.today.slice(0, 4) + '-01-01';
  const revenue = state.payments
    .filter((p: { created_at: string; cancelled?: number }) => {
      const d = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
      }).format(new Date(p.created_at));
      return !p.cancelled && d >= first && d <= state.today;
    })
    .reduce((n: number, p: { amount: number }) => n + Number(p.amount), 0);
  await expect(page.getByTestId('revenue-total')).toHaveText(
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(revenue),
  );
  for (const group of ['day', 'month', 'year']) {
    await page.getByLabel('Tổng hợp theo').selectOption(group);
    await expect(
      page.getByRole('table', { name: 'Doanh thu theo kỳ' }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole('heading', { name: '3 gói tập được chọn nhiều nhất' }),
  ).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất CSV', exact: true }).click();
  const file = await download;
  expect(file.suggestedFilename()).toContain('Doanh-thu-');
  await file.saveAs('outputs/revenue-report-test.csv');
  await page.screenshot({
    path: 'outputs/revenue-report-desktop.png',
    fullPage: true,
  });
  await page.getByLabel('Từ ngày', { exact: true }).fill('2099-01-01');
  await expect(page.getByRole('alert')).toContainText('đúng thứ tự');
  await expect(
    page.getByRole('button', { name: 'Xuất CSV', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Tháng này', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'outputs/revenue-report-mobile.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test('E2E-15: lịch tuần tạo từ ô ngày, sửa/hủy và chuyển tuần', async ({
  page,
}) => {
  await login(page);
  const u = unique();
  const coach = await api(page, {
    action: 'trainer.save',
    name: 'Calendar coach ' + u,
    phone: '08' + u.slice(-8),
    specialty: 'Gym',
    experience: 2,
    schedule: 'Thứ 2–7',
    active: 1,
  });
  const member = await api(page, {
    action: 'member.save',
    name: 'Calendar member ' + u,
    phone: '07' + u.slice(-8),
    trainer_id: coach.id,
  });
  const room = await api(page, {
    action: 'room.save',
    name: 'Calendar room ' + u,
    type: 'Gym',
    capacity: 5,
    description: '',
    active: 1,
  });
  const plan = await api(page, {
    action: 'plan.save',
    name: 'Calendar plan ' + u,
    days: 1,
    price: 0,
  });
  const state = await (await page.request.get('/api/gym')).json();
  await api(page, {
    action: 'registration.save',
    member_id: member.id,
    plan_id: plan.id,
    start_date: state.today,
  });
  await page.goto('/schedules');
  await page.getByLabel('Lọc huấn luyện viên').selectOption(coach.id);
  await page
    .getByRole('button', {
      name: `Thêm lịch Calendar coach ${u} ngày ${state.today}`,
      exact: true,
    })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByLabel('Huấn luyện viên', { exact: true }),
  ).toHaveValue(coach.id);
  await expect(dialog.getByLabel('Ngày tập', { exact: true })).toHaveValue(
    state.today,
  );
  await dialog.getByLabel('Hội viên', { exact: true }).selectOption(member.id);
  await dialog.getByLabel('Phòng', { exact: true }).selectOption(room.id);
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const card = page
    .locator('.session-card')
    .filter({ hasText: 'Calendar member ' + u });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Sửa', exact: true }).click();
  await dialog.getByLabel('Ghi chú', { exact: true }).fill('Tập sức bền');
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(card).toContainText('Tập sức bền');
  await page.screenshot({
    path: 'outputs/schedule-board-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Kỳ sau', exact: true }).click();
  await expect(card).toHaveCount(0);
  await page.getByRole('button', { name: 'Hôm nay', exact: true }).click();
  await expect(card).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await card.getByRole('button', { name: 'Hủy', exact: true }).click();
  await expect(card).toContainText('Đã hủy');
  await expect(
    card.getByRole('button', { name: 'Sửa', exact: true }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'outputs/schedule-board-mobile.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test('E2E-13: lịch tập gợi ý HLV phụ trách, đổi hội viên và cho phép chọn HLV khác', async ({
  page,
}) => {
  await login(page);
  const u = unique();
  const coachA = await api(page, {
    action: 'trainer.save',
    name: 'Coach A ' + u,
    phone: '08' + u.slice(-8),
    specialty: 'Gym',
    experience: 2,
    schedule: 'Thứ 2–7',
    active: 1,
  });
  const coachB = await api(page, {
    action: 'trainer.save',
    name: 'Coach B ' + u,
    phone: '07' + u.slice(-8),
    specialty: 'Gym',
    experience: 2,
    schedule: 'Thứ 2–7',
    active: 1,
  });
  const memberA = await api(page, {
    action: 'member.save',
    name: 'Assigned A ' + u,
    phone: '06' + u.slice(-8),
    trainer_id: coachA.id,
  });
  const memberB = await api(page, {
    action: 'member.save',
    name: 'Assigned B ' + u,
    phone: '05' + u.slice(-8),
    trainer_id: coachB.id,
  });
  const unassigned = await setupMember(page);
  const room = await api(page, {
    action: 'room.save',
    name: 'Schedule room ' + u,
    type: 'Gym',
    capacity: 5,
    description: '',
    active: 1,
  });
  const plan = await api(page, {
    action: 'plan.save',
    name: 'Schedule plan ' + u,
    days: 1,
    price: 0,
  });
  const initial = await (await page.request.get('/api/gym')).json();
  await api(page, {
    action: 'registration.save',
    member_id: memberA.id,
    plan_id: plan.id,
    start_date: initial.today,
  });
  await page.goto('/schedules');
  await page
    .getByRole('button', { name: 'Thêm lịch tập', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  const member = dialog.getByLabel('Hội viên', { exact: true });
  const trainer = dialog.getByLabel('Huấn luyện viên', { exact: true });
  await member.selectOption(memberA.id);
  await expect(trainer).toHaveValue(coachA.id);
  await member.selectOption(memberB.id);
  await expect(trainer).toHaveValue(coachB.id);
  await member.selectOption(unassigned.id);
  await expect(trainer).toHaveValue('');
  await member.selectOption(memberA.id);
  await trainer.selectOption(coachB.id);
  await dialog.getByLabel('Phòng', { exact: true }).selectOption(room.id);
  await dialog.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const saved = await (await page.request.get('/api/gym')).json();
  expect(
    saved.schedules.find(
      (row: { member_id: string }) => row.member_id === memberA.id,
    ).trainer_id,
  ).toBe(coachB.id);
  expect(
    saved.members.find((row: { id: string }) => row.id === memberA.id)
      .trainer_id,
  ).toBe(coachA.id);
  await page.getByLabel('Tìm kiếm', { exact: true }).fill('Assigned A ' + u);
  await page.getByRole('button', { name: 'Sửa', exact: true }).click();
  await expect(
    dialog.getByLabel('Huấn luyện viên', { exact: true }),
  ).toHaveValue(coachB.id);
});
test('E2E-01: đăng nhập và thêm hội viên từ biểu mẫu', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Hội viên', exact: true }).click();
  await page
    .getByRole('button', { name: 'Thêm hội viên', exact: true })
    .click();
  const modal = page.getByRole('dialog'),
    u = unique();
  await modal
    .getByLabel('Họ và tên *', { exact: true })
    .fill('Hội viên UI ' + u);
  await modal.getByLabel('Số điện thoại *', { exact: true }).fill('0' + u);
  await modal.getByLabel('Ngày sinh', { exact: true }).fill('2000-01-01');
  await modal.getByLabel('Địa chỉ', { exact: true }).fill('Hà Nội');
  await modal
    .getByLabel('HLV phụ trách', { exact: true })
    .selectOption('demo-v2-trainer-0');
  await modal
    .getByRole('button', { name: 'Lưu thông tin', exact: true })
    .click();
  await expect(modal).not.toBeVisible();
  await page.getByLabel('Tìm hội viên', { exact: true }).fill(u);
  await expect(
    page.getByRole('button', { name: 'Hội viên UI ' + u, exact: true }),
  ).toBeVisible();
  const saved = await (await page.request.get('/api/gym')).json();
  expect(
    saved.members.find((m: { name: string }) => m.name === 'Hội viên UI ' + u)
      .trainer_id,
  ).toBe('demo-v2-trainer-0');
});
test('E2E-02: đăng ký và thu tiền qua giao diện', async ({ page }) => {
  await login(page);
  const m = await setupMember(page);
  await page.goto('/registrations');
  await page.getByRole('button', { name: 'Thêm đăng ký', exact: true }).click();
  let d = page.getByRole('dialog');
  await d.getByLabel('Hội viên', { exact: true }).selectOption(m.id);
  await d
    .getByLabel('Gói tập', { exact: true })
    .selectOption('demo-v2-plan-01');
  await d.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(d).not.toBeVisible();
  const data = await (await page.request.get('/api/gym')).json();
  const reg = data.registrations.find(
    (r: { member_id: string }) => r.member_id === m.id,
  );
  await page.getByRole('button', { name: 'Thanh toán', exact: true }).click();
  await page
    .getByRole('button', { name: 'Thêm thanh toán', exact: true })
    .click();
  d = page.getByRole('dialog');
  await d
    .getByLabel('Đăng ký chờ thanh toán', { exact: true })
    .selectOption(reg.id);
  await d.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(d).not.toBeVisible();
  await page.getByLabel('Tìm kiếm', { exact: true }).fill(m.name);
  await expect(
    page.getByRole('cell', { name: m.name, exact: true }),
  ).toBeVisible();
});
test('E2E-03: check-in, check-out, vào lại', async ({ page }) => {
  await login(page);
  const m = await setupMember(page);
  await api(page, {
    action: 'payment.create',
    member_id: m.id,
    plan_id: 'demo-v2-plan-01',
    method: 'Tiền mặt',
    request_id: crypto.randomUUID(),
  });
  await page.goto('/checkins');
  await page.getByLabel('Tìm hội viên điểm danh').fill(m.name);
  await page.getByRole('button', { name: 'Check-in', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Check-out', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Check-out', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Check-in', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Check-in', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Check-out', exact: true }),
  ).toBeVisible();
});
test('E2E-04: gia hạn hiển thị thời hạn nối tiếp', async ({ page }) => {
  await login(page);
  const m = await setupMember(page);
  await api(page, {
    action: 'payment.create',
    member_id: m.id,
    plan_id: 'demo-v2-plan-01',
    method: 'Tiền mặt',
    request_id: crypto.randomUUID(),
  });
  await page.goto('/members');
  await page.getByLabel('Tìm hội viên', { exact: true }).fill(m.name);
  await page.getByRole('button', { name: 'Gia hạn', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('combobox', { name: 'Gói tập *', exact: true })
    .selectOption('demo-v2-plan-01');
  await page
    .getByRole('button', { name: 'Xác nhận đã thu tiền', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const r = await page.request.get('/api/gym');
  const data = await r.json();
  const list = data.payments
    .filter((p: { member_id: string }) => p.member_id === m.id)
    .sort((a: { start_date: string }, b: { start_date: string }) =>
      a.start_date.localeCompare(b.start_date),
    );
  expect(list).toHaveLength(2);
  expect(
    (Date.parse(list[1].start_date) - Date.parse(list[0].end_date)) / 86400000,
  ).toBe(1);
});
test('E2E-05: thêm thiết bị rồi chuyển bảo trì', async ({ page }) => {
  await login(page);
  await page.goto('/equipment');
  await page.getByRole('button', { name: 'Thêm mới', exact: true }).click();
  const d = page.getByRole('dialog'),
    name = 'Thiết bị UI ' + unique();
  await d.getByLabel('Tên thiết bị *', { exact: true }).fill(name);
  await d
    .getByRole('combobox', { name: 'Phòng *', exact: true })
    .selectOption('demo-v2-room-0');
  await d.getByLabel('Ngày mua *', { exact: true }).fill('2026-01-01');
  await d.getByRole('button', { name: 'Lưu thông tin' }).click();
  await expect(d).not.toBeVisible();
  await page.getByLabel('Tìm Thiết bị').fill(name);
  await page.getByRole('button', { name: 'Sửa ' + name, exact: true }).click();
  await d
    .getByRole('combobox', { name: 'Tình trạng', exact: true })
    .selectOption('Đang bảo trì');
  await d.getByRole('button', { name: 'Lưu thông tin' }).click();
  await expect(d).not.toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Đang bảo trì', exact: true }),
  ).toBeVisible();
});
test('E2E-06: CRUD huấn luyện viên', async ({ page }) => {
  await login(page);
  await page.goto('/trainers');
  await page.getByRole('button', { name: 'Thêm mới', exact: true }).click();
  const d = page.getByRole('dialog'),
    u = unique(),
    name = 'HLV UI ' + u;
  await d.getByLabel('Họ tên *', { exact: true }).fill(name);
  await d.getByLabel('Số điện thoại *', { exact: true }).fill('0' + u);
  await d.getByLabel('Chuyên môn *', { exact: true }).fill('Yoga');
  await d.getByLabel('Lịch làm việc *', { exact: true }).fill('Thứ 2–6');
  await d.getByRole('button', { name: 'Lưu thông tin' }).click();
  await expect(d).not.toBeVisible();
  await page.getByLabel('Tìm Huấn luyện viên').fill(name);
  await page.getByRole('button', { name: 'Xóa ' + name, exact: true }).click();
  await d.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click();
  await expect(d).not.toBeVisible();
  await expect(
    page.getByText('Không tìm thấy dữ liệu phù hợp.', { exact: true }),
  ).toBeVisible();
});
test('E2E-07: lưu trữ và khôi phục hội viên', async ({ page }) => {
  await login(page);
  const m = await setupMember(page);
  await page.goto('/members');
  await page.getByLabel('Tìm hội viên', { exact: true }).fill(m.name);
  await page
    .getByRole('button', { name: 'Xóa ' + m.name, exact: true })
    .click();
  await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByLabel('Lọc trạng thái hội viên').selectOption('Đã lưu trữ');
  await page.getByRole('button', { name: 'Khôi phục', exact: true }).click();
  await page.getByLabel('Lọc trạng thái hội viên').selectOption('');
  await expect(
    page.getByRole('button', { name: m.name, exact: true }),
  ).toBeVisible();
});
test('E2E-08: HLV bị chặn URL quản trị và giao dịch', async ({ page }) => {
  await login(page, 'coach1', 'GymCoach2026!');
  await expect(
    page.getByRole('button', { name: 'Nhân viên', exact: true }),
  ).toHaveCount(0);
  await page.goto('/admin/users');
  await expect(
    page.getByRole('heading', { name: '403 · Không có quyền truy cập' }),
  ).toBeVisible();
  const a = await (await page.request.get('/api/auth')).json();
  const r = await page.request.post('/api/gym', {
    headers: { Origin: 'http://127.0.0.1:3100', 'X-CSRF-Token': a.csrf },
    data: { action: 'payment.create' },
  });
  expect(r.status()).toBe(403);
});
test('E2E-09: đăng xuất làm mất phiên và chặn URL', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  expect((await page.request.get('/api/gym')).status()).toBe(401);
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/login/);
});
test('E2E-10: tìm kiếm, phân trang, CSV và màn hình điện thoại', async ({
  page,
}) => {
  await login(page);
  await page.goto('/members');
  await page.getByRole('button', { name: 'Sau', exact: true }).click();
  await expect(page.getByText(/Trang 2 \//)).toBeVisible();
  await page
    .getByLabel('Tìm hội viên', { exact: true })
    .fill('không-tồn-tại-xyz');
  await expect(
    page.getByText('Không tìm thấy hội viên phù hợp.', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Tìm hội viên', { exact: true }).fill('');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất CSV', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('hoi-vien-gym-lc.csv');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole('button', { name: 'Thêm hội viên', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: 'outputs/mobile-members.png', fullPage: true });
});
test('E2E-11: sai mật khẩu và trường bắt buộc', async ({ page }) => {
  await page.goto('/login');
  await page
    .getByLabel('Tên đăng nhập', { exact: true })
    .fill('invalid-ui-account');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Wrong2026!');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('không đúng');
  await expect(page).toHaveURL(/\/login/);
});
test('E2E-12: ảnh tổng quan và không lỗi JavaScript', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await login(page);
  await expect(page.getByText('Doanh thu năm', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'outputs/dashboard.png', fullPage: true });
  expect(errors).toEqual([]);
});
