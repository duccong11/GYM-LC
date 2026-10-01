import type { Database } from "../models/database.model.ts";
import { fail } from "../utils/validation.ts";
import { todayVN } from "../utils/gym.ts";
export async function trainerAssignments(db: Database, b: Record<string, unknown>) {
  if (
    !Array.isArray(b.service_ids) ||
    !b.service_ids.length ||
    b.service_ids.length > 200 ||
    b.service_ids.some((x) => typeof x !== "string" || !x || x.length > 80)
  )
    fail("Chọn ít nhất một dịch vụ giảng dạy.");
  const ids = [...new Set(b.service_ids as string[])],
    names: string[] = [];
  for (const id of ids) {
    const s = await db
      .prepare("SELECT name,active FROM services WHERE id=? AND deleted=0")
      .bind(id)
      .first<{ name: string; active: number }>();
    if (!s) fail("Dịch vụ không tồn tại.");
    if (
      !s!.active &&
      !(
        b.id &&
        (await db
          .prepare("SELECT trainer_id FROM trainer_services WHERE trainer_id=? AND service_id=?")
          .bind(String(b.id), id)
          .first())
      )
    )
      fail("Không thể phân công mới dịch vụ đã ngừng.");
    names.push(s!.name);
  }
  if (b.id) {
    const future = (
      await db
        .prepare(
          "SELECT service_id FROM schedules WHERE trainer_id=? AND status='ACTIVE' AND date>=?",
        )
        .bind(String(b.id), todayVN())
        .all<{ service_id: string }>()
    ).results;
    if (future.some((r) => !ids.includes(r.service_id)))
      fail("HLV còn lịch sắp tới của dịch vụ bị bỏ chọn. Hãy chuyển hoặc hủy lịch trước.", 409);
  }
  return { ids, label: names.join(", ").slice(0, 120) };
}
