import { useState } from 'react';
import { money, dateLabel } from '../utils/gym';
import {
  summarize,
  type Receipt,
  type Enrollment,
  type ReportGroup,
} from '../utils/reports';

export default function RevenueReport({
  payments,
  registrations,
  today,
}: {
  payments: Receipt[];
  registrations: Enrollment[];
  today: string;
}) {
  const [from, setFrom] = useState(today.slice(0, 7) + '-01');
  const [to, setTo] = useState(today);
  const [group, setGroup] = useState<ReportGroup>('day');
  const valid =
    !!from &&
    !!to &&
    from <= to &&
    Number.isFinite(Date.parse(from)) &&
    Number.isFinite(Date.parse(to)) &&
    Date.parse(to) - Date.parse(from) <= 3660 * 86400000;
  const report = valid
    ? summarize(payments, registrations, from, to, group)
    : null;
  const label = (period: string) =>
    period.length === 10
      ? dateLabel(period)
      : period.length === 7
        ? `${period.slice(5)}/${period.slice(0, 4)}`
        : period;
  function quick(period: ReportGroup) {
    setFrom(
      period === 'day'
        ? today
        : period === 'month'
          ? today.slice(0, 7) + '-01'
          : today.slice(0, 4) + '-01-01',
    );
    setTo(today);
    setGroup(period === 'year' ? 'month' : 'day');
  }
  function download() {
    if (!report) return;
    const rows: (string | number)[][] = [
      ['BÁO CÁO DOANH THU', `${from} đến ${to}`],
      ['Kỳ', 'Số giao dịch', 'Doanh thu (VND)'],
      ...report.buckets.map((b) => [label(b.period), b.count, b.amount]),
      ['Tổng', report.receipts.length, report.revenue],
      [],
      ['TOP 3 GÓI TẬP', 'Số lượt chọn'],
      ...report.top.map((p) => [p.name, p.count]),
      [
        'Cách tính',
        'Đăng ký chưa hủy và thanh toán trực tiếp; không đếm lại thanh toán có đăng ký.',
      ],
    ];
    const safe = (value: string | number) =>
      '"' +
      String(value)
        .replace(/^[\s]*[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const url = URL.createObjectURL(
      new Blob(
        ['\ufeff' + rows.map((r) => r.map(safe).join(',')).join('\r\n')],
        { type: 'text/csv;charset=utf-8' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `Doanh-thu-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <article className="panel workflow-panel revenue-report">
      <div className="report-heading">
        <div>
          <p className="muted">THỐNG KÊ & BÁO CÁO</p>
          <h2>Báo cáo doanh thu</h2>
          <p>
            Doanh thu thực thu theo ngày thanh toán tại Việt Nam. Không tính
            giao dịch đã hủy.
          </p>
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
        <button onClick={() => quick('day')}>Hôm nay</button>
        <button onClick={() => quick('month')}>Tháng này</button>
        <button onClick={() => quick('year')}>Năm nay</button>
        <label>
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          Tổng hợp theo
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as ReportGroup)}
          >
            <option value="day">Ngày</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
          </select>
        </label>
      </div>
      {!report ? (
        <p role="alert" className="form-error">
          Chọn đủ ngày bắt đầu và kết thúc, đúng thứ tự, trong phạm vi tối đa 10
          năm.
        </p>
      ) : (
        <>
          <p className="report-period">
            Kỳ báo cáo: {dateLabel(from)} – {dateLabel(to)}
          </p>
          <div className="revenue-stats">
            <div>
              <span>Tổng doanh thu</span>
              <strong data-testid="revenue-total">
                {money(report.revenue)}
              </strong>
              <small>{report.receipts.length} giao dịch</small>
            </div>
            <div>
              <span>Tiền mặt</span>
              <strong>{money(report.cash)}</strong>
            </div>
            <div>
              <span>Chuyển khoản</span>
              <strong>{money(report.transfer)}</strong>
            </div>
            <div>
              <span>Lượt chọn gói</span>
              <strong>{report.choices}</strong>
              <small>Trong kỳ báo cáo</small>
            </div>
          </div>
          <section className="top-plans">
            <h3>3 gói tập được chọn nhiều nhất</h3>
            <p className="muted">
              Đếm đăng ký chưa hủy (kể cả chờ thanh toán) và lượt mua trực tiếp,
              theo ngày tạo. Mỗi lần gia hạn tính một lượt; thanh toán cho đăng
              ký không tính thêm lượt.
            </p>
            {!report.top.length ? (
              <p>Chưa có lượt chọn gói trong kỳ này.</p>
            ) : (
              <ol className="top-plan-grid">
                {report.top.map((p, i) => (
                  <li key={p.id}>
                    <span className="plan-rank">#{i + 1}</span>
                    <h4>{p.name}</h4>
                    <strong>{p.count} lượt chọn</strong>
                    <div className="plan-meter">
                      <i
                        style={{
                          width: `${(p.count / report.top[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <h3>
            Chi tiết doanh thu theo{' '}
            {group === 'day' ? 'ngày' : group === 'month' ? 'tháng' : 'năm'}
          </h3>
          {report.receipts.length === 0 && (
            <p>Không có doanh thu trong khoảng ngày đã chọn.</p>
          )}
          <div className="table-wrap">
            <table aria-label="Doanh thu theo kỳ">
              <thead>
                <tr>
                  <th>Kỳ</th>
                  <th>Số giao dịch</th>
                  <th>Doanh thu</th>
                  <th>Tỷ trọng</th>
                </tr>
              </thead>
              <tbody>
                {report.buckets.map((b) => (
                  <tr key={b.period}>
                    <td>{label(b.period)}</td>
                    <td>{b.count}</td>
                    <td>{money(b.amount)}</td>
                    <td>
                      {report.revenue
                        ? ((b.amount / report.revenue) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Tổng cộng</th>
                  <th>{report.receipts.length}</th>
                  <th>{money(report.revenue)}</th>
                  <th>{report.revenue ? '100' : '0'}%</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </article>
  );
}
