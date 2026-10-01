export type ServiceSchedule = {
  id: string;
  service_id?: string | null;
  service_name?: string;
  date: string;
  status: string;
  member_id: string;
  trainer_id: string;
  trainer_name?: string;
};
export function serviceSummary(
  rows: ServiceSchedule[],
  id: string,
  from: string,
  to: string,
  group: "day" | "month" | "year",
) {
  const selected = rows.filter((r) => r.service_id === id && r.date >= from && r.date <= to);
  const active = selected.filter((r) => r.status === "ACTIVE");
  const buckets = new Map<string, number>();
  const coaches = new Map<string, { name: string; count: number }>();
  for (const r of active) {
    const key = r.date.slice(0, group === "day" ? 10 : group === "month" ? 7 : 4);
    buckets.set(key, (buckets.get(key) || 0) + 1);
    const coach = coaches.get(r.trainer_id) || { name: r.trainer_name || r.trainer_id, count: 0 };
    coach.count++;
    coaches.set(r.trainer_id, coach);
  }
  return {
    total: selected.length,
    active: active.length,
    cancelled: selected.filter((r) => r.status === "CANCELLED").length,
    members: new Set(active.map((r) => r.member_id)).size,
    coaches: coaches.size,
    buckets: [...buckets]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value })),
    trainers: [...coaches.values()]
      .sort((a, b) => b.count - a.count)
      .map((r) => ({ label: r.name, value: r.count })),
  };
}
