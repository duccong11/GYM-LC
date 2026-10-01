import type { Database } from "../models/database.model.ts";
import { dateField, fail, integerField, stringField } from "../utils/validation.ts";
import { todayVN } from "../utils/gym.ts";

export function discountedPrice(price: number, percent: number) {
  if (
    !Number.isInteger(price) ||
    price < 0 ||
    !Number.isInteger(percent) ||
    percent < 0 ||
    percent > 100
  )
    fail("Giá hoặc phần trăm giảm không hợp lệ.");
  return Math.round((price * (100 - percent)) / 100);
}
export async function quotePromotion(db: Database, price: number) {
  const day = todayVN();
  const promotion = await db
    .prepare(
      "SELECT * FROM promotions WHERE deleted=0 AND active=1 AND start_date<=? AND end_date>=? ORDER BY percent DESC,id LIMIT 1",
    )
    .bind(day, day)
    .first<{ id: string; name: string; percent: number }>();
  return {
    price: discountedPrice(price, promotion?.percent || 0),
    original_price: price,
    discount_percent: promotion?.percent || 0,
    promotion_name: promotion?.name || "",
  };
}
export async function promotionAction(db: Database, b: Record<string, unknown>) {
  if (!["promotion.save", "promotion.delete"].includes(String(b.action))) return null;
  const id = b.id ? stringField(b, "id", "Khuyến mãi", 1, 80) : crypto.randomUUID();
  if (
    b.id &&
    !(await db.prepare("SELECT id FROM promotions WHERE id=? AND deleted=0").bind(id).first())
  )
    fail("Không tìm thấy khuyến mãi.", 404);
  if (b.action === "promotion.delete") {
    if (!b.id) fail("Thiếu khuyến mãi cần xóa.");
    await db.prepare("UPDATE promotions SET deleted=1,active=0 WHERE id=?").bind(id).run();
  } else {
    const name = stringField(b, "name", "Tên khuyến mãi", 2, 100);
    const percent = integerField(b, "percent", "Phần trăm giảm", 1, 100);
    const start = dateField(b.start_date),
      end = dateField(b.end_date);
    if (end < start) fail("Ngày kết thúc phải từ ngày bắt đầu trở đi.");
    const active = integerField(b, "active", "Trạng thái", 0, 1);
    if (b.id)
      await db
        .prepare(
          "UPDATE promotions SET name=?,percent=?,start_date=?,end_date=?,active=? WHERE id=?",
        )
        .bind(name, percent, start, end, active, id)
        .run();
    else
      await db
        .prepare(
          "INSERT INTO promotions(id,name,percent,start_date,end_date,active) VALUES(?,?,?,?,?,?)",
        )
        .bind(id, name, percent, start, end, active)
        .run();
  }
  return { ok: true, id };
}
