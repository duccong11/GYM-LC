export default function ReportChart({
  title,
  rows,
  format = (n: number) => String(n),
}: {
  title: string;
  rows: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="report-chart">
      <h3>{title}</h3>
      {!rows.length ? (
        <p className="muted">Chưa có dữ liệu trong khoảng ngày đã chọn.</p>
      ) : (
        <div className="report-chart-bars" role="list" aria-label={title}>
          {rows.map((r, i) => (
            <div className="report-chart-row" role="listitem" key={r.label + i}>
              <span>{r.label}</span>
              <div className="report-chart-track">
                <div style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              <strong>{format(r.value)}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
