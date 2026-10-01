import { useState, useCallback, useEffect, useRef } from 'react';
import { mutateRequest, snapshotRequest } from '../services/gym.api';
import { empty, type Extended } from '../models/gym.model';
export function useGymController(csrf: string) {
  const [data,setData]=useState(empty), [error,setError]=useState(''), [toast,setToast]=useState(''), [loading,setLoading]=useState(true), [busy,setBusy]=useState(false);
  const lock=useRef(false);
  const refresh = useCallback(async () => {
    const r = await snapshotRequest();
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
  return {data,error,setError,toast,setToast,loading,busy,refresh,mutate};
}
