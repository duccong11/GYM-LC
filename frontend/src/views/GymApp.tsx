import { mutateRequest } from '../services/gym.api';
('use client');
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FormEvent,
} from 'react';
import {
  Dumbbell,
  Users,
  CreditCard,
  ScanLine,
  LayoutDashboard,
  UserCog,
  Building2,
  Wrench,
  BadgeCheck,
  LogOut,
  Plus,
  Search,
  X,
  Download,
  Pencil,
  Archive,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import {
  addDays,
  dateLabel,
  membership,
  money,
  todayVN,
  type GymData,
  type Member,
  type Plan,
  type Payment,
} from '../utils/gym';
import { permissions, roleLabel, type User } from '../utils/security';
import Management, { Pagination, type Row } from '../components/Management';
export type Tab =
  | 'overview'
  | 'members'
  | 'plans'
  | 'payments'
  | 'checkins'
  | 'trainers'
  | 'users'
  | 'rooms'
  | 'equipment';
const nav = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'members', label: 'Hội viên', icon: Users },
  { id: 'plans', label: 'Gói tập', icon: Dumbbell },
  { id: 'payments', label: 'Thanh toán', icon: CreditCard },
  { id: 'checkins', label: 'Điểm danh', icon: ScanLine },
  { id: 'trainers', label: 'Huấn luyện viên', icon: BadgeCheck },
  { id: 'users', label: 'Nhân viên', icon: UserCog },
  { id: 'rooms', label: 'Phòng tập', icon: Building2 },
  { id: 'equipment', label: 'Thiết bị', icon: Wrench },
] as const;
type Extended = GymData & {
  users: Row[];
  rooms: Row[];
  equipment: Row[];
  trainers: Row[];
  staffCount: number;
};
type Modal = {
  kind: 'member' | 'plan' | 'payment' | 'detail' | 'invoice' | 'confirm';
  value?: Member | Plan | Payment;
  payload?: Record<string, unknown>;
  title?: string;
};
const empty: Extended = {
  members: [],
  plans: [],
  payments: [],
  checkins: [],
  today: '',
  users: [],
  rooms: [],
  trainers: [],
  equipment: [],
  staffCount: 0,
};
export default function GymApp({
  user,
  csrf,
  initialTab = 'overview',
}: {
  user: User;
  csrf: string;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab),
    [data, setData] = useState(empty),
    [error, setError] = useState(''),
    [toast, setToast] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [page, setPage] = useState(1),
    [dateFrom, setDateFrom] = useState(''),
    [dateTo, setDateTo] = useState(''),
    [payMember, setPayMember] = useState(''),
    [modal, setModal] = useState<Modal | null>(null),
    [form, setForm] = useState<Record<string, string>>({}),
    [formError, setFormError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null),
    lock = useRef(false);
  const admin = user.role === 'ADMIN',
    staff = user.role !== 'TRAINER';
  const refresh = useCallback(async () => {
    const r = await fetch('/api/gym', { cache: 'no-store' });
    const d = (await r.json()) as Extended & { error?: string };
    if (r.status === 401) {
      location.assign('/login');
      return;
    }
    if (!r.ok) throw new Error(d.error);
    setData(d);
    setError('');
  }, []);
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    setPage(1);
  }, [query, status, tab, dateFrom, dateTo, payMember]);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);
  useEffect(() => {
    const change = () => {
      const id = location.hash.slice(1);
      if (permissions[user.role].includes(id)) setTab(id as Tab);
    };
    change();
    addEventListener('hashchange', change);
    return () => removeEventListener('hashchange', change);
  }, [user.role]);
  function navigate(t: Tab) {
    if (!permissions[user.role].includes(t)) return;
    setTab(t);
    setQuery('');
    setStatus('');
    setPage(1);
    location.hash = t;
  }
  const mutate = useCallback(
    async (payload: Record<string, unknown>, message: string) => {
      if (lock.current) throw new Error('Đang xử lý một thao tác.');
      lock.current = true;
      setBusy(true);
      try {
        const r = await mutateRequest(payload, csrf);
        const d = (await r.json()) as { error?: string; id?: string };
        if (r.status === 401) location.assign('/login');
        if (!r.ok) throw new Error(d.error);
        try {
          await refresh();
        } catch {
          setError(
            'Đã lưu nhưng chưa tải lại được dữ liệu. Hãy tải lại trước khi thao tác tiếp.',
          );
        }
        setToast(message);
        return d;
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [csrf, refresh],
  );
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (t: unknown, o: { signal: AbortSignal }) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const abort = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'check_in_gym_member',
            description:
              'Điểm danh hội viên còn hạn và chưa ở trong phòng tập.',
            inputSchema: {
              type: 'object',
              properties: { member_id: { type: 'string' } },
              required: ['member_id'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute: async (input: unknown) => {
              const id = (input as { member_id?: unknown })?.member_id;
              if (typeof id !== 'string' || !id)
                throw new Error('Thiếu mã hội viên.');
              const result = await mutate(
                { action: 'checkin.create', member_id: id },
                'Đã điểm danh.',
              );
              setTab('checkins');
              return result;
            },
          },
          { signal: abort.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => abort.abort();
  }, [mutate]);
  const run = (p: Record<string, unknown>, message: string) => {
    void mutate(p, message).catch((e) => setToast(e.message));
  };
  const live = data.members.filter((m) => !m.archived),
    active = live.filter(
      (m) => membership(m, data.payments, data.today).current,
    ),
    expired = live.filter(
      (m) => membership(m, data.payments, data.today).status === 'Hết hạn',
    );
  const expiring = active.filter(
      (m) => (membership(m, data.payments, data.today).remaining ?? 99) <= 7,
    ),
    todayVisits = data.checkins.filter((c) => c.date === data.today);
  const search = (m: Member) =>
    (m.name + ' ' + m.phone + ' ' + m.id)
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
  const members = data.members.filter(
    (m) =>
      search(m) &&
      (status === 'Đã lưu trữ' ? m.archived : !m.archived) &&
      (status === '' ||
        status === 'Đã lưu trữ' ||
        (status === 'Sắp hết hạn'
          ? expiring.some((x) => x.id === m.id)
          : membership(m, data.payments, data.today).status === status)),
  );
  const nameOf = (id: string) =>
    data.members.find((m) => m.id === id)?.name || id;
  const paymentDay = (p: Payment) => todayVN(new Date(p.created_at));
  const filteredPayments = data.payments.filter(
    (p) =>
      (nameOf(p.member_id) + ' ' + p.id)
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()) &&
      (!payMember || p.member_id === payMember) &&
      (!dateFrom || paymentDay(p) >= dateFrom) &&
      (!dateTo || paymentDay(p) <= dateTo),
  );
  const revenue = (period: string) =>
    data.payments
      .filter((p) => paymentDay(p).startsWith(period))
      .reduce((s, p) => s + p.amount, 0);
  const filteredPlans = data.plans.filter(
    (p) =>
      p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
      (!status || String(p.active) === status),
  );
  const pages = (n: number) => Math.max(1, Math.ceil(n / 8)),
    slice = <T,>(list: T[]) =>
      list.slice(
        (Math.min(page, pages(list.length)) - 1) * 8,
        Math.min(page, pages(list.length)) * 8,
      );
  function open(kind: Modal['kind'], value?: Member | Plan | Payment) {
    setFormError('');
    setForm(
      kind === 'member'
        ? {
            name: '',
            phone: '',
            email: '',
            gender: 'Nam',
            birth_date: '',
            address: '',
            ...Object.fromEntries(
              Object.entries(value || {}).map(([k, v]) => [k, String(v)]),
            ),
          }
        : kind === 'plan'
          ? {
              name: '',
              days: '30',
              price: '350000',
              description: '',
              ...Object.fromEntries(
                Object.entries(value || {}).map(([k, v]) => [k, String(v)]),
              ),
            }
          : kind === 'payment'
            ? {
                member_id: value?.id || '',
                plan_id: data.plans.find((p) => p.active)?.id || '',
                method: 'Tiền mặt',
                start_date: '',
                request_id: crypto.randomUUID(),
              }
            : {},
    );
    setModal({ kind, value });
  }
  function confirm(title: string, payload: Record<string, unknown>) {
    setFormError('');
    setModal({ kind: 'confirm', title, payload });
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!modal || busy) return;
    setFormError('');
    try {
      const payload =
        modal.kind === 'confirm'
          ? modal.payload!
          : modal.kind === 'payment'
            ? { action: 'payment.create', ...form }
            : { action: modal.kind + '.save', ...form, id: modal.value?.id };
      await mutate(payload, 'Đã lưu thay đổi thành công.');
      setModal(null);
    } catch (e) {
      setFormError((e as Error).message);
    }
  }
  const field = (key: string) => ({
    value: form[key] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });
  const selectedPlan = data.plans.find((p) => p.id === form.plan_id),
    lastEnd = data.payments
      .filter((p) => p.member_id === form.member_id)
      .map((p) => p.end_date)
      .sort()
      .at(-1),
    start =
      form.start_date ||
      (lastEnd && lastEnd >= data.today ? addDays(lastEnd, 1) : data.today);
  function exportCsv() {
    const rows = [
      [
        'Mã hội viên',
        'Họ tên',
        'Số điện thoại',
        'Email',
        'Trạng thái',
        'Hạn tập',
      ],
      ...members.map((m) => [
        m.id,
        m.name,
        m.phone,
        m.email,
        membership(m, data.payments, data.today).status,
        membership(m, data.payments, data.today).last?.end_date || '',
      ]),
    ];
    const csv =
      '\uFEFF' +
      rows
        .map((r) =>
          r
            .map(
              (v) =>
                '"' +
                (/^\s*[=+@-]|^[\t\r\n]/.test(v) ? "'" : '') +
                v.replace(/"/g, '""') +
                '"',
            )
            .join(','),
        )
        .join('\r\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hoi-vien-gym-lc.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const badge = (m: Member) => {
    const s = membership(m, data.payments, data.today);
    return (
      <span
        className={
          'badge ' +
          (s.current && !m.archived
            ? 'green'
            : s.status === 'Hết hạn'
              ? 'red'
              : 'neutral')
        }
      >
        {s.status}
      </span>
    );
  };
  const table = (list: Member[], compact = false) => (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Hội viên</th>
            <th>Gói tập</th>
            <th>Hết hạn</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => {
            const s = membership(m, data.payments, data.today);
            return (
              <tr key={m.id}>
                <td>
                  <div className="member-cell">
                    <span className="avatar">
                      {m.name
                        .split(' ')
                        .slice(-2)
                        .map((n) => n[0])
                        .join('')}
                    </span>
                    <div>
                      <button
                        className="text-button"
                        onClick={() => open('detail', m)}
                      >
                        {m.name}
                      </button>
                      <small>{m.phone}</small>
                    </div>
                  </div>
                </td>
                <td>{s.last?.plan_name || 'Chưa đăng ký'}</td>
                <td>
                  {dateLabel(s.last?.end_date || '')}
                  {s.remaining !== null && s.remaining <= 7 && (
                    <small className="warning-text">
                      Còn {s.remaining + 1} ngày, gồm hôm nay
                    </small>
                  )}
                </td>
                <td>{badge(m)}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={'Chi tiết ' + m.name}
                      onClick={() => open('detail', m)}
                    >
                      <Eye size={16} />
                    </button>
                    {staff &&
                      (m.archived ? (
                        <button
                          disabled={busy}
                          onClick={() =>
                            run(
                              {
                                action: 'member.archive',
                                id: m.id,
                                archived: false,
                              },
                              'Đã khôi phục hội viên.',
                            )
                          }
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <>
                          <button
                            className="text-button"
                            onClick={() => open('payment', m)}
                          >
                            Gia hạn
                          </button>
                          {!compact && (
                            <>
                              <button
                                className="icon-button"
                                aria-label={'Sửa ' + m.name}
                                onClick={() => open('member', m)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="icon-button"
                                aria-label={'Xóa ' + m.name}
                                onClick={() =>
                                  confirm(
                                    'Xóa / lưu trữ ' +
                                      m.name +
                                      '? Có thể khôi phục trong bộ lọc Đã lưu trữ. Lịch sử thanh toán được giữ lại.',
                                    { action: 'member.archive', id: m.id },
                                  )
                                }
                              >
                                <Archive size={15} />
                              </button>
                            </>
                          )}
                        </>
                      ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!list.length && (
        <div className="empty-state">Không tìm thấy hội viên phù hợp.</div>
      )}
    </div>
  );
  async function logout() {
    const r = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({ action: 'logout' }),
    });
    if (r.ok || r.status === 401) location.assign('/login');
    else setToast('Không đăng xuất được. Vui lòng thử lại.');
  }
  const modalTitle =
    modal?.kind === 'member'
      ? 'Thông tin hội viên'
      : modal?.kind === 'plan'
        ? 'Thông tin gói tập'
        : modal?.kind === 'payment'
          ? 'Ghi nhận thanh toán'
          : modal?.kind === 'detail'
            ? 'Chi tiết hội viên'
            : modal?.kind === 'invoice'
              ? 'Chi tiết hóa đơn'
              : 'Xác nhận thao tác';
  return (
    <div className="shell">
      <aside>
        <a className="brand" href={staff ? '/' : '/members'}>
          <span>
            <Dumbbell />
          </span>
          GYM<span className="lime">LC</span>
        </a>
        <p className="eyebrow">KHÔNG GIAN QUẢN LÝ</p>
        <nav aria-label="Điều hướng chính">
          {nav
            .filter((n) => permissions[user.role].includes(n.id))
            .map((n) => (
              <button
                key={n.id}
                className={tab === n.id ? 'selected' : ''}
                aria-current={tab === n.id ? 'page' : undefined}
                onClick={() => navigate(n.id)}
              >
                <n.icon size={19} />
                {n.label}
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">LC</span>
          <div>
            <b>{user.name}</b>
            <small>{roleLabel[user.role]}</small>
            <button className="text-button" onClick={logout}>
              <LogOut size={14} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <span>
            Không gian làm việc / {nav.find((n) => n.id === tab)?.label}
          </span>
          <span className="muted">{dateLabel(data.today)}</span>
        </header>
        <section className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">MỖI NGÀY MỘT BƯỚC TIẾN</p>
              <h1>
                {nav.find((n) => n.id === tab)?.label}
                <span className="lime">.</span>
              </h1>
              <p className="muted">
                Quản lý hoạt động và đồng hành cùng hội viên.
              </p>
            </div>
            <div className="heading-actions">
              {tab === 'members' && (
                <button onClick={exportCsv} disabled={!members.length}>
                  <Download size={16} />
                  Xuất CSV
                </button>
              )}
              {staff && ['overview', 'members', 'payments'].includes(tab) && (
                <button
                  className="primary"
                  disabled={loading || !!error}
                  onClick={() =>
                    open(tab === 'payments' ? 'payment' : 'member')
                  }
                >
                  <Plus size={17} />
                  {tab === 'payments' ? 'Ghi nhận thanh toán' : 'Thêm hội viên'}
                </button>
              )}
              {admin && tab === 'plans' && (
                <button className="primary" onClick={() => open('plan')}>
                  <Plus size={17} />
                  Thêm gói tập
                </button>
              )}
            </div>
          </div>
          {error && (
            <div role="alert" className="error-banner">
              {error}
              <button
                onClick={() => refresh().catch((e) => setError(e.message))}
              >
                Tải lại
              </button>
            </div>
          )}
          {loading ? (
            <div className="empty-state">Đang tải dữ liệu…</div>
          ) : (
            !error && (
              <>
                {tab === 'overview' && (
                  <>
                    <div className="stats">
                      {[
                        { label: 'Tổng hội viên', value: live.length },
                        {
                          label: 'Hội viên đang hoạt động',
                          value: active.length,
                        },
                        { label: 'Hội viên hết hạn', value: expired.length },
                        { label: 'Gói sắp hết hạn', value: expiring.length },
                        { label: 'Nhân viên', value: data.staffCount },
                        {
                          label: 'Huấn luyện viên',
                          value: data.trainers.length,
                        },
                        { label: 'Gói tập', value: data.plans.length },
                        {
                          label: 'Lượt tập hôm nay',
                          value: todayVisits.length,
                        },
                        {
                          label: 'Doanh thu hôm nay',
                          value: money(revenue(data.today)),
                        },
                        {
                          label: 'Doanh thu tháng',
                          value: money(revenue(data.today.slice(0, 7))),
                        },
                        {
                          label: 'Doanh thu năm',
                          value: money(revenue(data.today.slice(0, 4))),
                        },
                      ].map((s, i) => (
                        <article className={'stat stat-' + i} key={s.label}>
                          <div>{s.label}</div>
                          <strong>{s.value}</strong>
                        </article>
                      ))}
                    </div>
                    <div className="dashboard-grid">
                      <article className="panel">
                        <h2>Nhịp hoạt động</h2>
                        <p className="muted">
                          Lượt vào phòng tập trong 7 ngày gần nhất
                        </p>
                        <div className="bar-chart">
                          {Array.from({ length: 7 }, (_, i) =>
                            addDays(data.today, i - 6),
                          ).map((day) => {
                            const count = data.checkins.filter(
                                (c) => c.date === day,
                              ).length,
                              max = Math.max(
                                1,
                                ...Array.from(
                                  { length: 7 },
                                  (_, i) =>
                                    data.checkins.filter(
                                      (c) =>
                                        c.date === addDays(data.today, i - 6),
                                    ).length,
                                ),
                              );
                            return (
                              <div className="bar-column" key={day}>
                                <span className="bar-number">{count}</span>
                                <div
                                  className={
                                    'bar ' +
                                    (day === data.today ? 'current' : '')
                                  }
                                  style={{
                                    height: Math.max(3, (count / max) * 125),
                                  }}
                                />
                                <span className="bar-label">
                                  {day === data.today
                                    ? 'Hôm nay'
                                    : dateLabel(day).slice(0, 5)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </article>
                      <article className="welcome-card">
                        <span className="eyebrow">
                          GYM LC / CÙNG NHAU TIẾN BỘ
                        </span>
                        <h2>
                          Vận hành gọn gàng.
                          <br />
                          Tập trung phát triển.
                        </h2>
                        <Dumbbell size={100} />
                        <p>Ghi nhận mỗi buổi tập, chăm sóc từng hội viên.</p>
                        <button onClick={() => navigate('checkins')}>
                          Điểm danh ngay <ArrowUpRight size={16} />
                        </button>
                      </article>
                    </div>
                    <article className="panel">
                      <div className="panel-heading">
                        <h2>Hội viên gần đây</h2>
                        <button
                          className="text-button"
                          onClick={() => navigate('members')}
                        >
                          Xem tất cả
                        </button>
                      </div>
                      {table(live.slice(0, 5), true)}
                    </article>
                    {expiring.length > 0 && (
                      <div className="renewal-banner">
                        <span>
                          {expiring.length} hội viên sắp hết hạn trong 7 ngày
                          tới.
                        </span>
                        <button
                          onClick={() => {
                            navigate('members');
                            setStatus('Sắp hết hạn');
                          }}
                        >
                          Xem hội viên cần gia hạn
                        </button>
                      </div>
                    )}
                  </>
                )}
                {tab === 'members' && (
                  <article className="panel">
                    <div className="toolbar">
                      <div className="search">
                        <Search size={18} />
                        <input
                          aria-label="Tìm hội viên"
                          placeholder="Tìm tên, số điện thoại hoặc mã…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                      <select
                        aria-label="Lọc trạng thái hội viên"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="">Tất cả</option>
                        {[
                          'Đang hoạt động',
                          'Hết hạn',
                          'Chưa có gói',
                          'Chưa đến hạn',
                          'Sắp hết hạn',
                          'Đã lưu trữ',
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <p className="muted">{members.length} hội viên</p>
                    {table(slice(members))}
                    <Pagination
                      page={Math.min(page, pages(members.length))}
                      pages={pages(members.length)}
                      setPage={setPage}
                    />
                  </article>
                )}
                {tab === 'plans' && (
                  <>
                    <div className="toolbar">
                      <div className="search">
                        <Search size={18} />
                        <input
                          aria-label="Tìm gói tập"
                          placeholder="Tìm tên gói tập…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                      <select
                        aria-label="Lọc gói tập"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Đang áp dụng</option>
                        <option value="0">Tạm ngưng</option>
                      </select>
                    </div>
                    <div className="plans-grid">
                      {slice(filteredPlans).map((p) => (
                        <article
                          className={
                            'plan-card ' + (!p.active ? 'inactive' : '')
                          }
                          key={p.id}
                        >
                          <span
                            className={
                              'badge ' + (p.active ? 'green' : 'neutral')
                            }
                          >
                            {p.active ? 'Đang áp dụng' : 'Tạm ngưng'}
                          </span>
                          <p className="eyebrow">
                            MÃ GÓI / {p.id.slice(-8).toUpperCase()}
                          </p>
                          <h2>{p.name}</h2>
                          <strong className="plan-price">
                            {money(p.price)}
                          </strong>
                          <p className="muted">/{p.days} ngày sử dụng</p>
                          <div className="plan-description">
                            {p.description}
                          </div>
                          {admin && (
                            <div className="plan-actions">
                              <button onClick={() => open('plan', p)}>
                                Chỉnh sửa
                              </button>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  run(
                                    {
                                      action: 'plan.toggle',
                                      id: p.id,
                                      active: !p.active,
                                    },
                                    'Đã cập nhật trạng thái gói.',
                                  )
                                }
                              >
                                {p.active ? 'Tạm ngưng' : 'Mở lại'}
                              </button>
                              <button
                                onClick={() =>
                                  confirm(
                                    'Xóa gói ' +
                                      p.name +
                                      '? Các đăng ký đã thanh toán vẫn giữ hiệu lực.',
                                    { action: 'plan.delete', id: p.id },
                                  )
                                }
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                    {!filteredPlans.length && (
                      <div className="empty-state">
                        Không có gói tập phù hợp.
                      </div>
                    )}
                    <Pagination
                      page={Math.min(page, pages(filteredPlans.length))}
                      pages={pages(filteredPlans.length)}
                      setPage={setPage}
                    />
                  </>
                )}
                {tab === 'payments' && (
                  <article className="panel">
                    <div className="toolbar payment-filters">
                      <label>
                        Từ ngày
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </label>
                      <label>
                        Đến ngày
                        <input
                          type="date"
                          min={dateFrom}
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </label>
                      <label>
                        Hội viên
                        <select
                          value={payMember}
                          onChange={(e) => setPayMember(e.target.value)}
                        >
                          <option value="">Tất cả hội viên</option>
                          {data.members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() => {
                          setDateFrom('');
                          setDateTo('');
                          setPayMember('');
                          setQuery('');
                        }}
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                    <div className="search">
                      <Search size={18} />
                      <input
                        aria-label="Tìm hóa đơn"
                        placeholder="Tìm tên hội viên hoặc mã hóa đơn…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <p className="muted">
                      {filteredPayments.length} hóa đơn ·{' '}
                      {money(
                        filteredPayments.reduce((s, p) => s + p.amount, 0),
                      )}
                    </p>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Mã / Ngày thu</th>
                            <th>Hội viên</th>
                            <th>Gói tập</th>
                            <th>Phương thức</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slice(filteredPayments).map((p) => (
                            <tr key={p.id}>
                              <td>
                                <button
                                  className="text-button"
                                  onClick={() => open('invoice', p)}
                                >
                                  #{p.id.slice(0, 8).toUpperCase()}
                                </button>
                                <small>{dateLabel(p.created_at)}</small>
                              </td>
                              <td>{nameOf(p.member_id)}</td>
                              <td>
                                {p.plan_name}
                                <small>
                                  {dateLabel(p.start_date)} –{' '}
                                  {dateLabel(p.end_date)}
                                </small>
                              </td>
                              <td>{p.method}</td>
                              <td className="lime">{money(p.amount)}</td>
                              <td>
                                <span className="badge green">
                                  Đã thanh toán
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!filteredPayments.length && (
                        <div className="empty-state">
                          Không có hóa đơn phù hợp.
                        </div>
                      )}
                    </div>
                    <Pagination
                      page={Math.min(page, pages(filteredPayments.length))}
                      pages={pages(filteredPayments.length)}
                      setPage={setPage}
                    />
                    <p className="muted">
                      Ghi nhận tiền đã thu; không thực hiện chuyển tiền trực
                      tuyến.
                    </p>
                  </article>
                )}
                {tab === 'checkins' && (
                  <>
                    <article className="panel checkin-panel">
                      <ScanLine className="lime" size={30} />
                      <div>
                        <h2>Chào mừng hội viên đến tập</h2>
                        <p className="muted">
                          Check-out trước khi bắt đầu lượt tập tiếp theo.
                        </p>
                      </div>
                      <span className="badge green">
                        {todayVisits.length} lượt hôm nay
                      </span>
                      <div className="search">
                        <Search size={18} />
                        <input
                          aria-label="Tìm hội viên điểm danh"
                          placeholder="Nhập tên, số điện thoại…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                    </article>
                    <article className="panel">
                      {slice(
                        data.members.filter(
                          (m) =>
                            search(m) &&
                            (!m.archived ||
                              data.checkins.some(
                                (c) =>
                                  c.member_id === m.id &&
                                  c.checkout_at === null,
                              )),
                        ),
                      ).map((m) => {
                        const current = data.checkins.some(
                            (c) =>
                              c.member_id === m.id && c.checkout_at === null,
                          ),
                          valid =
                            membership(m, data.payments, data.today).current &&
                            !m.archived;
                        return (
                          <div className="checkin-row" key={m.id}>
                            <div>
                              <b>{m.name}</b>
                              <small className="muted">
                                {m.phone} ·{' '}
                                {
                                  membership(m, data.payments, data.today)
                                    .status
                                }
                              </small>
                            </div>
                            <button
                              className={current ? '' : 'primary'}
                              disabled={busy || (!current && !valid)}
                              onClick={() =>
                                run(
                                  {
                                    action: current
                                      ? 'checkin.checkout'
                                      : 'checkin.create',
                                    member_id: m.id,
                                  },
                                  current ? 'Đã check-out.' : 'Đã điểm danh.',
                                )
                              }
                            >
                              {current
                                ? 'Check-out'
                                : valid
                                  ? 'Check-in'
                                  : 'Cần gia hạn'}
                            </button>
                          </div>
                        );
                      })}
                      <Pagination
                        page={Math.min(
                          page,
                          pages(data.members.filter(search).length),
                        )}
                        pages={pages(data.members.filter(search).length)}
                        setPage={setPage}
                      />
                    </article>
                    <article className="panel">
                      <h2>Lịch sử ra vào</h2>
                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Hội viên</th>
                              <th>Ngày</th>
                              <th>Giờ vào</th>
                              <th>Giờ ra</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.checkins
                              .filter((c) => {
                                const m = data.members.find(
                                  (m) => m.id === c.member_id,
                                );
                                return m && search(m);
                              })
                              .slice(0, 50)
                              .map((c) => (
                                <tr key={c.id}>
                                  <td>{nameOf(c.member_id)}</td>
                                  <td>{dateLabel(c.date)}</td>
                                  <td>
                                    {new Date(c.created_at).toLocaleTimeString(
                                      'vi-VN',
                                      {
                                        timeZone: 'Asia/Ho_Chi_Minh',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      },
                                    )}
                                  </td>
                                  <td>
                                    {c.checkout_at === 'legacy'
                                      ? 'Lịch sử cũ · chưa ghi giờ ra'
                                      : c.checkout_at
                                        ? new Date(
                                            c.checkout_at,
                                          ).toLocaleString('vi-VN', {
                                            timeZone: 'Asia/Ho_Chi_Minh',
                                          })
                                        : 'Đang trong phòng tập'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="muted">
                        Tối đa 50 lượt gần nhất · Giờ Việt Nam.
                      </p>
                    </article>
                  </>
                )}
                {['trainers', 'users', 'rooms', 'equipment'].includes(tab) && (
                  <Management
                    key={tab}
                    kind={tab}
                    rows={
                      data[tab as 'trainers' | 'users' | 'rooms' | 'equipment']
                    }
                    rooms={data.rooms}
                    role={user.role}
                    mutate={mutate}
                  />
                )}
              </>
            )
          )}
          <footer>
            <span>GYM LC / Quản lý phòng tập</span>
            <span>Bền bỉ mỗi ngày.</span>
          </footer>
        </section>
      </main>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setModal(null);
        }}
        aria-labelledby="dialog-title"
      >
        <form onSubmit={submit}>
          <div className="modal-heading">
            <h2 id="dialog-title">{modalTitle}</h2>
            <button
              className="icon-button"
              type="button"
              aria-label="Đóng"
              disabled={busy}
              onClick={() => setModal(null)}
            >
              <X />
            </button>
          </div>
          {modal?.kind === 'member' && (
            <div className="form-grid">
              <label className="full">
                Họ và tên *
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  {...field('name')}
                />
              </label>
              <label>
                Số điện thoại *
                <input
                  required
                  pattern="0[0-9]{9}"
                  title="10 chữ số bắt đầu bằng 0"
                  maxLength={10}
                  {...field('phone')}
                />
              </label>
              <label>
                Giới tính
                <select {...field('gender')}>
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </label>
              <label>
                Ngày sinh
                <input
                  type="date"
                  min="1900-01-01"
                  max={data.today}
                  {...field('birth_date')}
                />
              </label>
              <label>
                Email
                <input type="email" maxLength={120} {...field('email')} />
              </label>
              <label className="full">
                Địa chỉ
                <input maxLength={250} {...field('address')} />
              </label>
              <p className="muted full">
                Sau khi lưu, chọn Gia hạn để đăng ký gói tập.
              </p>
            </div>
          )}
          {modal?.kind === 'plan' && (
            <div className="form-grid">
              <label className="full">
                Tên gói *
                <input
                  required
                  minLength={2}
                  maxLength={60}
                  {...field('name')}
                />
              </label>
              <label>
                Thời hạn (ngày) *
                <input
                  type="number"
                  required
                  min={1}
                  max={730}
                  step={1}
                  {...field('days')}
                />
              </label>
              <label>
                Giá (VNĐ) *
                <input
                  type="number"
                  required
                  min={1000}
                  max={100000000}
                  step={1}
                  {...field('price')}
                />
              </label>
              <label className="full">
                Mô tả
                <input maxLength={200} {...field('description')} />
              </label>
              <p className="muted full">
                Thay đổi không ảnh hưởng giá và thời hạn các hóa đơn đã ghi
                nhận.
              </p>
            </div>
          )}
          {modal?.kind === 'payment' && (
            <div className="form-grid">
              <label className="full">
                Hội viên *
                <select required {...field('member_id')}>
                  <option value="">Chọn hội viên</option>
                  {live.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.phone}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full">
                Gói tập *
                <select required {...field('plan_id')}>
                  <option value="">Chọn gói tập</option>
                  {data.plans
                    .filter((p) => p.active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {money(p.price)}
                      </option>
                    ))}
                </select>
              </label>
              <label className="full">
                Ngày bắt đầu
                <input
                  type="date"
                  min={data.today}
                  max={data.today ? addDays(data.today, 730) : undefined}
                  {...field('start_date')}
                />
                <small>
                  Để trống: bắt đầu hôm nay hoặc nối tiếp gói hiện có.
                </small>
              </label>
              <label className="full">
                Phương thức thanh toán
                <select required {...field('method')}>
                  <option value="">Chọn phương thức</option>
                  <option>Tiền mặt</option>
                  <option>Chuyển khoản</option>
                </select>
              </label>
              {selectedPlan && form.member_id && (
                <div className="payment-total full">
                  <div>
                    <span>Tổng tiền</span>
                    <strong>{money(selectedPlan.price)}</strong>
                  </div>
                  <p>
                    Thời hạn: {dateLabel(start)} –{' '}
                    {dateLabel(addDays(start, selectedPlan.days - 1))}
                  </p>
                </div>
              )}
              <p className="muted full">Chỉ xác nhận khi đã nhận đủ tiền.</p>
            </div>
          )}
          {modal?.kind === 'confirm' && (
            <p className="archive-copy">{modal.title}</p>
          )}
          {modal?.kind === 'detail' && (
            <dl className="details">
              {(() => {
                const m = modal.value as Member,
                  s = membership(m, data.payments, data.today);
                return [
                  ['Mã hội viên', m.id],
                  ['Họ tên', m.name],
                  ['Ngày sinh', dateLabel(m.birth_date || '')],
                  ['Giới tính', m.gender],
                  ['Số điện thoại', m.phone],
                  ['Email', m.email || '—'],
                  ['Địa chỉ', m.address || '—'],
                  ['Ngày đăng ký', dateLabel(m.created_at)],
                  ['Gói tập', s.last?.plan_name || 'Chưa có gói'],
                  ['Ngày bắt đầu', dateLabel(s.last?.start_date || '')],
                  ['Ngày hết hạn', dateLabel(s.last?.end_date || '')],
                  ['Trạng thái', s.status],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ));
              })()}
            </dl>
          )}
          {modal?.kind === 'invoice' && (
            <dl className="details">
              {(() => {
                const p = modal.value as Payment;
                return [
                  ['Mã hóa đơn', p.id],
                  ['Hội viên', nameOf(p.member_id)],
                  ['Gói tập', p.plan_name],
                  ['Số tiền', money(p.amount)],
                  ['Ngày thanh toán', dateLabel(p.created_at)],
                  ['Phương thức', p.method],
                  ['Ngày bắt đầu', dateLabel(p.start_date)],
                  ['Ngày hết hạn', dateLabel(p.end_date)],
                  ['Trạng thái', 'Đã thanh toán'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ));
              })()}
            </dl>
          )}
          {formError && (
            <div role="alert" className="form-error">
              {formError}
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
            {modal &&
              ['member', 'plan', 'payment', 'confirm'].includes(modal.kind) && (
                <button className="primary" disabled={busy}>
                  {busy
                    ? 'Đang lưu…'
                    : modal.kind === 'payment'
                      ? 'Xác nhận đã thu tiền'
                      : modal.kind === 'confirm'
                        ? 'Xác nhận'
                        : 'Lưu thông tin'}
                </button>
              )}
          </div>
        </form>
      </dialog>
      {toast && (
        <div role="status" className="toast">
          {toast}
          <button
            className="icon-button"
            aria-label="Ẩn thông báo"
            onClick={() => setToast('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
