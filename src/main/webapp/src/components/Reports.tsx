import { useState } from "react";
import "../styles/reports.css";
import RevenueReport from "./RevenueReport";
import ReportChart from "./ChartVisual";
import { serviceSummary, type ServiceSchedule } from "../utils/serviceReports";
import { type Receipt, type Enrollment, type ReportGroup } from "../utils/reports";
import { dateLabel } from "../utils/gym";
type Service = { id: string; name: string; active: number; deleted?: number };
export default function Reports({
  payments,
  registrations,
  today,
  services,
  schedules,
}: {
  payments: Receipt[];
  registrations: Enrollment[];
  today: string;
  services: Service[];
  schedules: ServiceSchedule[];
}) {
  const [selected, setSelected] = useState(""),
    [from, setFrom] = useState(today.slice(0, 7) + "-01"),
    [to, setTo] = useState(today),
    [group, setGroup] = useState<ReportGroup>("day");
  const options = new Map(services.map((s) => [s.id, s]));
  for (const r of schedules)
    if (r.service_id && !options.has(r.service_id))
      options.set(r.service_id, {
        id: r.service_id,
        name: r.service_name || "Dịch vụ cũ",
        active: 0,
        deleted: 1,
      });
  const current = options.get(selected);
  const valid =
    !!from &&
    !!to &&
    from <= to &&
    Number.isFinite(Date.parse(from)) &&
    Number.isFinite(Date.parse(to)) &&
    Date.parse(to) - Date.parse(from) <= 3660 * 86400000;
  const report = valid && current ? serviceSummary(schedules, selected, from, to, group) : null;
  const period = (s: string) =>
    s.length === 10 ? dateLabel(s) : s.length === 7 ? s.slice(5) + "/" + s.slice(0, 4) : s;
  function download() {
    if (!report || !current) return;
    const rows = [
      ["Dịch vụ", current.name],
      ["Từ ngày", from],
      ["Đến ngày", to],
      ["Lịch còn hiệu lực", report.active],
      ["Lịch hủy", report.cancelled],
      ["Hội viên", report.members],
      [],
      ["Kỳ", "Số buổi theo lịch"],
      ...report.buckets.map((r) => [r.label, r.value]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        [
          "\ufeff" +
            rows
              .map((r) =>
                r
                  .map(
                    (v) =>
                      '"' +
                      String(v)
                        .replace(/^[\s]*[=+@-]/, "'$&")
                        .replaceAll('"', '""') +
                      '"',
                  )
                  .join(","),
              )
              .join("\r\n"),
        ],
        { type: "text/csv;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao-cao-dich-vu-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="reports-layout">
      <nav className="report-service-menu" aria-label="Menu báo cáo dịch vụ">
        <h3>Báo cáo</h3>
        <button aria-current={!current ? "page" : undefined} onClick={() => setSelected("")}>
          Tổng quan doanh thu
        </button>
        {[...options.values()]
          .sort((a, b) => a.name.localeCompare(b.name, "vi"))
          .map((s) => (
            <button
              key={s.id}
              aria-current={selected === s.id ? "page" : undefined}
              onClick={() => setSelected(s.id)}
            >
              {s.name}
              {s.deleted ? " · Lưu trữ" : !s.active ? " · Đã ngừng" : ""}
            </button>
          ))}
        {!options.size && <p>Thêm dịch vụ để có báo cáo riêng.</p>}
      </nav>
      <div className="reports-content">
        {!current ? (
          <RevenueReport payments={payments} registrations={registrations} today={today} />
        ) : (
          <article className="panel workflow-panel">
            <div className="report-heading">
              <div>
                <p className="muted">BÁO CÁO DỊCH VỤ</p>
                <h2>Báo cáo {current.name}</h2>
                <p>Theo ngày tập. Số buổi là lịch đã đặt, chưa xác nhận hội viên đã tham dự.</p>
              </div>
              <div className="row-actions">
                <button disabled={!report} onClick={download}>
                  Xuất CSV
                </button>
                <button disabled={!report} onClick={() => window.print()}>
                  In / Lưu PDF
                </button>
              </div>
            </div>
            <div className="toolbar">
              <button
                onClick={() => {
                  setFrom(today);
                  setTo(today);
                  setGroup("day");
                }}
              >
                Hôm nay
              </button>
              <button
                onClick={() => {
                  setFrom(today.slice(0, 7) + "-01");
                  setTo(today);
                  setGroup("day");
                }}
              >
                Tháng này
              </button>
              <button
                onClick={() => {
                  setFrom(today.slice(0, 4) + "-01-01");
                  setTo(today);
                  setGroup("month");
                }}
              >
                Năm nay
              </button>
              <button onClick={() => { setFrom(new Date(Date.UTC(Number(today.slice(0,4))-5, Number(today.slice(5,7)), 1)).toISOString().slice(0,10)); setTo(today); setGroup('year'); }}>5 năm gần đây</button>
              <label>
                Từ ngày
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                Đến ngày
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <label>
                Tổng hợp theo
                <select value={group} onChange={(e) => setGroup(e.target.value as ReportGroup)}>
                  <option value="day">Ngày</option>
                  <option value="month">Tháng</option>
                  <option value="year">Năm</option>
                </select>
              </label>
            </div>
            {!report ? (
              <p role="alert">Chọn khoảng ngày hợp lệ, tối đa 10 năm.</p>
            ) : (
              <>
                <div className="revenue-stats">
                  <div>
                    <span>Buổi theo lịch còn hiệu lực</span>
                    <strong>{report.active}</strong>
                  </div>
                  <div>
                    <span>Hội viên không trùng</span>
                    <strong>{report.members}</strong>
                  </div>
                  <div>
                    <span>HLV có lịch</span>
                    <strong>{report.coaches}</strong>
                  </div>
                  <div>
                    <span>Lịch đã hủy</span>
                    <strong>{report.cancelled}</strong>
                  </div>
                </div>
                <p className="muted">
                  Hội viên và HLV được đếm từ lịch còn hiệu lực trong kỳ. Doanh thu theo dịch vụ
                  chưa được ghi nhận riêng; xem số tiền thực thu tại Tổng quan doanh thu.
                </p>
                <ReportChart
                  variant="columns" title="Số buổi theo thời gian"
                  rows={report.buckets.map((r) => ({ ...r, label: period(r.label) }))}
                />
                <ReportChart title="Số buổi theo HLV" rows={report.trainers} />
                <table aria-label="Chi tiết báo cáo dịch vụ">
                  <thead>
                    <tr>
                      <th>Kỳ</th>
                      <th>Số buổi còn hiệu lực</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.buckets.map((r) => (
                      <tr key={r.label}>
                        <td>{period(r.label)}</td>
                        <td>{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!report.total && <p>Chưa có lịch tập của dịch vụ này trong kỳ.</p>}
              </>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
