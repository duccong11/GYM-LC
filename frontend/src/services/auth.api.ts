export async function currentSession() {
  const r = await fetch('/api/auth', { cache: 'no-store' });
  if (r.status === 401) return null;
  if (!r.ok)
    throw new Error('Không kết nối được backend. Kiểm tra máy chủ và MySQL.');
  return r.json();
}
