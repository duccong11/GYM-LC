import { useState } from 'react';
import { addDays, dateLabel } from '../utils/gym';
export type Schedule = {
  id: string;
  code: string;
  trainer_id: string;
  trainer_name?: string;
  member_name?: string;
  room_name?: string;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  note?: string;
};
type Coach = { id: string; name: string; active: number };
const colorFor = (id: string) =>
  [...id].reduce((value, letter) => value + letter.charCodeAt(0), 0) % 5;
const dayClass = (date: string, today: string) =>
  date === today
    ? 'calendar-today'
    : [0, 6].includes(new Date(date + 'T00:00:00Z').getUTCDay())
      ? 'calendar-weekend'
      : '';
export default function ScheduleBoard({
  rows,
  trainers,
  today,
  canEdit,
  canCancel,
  busy,
  onEdit,
  onCancel,
  onCreate,
}: {
  rows: Schedule[];
  trainers: Coach[];
  today: string;
  canEdit: boolean;
  canCancel: boolean;
  busy: boolean;
  onEdit: (row: Schedule) => void;
  onCancel: (row: Schedule) => void;
  onCreate: (trainer: string, date: string) => void;
}) {
  const [anchor, setAnchor] = useState(today),
    [view, setView] = useState('week'),
    [coach, setCoach] = useState('');
  const offset = (new Date(anchor + 'T00:00:00Z').getUTCDay() + 6) % 7;
  const start = view === 'week' ? addDays(anchor, -offset) : anchor;
  const dates = Array.from({ length: view === 'week' ? 7 : 1 }, (_, i) =>
    addDays(start, i),
  );
  const roster = new Map(
    trainers.filter((t) => t.active === 1).map((t) => [t.id, t]),
  );
  rows.forEach((r) => {
    if (!roster.has(r.trainer_id))
      roster.set(r.trainer_id, {
        id: r.trainer_id,
        name: r.trainer_name || 'HLV',
        active: 0,
      });
  });
  const coaches = [...roster.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'vi'),
  );
  const visible = coaches.filter((t) => coach && t.id === coach);
  return (
    <section
      className="schedule-board"
      aria-label="Lịch tập theo huấn luyện viên"
    >
      <div className="planning-heading">
        <div>
          <h3>Lịch theo huấn luyện viên</h3>
          <span>Phân bổ buổi tập theo ngày</span>
        </div>
        <span className="planning-period" aria-live="polite">
          {dateLabel(start)} – {dateLabel(dates[dates.length - 1])}
        </span>
      </div>
      <div className="toolbar planning-navigation">
        <button onClick={() => setAnchor(today)}>Hôm nay</button>
        <button
          aria-label="Kỳ trước"
          onClick={() => setAnchor(addDays(anchor, view === 'week' ? -7 : -1))}
        >
          ←
        </button>
        <select
          aria-label="Chế độ lịch"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="week">Tuần</option>
          <option value="day">Ngày</option>
        </select>
        <button
          aria-label="Kỳ sau"
          onClick={() => setAnchor(addDays(anchor, view === 'week' ? 7 : 1))}
        >
          →
        </button>
        <label>
          Đến ngày lịch
          <input
            type="date"
            value={anchor}
            onChange={(e) => {
              if (e.target.value) setAnchor(e.target.value);
            }}
          />
        </label>
        <select
          aria-label="Lọc huấn luyện viên"
          value={coach}
          onChange={(e) => setCoach(e.target.value)}
        >
          <option value="">Chọn HLV để xem lịch</option>
          {coaches.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {coach && (
        <>
          <div className="table-wrap calendar-scroll">
            <table
              className={`calendar-table${view === 'day' ? ' calendar-day' : ''}`}
              aria-label="Bảng lịch tập"
            >
              <thead>
                <tr>
                  <th>Huấn luyện viên</th>
                  {dates.map((date) => (
                    <th className={dayClass(date, today)} key={date}>
                      {
                        [
                          'Chủ nhật',
                          'Thứ hai',
                          'Thứ ba',
                          'Thứ tư',
                          'Thứ năm',
                          'Thứ sáu',
                          'Thứ bảy',
                        ][new Date(date + 'T00:00:00Z').getUTCDay()]
                      }
                      <small>{dateLabel(date)}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <th scope="row">
                      <div className="coach-label">
                        <span
                          className={`coach-initial session-color-${colorFor(t.id)}`}
                          aria-hidden="true"
                        >
                          {t.name
                            .trim()
                            .split(/\s+/)
                            .slice(-2)
                            .map((word) => word[0])
                            .join('')}
                        </span>
                        <div>
                          <span>{t.name}</span>
                          <small>
                            {
                              rows.filter(
                                (r) =>
                                  r.trainer_id === t.id &&
                                  dates.includes(r.date) &&
                                  r.status !== 'CANCELLED',
                              ).length
                            }{' '}
                            buổi tập
                          </small>
                        </div>
                      </div>
                    </th>
                    {dates.map((date) => (
                      <td key={date} className={dayClass(date, today)}>
                        {rows
                          .filter(
                            (r) => r.trainer_id === t.id && r.date === date,
                          )
                          .sort(
                            (a, b) =>
                              a.start_time.localeCompare(b.start_time) ||
                              a.id.localeCompare(b.id),
                          )
                          .map((r) => (
                            <div
                              key={r.id}
                              className={`session-card session-color-${colorFor(t.id)} ${r.status === 'CANCELLED' ? 'session-cancelled' : ''}`}
                              title={[r.member_name, r.room_name, r.note]
                                .filter(Boolean)
                                .join(' · ')}
                            >
                              <strong>
                                {r.start_time.slice(0, 5)} –{' '}
                                {r.end_time.slice(0, 5)}
                              </strong>
                              <span>{r.member_name}</span>
                              {r.service_name && (
                                <small>{r.service_name}</small>
                              )}
                              <small>{r.room_name}</small>
                              {r.note && (
                                <small className="session-note">{r.note}</small>
                              )}
                              {r.status === 'CANCELLED' ? (
                                <small>Đã hủy</small>
                              ) : (
                                <div className="session-actions">
                                  {canEdit && (
                                    <button
                                      disabled={busy}
                                      onClick={() => onEdit(r)}
                                    >
                                      Sửa
                                    </button>
                                  )}
                                  {canCancel && (
                                    <button
                                      disabled={busy}
                                      onClick={() => onCancel(r)}
                                    >
                                      Hủy
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        {canEdit && t.active === 1 && (
                          <button
                            className="add-session"
                            disabled={busy}
                            aria-label={`Thêm lịch ${t.name} ngày ${date}`}
                            onClick={() => onCreate(t.id, date)}
                          >
                            + Thêm lịch
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="planning-legend">
            <span>
              <i className="legend-today" /> Hôm nay
            </span>
            <span>
              <i className="legend-weekend" /> Cuối tuần
            </span>
            <span>Lịch đã hủy được gạch ngang</span>
          </div>
        </>
      )}
      {!coach && (
        <p role="status">Chọn huấn luyện viên để hiển thị lịch tập.</p>
      )}
      {coach && !visible.length && (
        <p>HLV đã chọn không còn trong danh sách được xem.</p>
      )}
      {visible.length > 0 &&
        !rows.some(
          (r) => dates.includes(r.date) && (!coach || r.trainer_id === coach),
        ) && <p>Chưa có buổi tập trong kỳ đang xem.</p>}
    </section>
  );
}
