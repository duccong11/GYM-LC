import { useState, type FormEvent } from 'react';
import {
  canMutate,
  permissions,
  roleLabel,
  type User,
} from '../utils/security';
import { money, dateLabel, todayVN } from '../utils/gym';
type Row = Record<string, any>;
type Props = {
  kind: string;
  data: Record<string, any>;
  user: User;
  mutate: (b: Record<string, unknown>, message: string) => Promise<unknown>;
};
const labels: Record<string, string> = {
  id: 'Mã',
  code: 'Mã nghiệp vụ',
  member_id: 'Hội viên',
  plan_id: 'Gói tập',
  trainer_id: 'Huấn luyện viên',
  room_id: 'Phòng',
  start_date: 'Ngày bắt đầu',
  end_date: 'Ngày kết thúc',
  price: 'Giá gói',
  amount: 'Số tiền',
  method: 'Phương thức',
  date: 'Ngày tập',
  start_time: 'Bắt đầu',
  end_time: 'Kết thúc',
  note: 'Ghi chú',
  status: 'Trạng thái',
  created_at: 'Ngày tạo',
  plan_name: 'Gói tập',
  action: 'Thao tác',
  actor_id: 'Tài khoản',
  entity_id: 'Đối tượng',
  gym_name: 'Tên phòng GYM',
  opening_hours: 'Giờ hoạt động',
};
const stateLabel: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  ACTIVE: 'Đang hoạt động',
  CANCELLED: 'Đã hủy',
};
export default function Workflows({ kind, data, user, mutate }: Props) {
  const [query, setQuery] = useState(''),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [page, setPage] = useState(1),
    [form, setForm] = useState<Row | null>(null),
    [editing, setEditing] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState('');
  const singular: Record<string, string> = {
    registrations: 'registration',
    schedules: 'schedule',
    payments: 'payment',
  };
  const entity = singular[kind];
  const canSave =
    !!entity &&
    canMutate(
      user.role,
      entity +
        '.' +
        (kind === 'payments' ? (editing ? 'update' : 'create') : 'save'),
    );
  const rangeError =
    from &&
    to &&
    (from > to || (Date.parse(to) - Date.parse(from)) / 86400000 > 365)
      ? 'Khoảng ngày phải đúng thứ tự và không quá 366 ngày.'
      : '';
  const sourceRows: Row[] =
    kind === 'system'
      ? data.audit || []
      : kind === 'reports'
        ? data.payments || []
        : kind === 'search'
          ? Object.entries(data).flatMap(([k, v]) =>
              permissions[user.role].includes(k) && Array.isArray(v)
                ? v.map((r: Row) => ({ ...r, resource: k }))
                : [],
            )
          : data[kind] || [];
  const rows: Row[] = sourceRows.map((r) => ({
    ...r,
    member_name:
      r.member_name ||
      (data.members || []).find((x: Row) => x.id === r.member_id)?.name,
    trainer_name:
      r.trainer_name ||
      (data.trainers || []).find((x: Row) => x.id === r.trainer_id)?.name,
  }));
  const filtered = rangeError
    ? []
    : rows.filter(
        (r) =>
          Object.values(r).some((v) =>
            String(v ?? '')
              .toLocaleLowerCase()
              .includes(query.trim().toLocaleLowerCase()),
          ) &&
          (!status || r.status === status) &&
          (!from ||
            String(
              kind === 'reports' || kind === 'payments'
                ? (r.created_at ? todayVN(new Date(r.created_at)) : '')
                : r.date || r.start_date || r.created_at,
            ).slice(0, 10) >= from) &&
          (!to ||
            String(
              kind === 'reports' || kind === 'payments'
                ? (r.created_at ? todayVN(new Date(r.created_at)) : '')
                : r.date || r.start_date || r.created_at,
            ).slice(0, 10) <= to),
      );
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const columns =
    kind === 'registrations'
      ? [
          'code',
          'member_id',
          'plan_name',
          'start_date',
          'end_date',
          'price',
          'status',
        ]
      : kind === 'schedules'
        ? [
            'code',
            'member_id',
            'trainer_id',
            'room_id',
            'date',
            'start_time',
            'end_time',
            'status',
          ]
        : kind === 'system'
          ? ['created_at', 'actor_id', 'action', 'entity_id']
          : kind === 'search'
            ? ['resource', 'id', 'name', 'plan_name', 'status']
            : [
                'code',
                'member_id',
                'plan_name',
                'amount',
                'method',
                'created_at',
              ];
  function name(key: string, val: any) {
    const lists: Record<string, string> = {
      member_id: 'members',
      plan_id: 'plans',
      trainer_id: 'trainers',
      room_id: 'rooms',
    };
    if (lists[key])
      return (
        (data[lists[key]] || []).find((r: Row) => r.id === val)?.name ||
        String(val || '—')
      );
    if (key === 'amount' || key === 'price') return money(Number(val || 0));
    if (key === 'status') return stateLabel[String(val)] || String(val || '—');
    if (['date', 'start_date', 'end_date', 'created_at'].includes(key))
      return dateLabel(String(val || ''));
    return String(val ?? '—');
  }
  function open(row?: Row) {
    setError('');
    setEditing(!!row);
    setForm(
      row
        ? { ...row }
        : {
            code:
              (kind === 'registrations'
                ? 'DK'
                : kind === 'schedules'
                  ? 'LT'
                  : 'TT') +
              crypto
                .randomUUID()
                .replaceAll('-', '')
                .slice(0, 12)
                .toUpperCase(),
            start_date: data.today,
            date: data.today,
            start_time: '08:00',
            end_time: '09:00',
            method: 'Tiền mặt',
            request_id: crypto.randomUUID(),
            ...(kind === 'system' ? data.system?.[0] : {}),
          },
    );
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form || busy) return;
    setBusy(true);
    setError('');
    try {
      await mutate(
        {
          ...form,
          action:
            kind === 'system'
              ? 'system.save'
              : entity +
                '.' +
                (kind === 'payments'
                  ? editing
                    ? 'update'
                    : 'create'
                  : 'save'),
          ...(kind === 'payments' && !editing
            ? { request_id: form.request_id || crypto.randomUUID() }
            : {}),
        },
        'Đã lưu thành công.',
      );
      setForm(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function cancel(row: Row) {
    const reason =
      kind === 'payments'
        ? prompt('Lý do hủy thanh toán (ít nhất 5 ký tự):')
        : undefined;
    if (kind === 'payments' && !reason) return;
    if (!confirm('Xác nhận hủy bản ghi? Lịch sử vẫn được giữ lại.')) return;
    setBusy(true);
    setError('');
    try {
      await mutate(
        { action: entity + '.delete', id: row.id, reason },
        'Đã hủy bản ghi.',
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function exportCsv() {
    const safe = (v: any) =>
      '"' +
      String(v ?? '')
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const lines = [
      columns.map((k) => labels[k] || k),
      ...filtered.map((r) => columns.map((k) => name(k, r[k]))),
    ];
    const a = document.createElement('a'),
      url = URL.createObjectURL(
        new Blob(
          ['\ufeff' + lines.map((r) => r.map(safe).join(',')).join('\r\n')],
          { type: 'text/csv;charset=utf-8' },
        ),
      );
    a.href = url;
    a.download = 'Bao-cao-GYM.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  const fields =
    kind === 'registrations'
      ? ['code', 'member_id', 'plan_id', 'start_date']
      : kind === 'schedules'
        ? [
            'code',
            'member_id',
            'trainer_id',
            'room_id',
            'date',
            'start_time',
            'end_time',
            'note',
          ]
        : kind === 'system'
          ? ['gym_name', 'opening_hours']
          : editing
            ? ['method']
            : ['code', 'registration_id', 'method'];
  const choices = (key: string): Row[] | null => {
    const resource: Record<string, string> = {
      member_id: 'members',
      plan_id: 'plans',
      trainer_id: 'trainers',
      room_id: 'rooms',
      registration_id: 'registrations',
    };
    if (!resource[key]) return null;
    return (data[resource[key]] || []).filter((r: Row) =>
      key === 'registration_id'
        ? r.status === 'PENDING'
        : !r.archived && r.active !== 0 && !r.deleted,
    );
  };
  return (
    <article className="panel workflow-panel">
      {kind === 'system' && (
        <>
          <h2>Quản trị hệ thống</h2>
          <p>
            {data.system?.[0]?.gym_name} · {data.system?.[0]?.opening_hours}
          </p>
          <button onClick={() => open()}>Cấu hình hệ thống</button>
          <h3>Phân quyền theo vai trò</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Phạm vi chức năng</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([role, items]) => (
                  <tr key={role}>
                    <td>{roleLabel[role as User['role']]}</td>
                    <td>
                      {items
                        .map(
                          (x) =>
                            (
                              ({
                                users: 'Tài khoản và phân quyền',
                                system: 'Hệ thống',
                                overview: 'Tổng quan',
                                members: 'Hội viên',
                                plans: 'Gói tập',
                                registrations: 'Đăng ký',
                                payments: 'Thanh toán',
                                schedules: 'Lịch tập',
                                reports: 'Báo cáo',
                                checkins: 'Điểm danh',
                                trainers: 'HLV',
                                rooms: 'Phòng tập',
                                equipment: 'Thiết bị',
                                search: 'Tra cứu',
                              }) as Record<string, string>
                            )[x] || x,
                        )
                        .join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Nhật ký hệ thống (200 thao tác gần nhất)</h3>
        </>
      )}
      {kind === 'reports' && (
        <>
          <h2>Báo cáo hoạt động</h2>
          <p>
            Doanh thu thực thu; không tính giao dịch đã hủy. Lọc theo ngày tạo
            thanh toán.
          </p>
          <strong>
            {filtered.length} giao dịch ·{' '}
            {money(filtered.reduce((n, r) => n + Number(r.amount), 0))}
          </strong>
          <p>
            Hội viên:{' '}
            {data.members?.filter((r: Row) => !r.archived).length || 0} · Đăng
            ký đang hoạt động:{' '}
            {data.registrations?.filter(
              (r: Row) =>
                r.status === 'ACTIVE' &&
                r.start_date <= data.today &&
                r.end_date >= data.today,
            ).length || 0}
          </p>
          <button onClick={exportCsv} disabled={!!rangeError}>
            Xuất CSV
          </button>{' '}
          <button onClick={() => window.print()} disabled={!!rangeError}>
            In / Lưu PDF
          </button>
        </>
      )}
      <div className="toolbar">
        <input
          aria-label="Tìm kiếm"
          maxLength={100}
          placeholder="Tìm mã, tên hoặc thông tin..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <label>
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {['registrations', 'schedules'].includes(kind) && (
          <select
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(stateLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        )}
        {entity &&
          canMutate(
            user.role,
            entity + '.' + (kind === 'payments' ? 'create' : 'save'),
          ) && (
            <button className="primary" onClick={() => open()}>
              Thêm{' '}
              {kind === 'registrations'
                ? 'đăng ký'
                : kind === 'schedules'
                  ? 'lịch tập'
                  : 'thanh toán'}
            </button>
          )}
      </div>
      {(error || rangeError) && (
        <p role="alert" className="form-error">
          {error || rangeError}
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((k) => (
                <th key={k}>{labels[k] || k}</th>
              ))}
              {entity && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {(kind==='reports'?filtered:filtered.slice((current - 1) * 10, current * 10)).map((r,index) => (
              <tr className={kind==='reports'&&(index<(current-1)*10||index>=current*10)?'print-only-row':undefined} key={r.id + '-' + (r.resource || '')}>
                {columns.map((k) => (
                  <td key={k} title={String(r[k] ?? '')}>
                    {k === 'id'
                      ? String(r[k]).slice(0, 8)
                      : ['member_id', 'trainer_id', 'room_id'].includes(k) &&
                          r[k.replace('_id', '_name')]
                        ? r[k.replace('_id', '_name')]
                        : name(k, r[k])}
                  </td>
                ))}
                {entity && (
                  <td>
                    {canMutate(
                      user.role,
                      entity + '.' + (kind === 'payments' ? 'update' : 'save'),
                    ) &&
                      r.status !== 'CANCELLED' &&
                      (kind !== 'registrations' || r.status === 'PENDING') && (
                        <button onClick={() => open(r)} disabled={busy}>
                          Sửa
                        </button>
                      )}
                    {canMutate(user.role, entity + '.delete') &&
                      r.status !== 'CANCELLED' && (
                        <button onClick={() => cancel(r)} disabled={busy}>
                          Hủy
                        </button>
                      )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="muted">Không tìm thấy dữ liệu phù hợp.</p>
        )}
      </div>
      <div className="toolbar">
        <button disabled={current <= 1} onClick={() => setPage(current - 1)}>
          Trước
        </button>
        <span>
          Trang {current}/{Math.max(1, Math.ceil(filtered.length / 10))} ·{' '}
          {filtered.length} bản ghi
        </span>
        <button
          disabled={current * 10 >= filtered.length}
          onClick={() => setPage(current + 1)}
        >
          Sau
        </button>
      </div>
      {form && (
        <div className="workflow-overlay">
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Biểu mẫu nghiệp vụ"
            className="panel workflow-form"
            onSubmit={submit}
          >
            <h2>
              {editing ? 'Cập nhật' : 'Thêm mới'}{' '}
              {kind === 'registrations'
                ? 'đăng ký gói'
                : kind === 'schedules'
                  ? 'lịch tập'
                  : kind === 'system'
                    ? 'cấu hình'
                    : 'thanh toán'}
            </h2>
            {fields.map((key) => (
              <label key={key}>
                {labels[key] || 'Đăng ký chờ thanh toán'}
                {choices(key) ? (
                  <select
                    aria-label={labels[key] || 'Đăng ký chờ thanh toán'}
                    required
                    value={form[key] || ''}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  >
                    <option value="">Chọn...</option>
                    {choices(key)!.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name ||
                          [
                            name('member_id', r.member_id),
                            r.plan_name,
                            r.start_date,
                            money(r.price),
                          ].join(' · ')}
                      </option>
                    ))}
                  </select>
                ) : key === 'method' ? (
                  <select
                    aria-label={labels[key] || 'Đăng ký chờ thanh toán'}
                    value={form[key] || 'Tiền mặt'}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  >
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản</option>
                  </select>
                ) : (
                  <input
                    maxLength={key === 'code' ? 20 : key === 'note' ? 500 : 100}
                    minLength={key === 'code' ? 5 : undefined}
                    pattern={key === 'code' ? '[A-Za-z0-9]+' : undefined}
                    required={key !== 'note'}
                    type={
                      key.includes('date')
                        ? 'date'
                        : key.includes('time')
                          ? 'time'
                          : 'text'
                    }
                    value={form[key] || ''}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button type="button" disabled={busy} onClick={() => setForm(null)}>
              Đóng
            </button>{' '}
            <button
              className="primary"
              disabled={busy || (!canSave && kind !== 'system')}
            >
              {busy ? 'Đang lưu…' : 'Lưu'}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
