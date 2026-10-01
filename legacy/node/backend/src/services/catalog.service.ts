import type { Database } from "../models/database.model.ts";
import { fail, stringField } from "../utils/validation.ts";
import { todayVN } from "../utils/gym.ts";

export async function serviceAction(db: Database, b: Record<string, unknown>) {
  if (b.action !== "service.save" && b.action !== "service.delete") return null;
  const id = b.id ? stringField(b, "id", "Dịch vụ", 1, 80) : crypto.randomUUID();
  if (
    b.id &&
    !(await db.prepare("SELECT id FROM services WHERE id=? AND deleted=0").bind(id).first())
  )
    fail("Không tìm thấy dịch vụ.", 404);
  if (b.action === "service.delete") {
    if (!b.id) fail("Thiếu dịch vụ cần xóa.");
    if (
      await db
        .prepare(
          "SELECT id FROM schedules WHERE service_id=? AND status='ACTIVE' AND date>=? LIMIT 1",
        )
        .bind(id, todayVN())
        .first()
    )
      fail("Dịch vụ còn lịch tập sắp tới. Hãy hủy hoặc đổi lịch trước.", 409);
    await db.prepare("UPDATE services SET active=0,deleted=1 WHERE id=?").bind(id).run();
    return { ok: true, id };
  }
  const name = stringField(b, "name", "Tên dịch vụ", 2, 100);
  const description = stringField(b, "description", "Mô tả", 0, 500);
  if (![0, 1].includes(b.active as number)) fail("Trạng thái dịch vụ không hợp lệ.");
  if (await db.prepare("SELECT id FROM services WHERE name=? AND id<>?").bind(name, id).first())
    fail("Tên dịch vụ đã tồn tại, kể cả dịch vụ đã lưu trữ.", 409);
  const future = (
    await db
      .prepare(
        "SELECT trainer_id FROM schedules WHERE service_id=? AND status='ACTIVE' AND date>=?",
      )
      .bind(id, todayVN())
      .all<{ trainer_id: string }>()
  ).results;
  if (future.length > 0 && b.active === 0)
    fail("Không thể ngừng dịch vụ hoặc bỏ HLV đang có lịch sắp tới.", 409);
  if (b.id)
    await db
      .prepare("UPDATE services SET name=?,description=?,active=? WHERE id=?")
      .bind(name, description, b.active, id)
      .run();
  else
    await db
      .prepare("INSERT INTO services(id,name,description,active) VALUES(?,?,?,?)")
      .bind(id, name, description, b.active)
      .run();
  return { ok: true, id };
}
