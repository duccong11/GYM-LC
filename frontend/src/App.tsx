import { useEffect, useState } from 'react';
import GymApp, { type Tab } from './views/GymApp';
import Login from './views/Login';
import { currentSession } from './services/auth.api';
import { permissions, type User } from './utils/security';
export default function App() {
  const [state, setState] = useState<{ user: User; csrf: string } | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  useEffect(() => {
    currentSession()
      .then((s) => {
        setState(s);
        if (!s && location.pathname !== '/login') location.replace('/login');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="login-screen">
        <p>Đang kết nối hệ thống…</p>
      </div>
    );
  if (error)
    return (
      <div className="login-screen">
        <section className="panel">
          <h1>Chưa kết nối được hệ thống</h1>
          <p role="alert">{error}</p>
          <button onClick={() => location.reload()}>Thử lại</button>
        </section>
      </div>
    );
  if (!state || location.pathname === '/login') return <Login />;
  const section =
    location.pathname === '/admin/users'
      ? 'users'
      : location.pathname.slice(1) ||
        (state.user.role === 'TRAINER' ? 'members' : 'overview');
  const all = [
    'overview',
    'members',
    'plans',
    'payments',
    'checkins',
    'trainers',
    'users',
    'rooms',
    'equipment',
  ];
  if (!all.includes(section))
    return (
      <section className="panel">
        <h1>404 · Không tìm thấy trang</h1>
        <a href="/">Về trang chính</a>
      </section>
    );
  if (!permissions[state.user.role].includes(section))
    return (
      <section className="panel">
        <h1>403 · Không có quyền truy cập</h1>
        <a href="/members">Về danh sách hội viên</a>
      </section>
    );
  return (
    <GymApp user={state.user} csrf={state.csrf} initialTab={section as Tab} />
  );
}
