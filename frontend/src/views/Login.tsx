'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { Dumbbell, LockKeyhole } from 'lucide-react';
export default function Login() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: f.get('username'),
          password: f.get('password'),
        }),
      });
      const d = (await r.json()) as { error?: string; user?: { role: string } };
      if (!r.ok) throw new Error(d.error);
      location.assign(d.user?.role === 'TRAINER' ? '/members' : '/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không kết nối được máy chủ.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-screen">
      <section className="login-intro">
        <span className="brand">
          <span>
            <Dumbbell />
          </span>
          GYM<span className="lime">LC</span>
        </span>
        <p className="eyebrow">HỆ THỐNG QUẢN LÝ PHÒNG TẬP</p>
        <h1>
          Mỗi buổi tập.
          <br />
          Một bước tiến.
        </h1>
        <p>
          Quản lý hội viên, đội ngũ và hoạt động phòng tập trong cùng một không
          gian.
        </p>
      </section>
      <form className="login-form panel" method="post" onSubmit={submit}>
        <LockKeyhole size={30} className="lime" />
        <h1>Đăng nhập</h1>
        <p className="muted">Sử dụng tài khoản do quản trị viên cấp.</p>
        <label>
          Tên đăng nhập
          <input
            name="username"
            autoComplete="username"
            required
            maxLength={32}
            autoFocus
          />
        </label>
        <label>
          Mật khẩu
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </label>
        {error && (
          <div role="alert" className="form-error">
            {error}
          </div>
        )}
        <button className="primary" disabled={busy || !ready}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <small className="muted">
          Liên hệ Admin nếu tài khoản bị khóa hoặc quên mật khẩu.
        </small>
      </form>
    </div>
  );
}
