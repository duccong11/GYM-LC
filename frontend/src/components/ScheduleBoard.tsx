import { useState } from 'react';
import { addDays, dateLabel } from '../utils/gym';
export type Schedule = {
  id: string;
  code: string;
  trainer_id: string;
  trainer_name?: string;
  member_name?: string;
  room_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  note?: string;
};
type Coach = { id: string; name: string; active: number };
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
  rows
    .filter((r) => dates.includes(r.date))
    .forEach((r) => {
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
  const visible = coaches.filter((t) => !coach || t.id === coach);
  return (
    <section
      className="schedule-board"
      aria-label="Lịch tập theo huấn luyện viên"
    >
      <div className="toolbar">
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
          <option value="">Tất cả HLV</option>
          {coaches.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <strong>
          {dateLabel(start)} – {dateLabel(dates[dates.length - 1])}
        </strong>
      </div>
      <p className="muted">
        Mỗi hàng là một HLV. Thẻ hiển thị giờ tập, hội viên và phòng; lịch đã
        hủy được gạch ngang.
      </p>
      <div className="table-wrap calendar-scroll">
        <table className="calendar-table" aria-label="Bảng lịch tập">
          <thead>
            <tr>
              <th>Huấn luyện viên</th>
              {dates.map((date) => (
                <th
                  className={date === today ? 'calendar-today' : ''}
                  key={date}
                >
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
            {visible.map((t, i) => (
              <tr key={t.id}>
                <th scope="row">
                  <span className="coach-initial">{t.name.slice(0, 1)}</span>
                  {t.name}
                </th>
                {dates.map((date) => (
                  <td
                    key={date}
                    className={date === today ? 'calendar-today' : ''}
                  >
                    {rows
                      .filter((r) => r.trainer_id === t.id && r.date === date)
                      .sort(
                        (a, b) =>
                          a.start_time.localeCompare(b.start_time) ||
                          a.id.localeCompare(b.id),
                      )
                      .map((r) => (
                        <div
                          key={r.id}
                          className={`session-card session-color-${i % 4} ${r.status === 'CANCELLED' ? 'session-cancelled' : ''}`}
                        >
                          <strong>
                            {r.start_time.slice(0, 5)} –{' '}
                            {r.end_time.slice(0, 5)}
                          </strong>
                          <span>{r.member_name}</span>
                          <small>{r.room_name}</small>
                          {r.note && <small>{r.note}</small>}
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
      {!visible.length && (
        <p>Chưa có HLV hoặc lịch tập phù hợp trong kỳ này.</p>
      )}
      {visible.length > 0 &&
        !rows.some(
          (r) => dates.includes(r.date) && (!coach || r.trainer_id === coach),
        ) && <p>Chưa có buổi tập trong kỳ đang xem.</p>}
    </section>
  );
}
