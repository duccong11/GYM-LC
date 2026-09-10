'use client';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  LockKeyhole,
  Unlock,
} from 'lucide-react';
import { type Role } from '../utils/security';
import { dateLabel } from '../utils/gym';
export type Row = Record<string, string | number | null>;
type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
};
const config: Record<
  string,
  { title: string; singular: string; fields: Field[] }
> = {
  trainers: {
    title: 'Huấn luyện viên',
    singular: 'trainer',
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'phone', label: 'Số điện thoại', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'specialty', label: 'Chuyên môn', required: true },
      {
        key: 'experience',
        label: 'Kinh nghiệm (năm)',
        type: 'number',
        min: 0,
        max: 60,
        required: true,
      },
      { key: 'schedule', label: 'Lịch làm việc', required: true },
      { key: 'active', label: 'Trạng thái', options: ['1', '0'] },
    ],
  },
  users: {
    title: 'Nhân viên và tài khoản',
    singular: 'user',
    fields: [
      { key: 'name', label: 'Họ tên', required: true },
      { key: 'username', label: 'Tên đăng nhập', required: true },
      { key: 'password', label: 'Mật khẩu', type: 'password' },
      { key: 'phone', label: 'Số điện thoại', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'position', label: 'Chức vụ' },
      { key: 'role', label: 'Quyền', options: ['ADMIN', 'STAFF', 'TRAINER'] },
      { key: 'active', label: 'Trạng thái', options: ['1', '0'] },
    ],
  },
  rooms: {
    title: 'Phòng tập',
    singular: 'room',
    fields: [
      { key: 'name', label: 'Tên phòng', required: true },
      {
        key: 'type',
        label: 'Loại phòng',
        options: ['Gym', 'Yoga', 'Boxing', 'Aerobic', 'Khác'],
      },
      {
        key: 'capacity',
        label: 'Sức chứa',
        type: 'number',
        min: 1,
        max: 1000,
        required: true,
      },
      { key: 'description', label: 'Mô tả' },
      { key: 'active', label: 'Trạng thái', options: ['1', '0'] },
    ],
  },
  equipment: {
    title: 'Thiết bị',
    singular: 'equipment',
    fields: [
      { key: 'name', label: 'Tên thiết bị', required: true },
      { key: 'room_id', label: 'Phòng', required: true },
      {
        key: 'quantity',
        label: 'Số lượng',
        type: 'number',
        min: 1,
        max: 10000,
        required: true,
      },
      { key: 'purchased_at', label: 'Ngày mua', type: 'date', required: true },
      {
        key: 'condition',
        label: 'Tình trạng',
        options: ['Tốt', 'Đang sử dụng', 'Hỏng', 'Đang bảo trì'],
      },
    ],
  },
};
const optionLabel = (value: string) =>
  ({
    '1': 'Đang hoạt động',
    '0': 'Ngừng hoạt động',
    ADMIN: 'Quản trị viên',
    STAFF: 'Nhân viên',
    TRAINER: 'Huấn luyện viên',
  })[value] || value;
export default function Management({
  kind,
  rows,
  rooms,
  role,
  mutate,
}: {
  kind: string;
  rows: Row[];
  rooms: Row[];
  role: Role;
  mutate: (
    payload: Record<string, unknown>,
    message: string,
  ) => Promise<unknown>;
}) {
  const c = config[kind],
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState(''),
    [page, setPage] = useState(1),
    [modal, setModal] = useState<'edit' | 'delete' | 'detail' | null>(null),
    [selected, setSelected] = useState<Row | null>(null),
    [form, setForm] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const ref = useRef<HTMLDialogElement>(null),
    canEdit = role === 'ADMIN' || (role === 'STAFF' && kind === 'equipment');
  useEffect(() => {
    setPage(1);
  }, [query, filter, kind]);
  useEffect(() => {
    if (modal) ref.current?.showModal();
    else ref.current?.close();
  }, [modal]);
  const list = rows.filter(
    (r) =>
      Object.entries(r)
        .filter(([k]) => k !== 'password_hash')
        .some(([, v]) =>
          String(v)
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase().trim()),
        ) &&
      (!filter ||
        String(r[kind === 'equipment' ? 'condition' : 'active']) === filter),
  );
  const pages = Math.max(1, Math.ceil(list.length / 8)),
    current = Math.min(page, pages);
  function open(mode: 'edit' | 'delete' | 'detail', row?: Row) {
    setSelected(row || null);
    setError('');
    setForm(
      Object.fromEntries(
        c.fields.map((f) => [
          f.key,
          f.key === 'password'
            ? ''
            : String(
                row?.[f.key] ??
                  f.options?.[0] ??
                  (f.type === 'number' ? (f.min ?? 1) : ''),
              ),
        ]),
      ),
    );
    setModal(mode);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await mutate(
        modal === 'delete'
          ? { action: c.singular + '.delete', id: selected?.id }
          : { action: c.singular + '.save', ...form, id: selected?.id },
        modal === 'delete' ? 'Đã xóa khỏi danh sách.' : 'Đã lưu thông tin.',
      );
      setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không lưu được.');
    } finally {
      setBusy(false);
    }
  }
  const columns = c.fields.filter(
    (f) => f.key !== 'password' && f.key !== 'description',
  );
  return (
    <>
      <article className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={18} />
            <input
              aria-label={'Tìm ' + c.title}
              placeholder="Tìm mã, tên hoặc thông tin…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Lọc trạng thái"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {(kind === 'equipment'
              ? ['Tốt', 'Đang sử dụng', 'Hỏng', 'Đang bảo trì']
              : ['1', '0']
            ).map((v) => (
              <option value={v} key={v}>
                {optionLabel(v)}
              </option>
            ))}
          </select>
          {canEdit && (
            <button className="primary" onClick={() => open('edit')}>
              <Plus size={16} />
              Thêm mới
            </button>
          )}
        </div>
        <p className="muted">{list.length} bản ghi</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                {columns.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.slice((current - 1) * 8, current * 8).map((r) => (
                <tr key={r.id}>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => open('detail', r)}
                    >
                      {String(r.id).slice(-8).toUpperCase()}
                    </button>
                  </td>
                  {columns.map((f) => (
                    <td key={f.key}>
                      {f.key === 'room_id'
                        ? rooms.find((x) => x.id === r.room_id)?.name ||
                          r.room_id
                        : f.type === 'date'
                          ? dateLabel(String(r[f.key]))
                          : optionLabel(String(r[f.key] ?? ''))}
                    </td>
                  ))}
                  <td>
                    {canEdit && (
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={'Sửa ' + r.name}
                          onClick={() => open('edit', r)}
                        >
                          <Pencil size={16} />
                        </button>
                        {kind === 'users' ? (
                          <button
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              try {
                                await mutate(
                                  {
                                    action: 'user.toggle',
                                    id: r.id,
                                    active: !r.active,
                                  },
                                  r.active
                                    ? 'Đã khóa tài khoản.'
                                    : 'Đã mở khóa tài khoản.',
                                );
                              } catch (e) {
                                setError((e as Error).message);
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            {r.active ? (
                              <LockKeyhole size={14} />
                            ) : (
                              <Unlock size={14} />
                            )}{' '}
                            {r.active ? 'Khóa' : 'Mở khóa'}
                          </button>
                        ) : (
                          <button
                            className="icon-button"
                            aria-label={'Xóa ' + r.name}
                            onClick={() => open('delete', r)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && (
            <div className="empty-state">Không tìm thấy dữ liệu phù hợp.</div>
          )}
        </div>
        <Pagination page={current} pages={pages} setPage={setPage} />
        {error && !modal && (
          <div role="alert" className="form-error">
            {error}
          </div>
        )}
      </article>
      <dialog
        ref={ref}
        onCancel={() => setModal(null)}
        aria-labelledby="management-title"
      >
        <form onSubmit={submit}>
          <div className="modal-heading">
            <h2 id="management-title">
              {modal === 'delete'
                ? 'Xác nhận xóa'
                : modal === 'detail'
                  ? 'Chi tiết'
                  : selected
                    ? 'Chỉnh sửa'
                    : 'Thêm mới'}{' '}
              · {c.title}
            </h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Đóng"
              onClick={() => setModal(null)}
              disabled={busy}
            >
              <X />
            </button>
          </div>
          {modal === 'delete' ? (
            <p>
              Xóa <b>{selected?.name}</b> khỏi danh sách? Lịch sử liên quan được
              giữ lại.
            </p>
          ) : modal === 'detail' ? (
            <dl className="details">
              {Object.entries(selected || {})
                .filter(([k]) => !['deleted', 'password_hash'].includes(k))
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{c.fields.find((f) => f.key === k)?.label || 'Mã'}</dt>
                    <dd>{optionLabel(String(v ?? ''))}</dd>
                  </div>
                ))}
            </dl>
          ) : (
            <div className="form-grid">
              {c.fields.map((f) => (
                <label key={f.key}>
                  {f.label}
                  {f.required ? ' *' : ''}
                  {f.options || f.key === 'room_id' ? (
                    <select
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      required={f.required}
                    >
                      {f.key === 'room_id' ? (
                        <>
                          <option value="">Chọn phòng</option>
                          {rooms
                            .filter((r) => r.active)
                            .map((r) => (
                              <option key={r.id} value={String(r.id)}>
                                {r.name}
                              </option>
                            ))}
                        </>
                      ) : (
                        f.options?.map((v) => (
                          <option key={v} value={v}>
                            {optionLabel(v)}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      required={
                        f.required || (f.key === 'password' && !selected)
                      }
                      min={f.min}
                      max={
                        f.type === 'date'
                          ? new Date().toLocaleDateString('en-CA')
                          : f.max
                      }
                      minLength={f.key === 'password' ? 8 : undefined}
                      maxLength={f.key === 'password' ? 128 : 200}
                      autoComplete={
                        f.key === 'password' ? 'new-password' : 'off'
                      }
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              {kind === 'users' && (
                <p className="muted full">
                  Mật khẩu gồm chữ và số, tối thiểu 8 ký tự. Khi sửa, để trống
                  để giữ mật khẩu. Mật khẩu được băm, không hiển thị lại.
                </p>
              )}
            </div>
          )}
          {error && (
            <div role="alert" className="form-error">
              {error}
            </div>
          )}
          <div className="modal-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => setModal(null)}
            >
              Đóng
            </button>
            {modal !== 'detail' && (
              <button className="primary" disabled={busy}>
                {busy
                  ? 'Đang lưu…'
                  : modal === 'delete'
                    ? 'Xác nhận xóa'
                    : 'Lưu thông tin'}
              </button>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}
export function Pagination({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (p: number) => void;
}) {
  return (
    <div className="pagination">
      <span>
        Trang {page} / {pages}
      </span>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Trước
      </button>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
        Sau
      </button>
    </div>
  );
}
