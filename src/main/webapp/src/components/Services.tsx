import { useState, useRef, useEffect } from "react";
import { filterServices } from "../utils/services";
import { canMutate, type Role } from "../utils/security";
export type Service = {
  id: string;
  name: string;
  description: string;
  active: number;
};
export type TrainerService = { trainer_id: string; service_id: string };
type Trainer = { id: string; name: string; active: number; specialty?: string };
export default function Services({
  rows,
  trainers,
  links,
  role,
  mutate,
}: {
  rows: Service[];
  trainers: Trainer[];
  links: TrainerService[];
  role: Role;
  mutate: (b: Record<string, unknown>, message: string) => Promise<unknown>;
}) {
  const [form, setForm] = useState<Partial<Service> | null>(null),
    [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const editable = canMutate(role, "service.save");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (form && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [form]);
  function open(row?: Service) {
    setError("");
    setForm({
      ...row,
      name: row?.name || "",
      description: row?.description || "",
      active: row?.active ?? 1,
    });
  }
  async function save() {
    if (!form || busy) return;
    setBusy(true);
    setError("");
    try {
      await mutate({ ...form, action: "service.save" }, "Đã lưu dịch vụ.");
      setForm(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: Service) {
    if (!confirm(`Ngừng và lưu trữ dịch vụ ${row.name}?`)) return;
    setBusy(true);
    setError("");
    try {
      await mutate({ action: "service.delete", id: row.id }, "Đã lưu trữ dịch vụ.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="panel workflow-panel">
      <h2>Quản lý dịch vụ</h2>
      <p className="muted">
        Chọn dịch vụ tại hồ sơ Huấn luyện viên. Khi đặt lịch, chỉ HLV của dịch vụ đã chọn và không
        trùng giờ mới xuất hiện.
      </p>
      <div className="toolbar">
        <input
          aria-label="Tìm dịch vụ"
          placeholder="Tìm Gym, Yoga, Boxing..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {editable && (
          <button className="primary" onClick={() => open()}>
            Thêm dịch vụ
          </button>
        )}
      </div>
      {error && !form && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Mô tả</th>
              <th>HLV được phân công</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filterServices(rows, query)
              .map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.description || "—"}</td>
                  <td>
                    {links
                      .filter((l) => l.service_id === r.id)
                      .map((l) => trainers.find((t) => t.id === l.trainer_id))
                      .filter(Boolean)
                      .map((t) => t!.name + (t!.active === 0 ? " (ngừng hoạt động)" : ""))
                      .join(", ") || "Chưa phân công HLV"}
                  </td>
                  <td>{r.active ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                  <td>
                    {editable && (
                      <>
                        <button disabled={busy} onClick={() => open(r)}>
                          Sửa {r.name}
                        </button>{" "}
                        <button disabled={busy} onClick={() => remove(r)}>
                          Xóa {r.name}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <p>Chưa có dịch vụ. Quản lý có thể thêm dịch vụ, sau đó phân công tại hồ sơ HLV.</p>
      )}
      {form && (
        <dialog
          ref={dialog}
          aria-label="Dịch vụ"
          onCancel={(e) => {
            e.preventDefault();
            if (!busy) setForm(null);
          }}
        >
          <form
            className="panel workflow-form"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <h2>{form.id ? "Sửa dịch vụ" : "Thêm dịch vụ"}</h2>
            <label>
              Tên dịch vụ
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Mô tả
              <input
                maxLength={500}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label>
              Trạng thái
              <select
                value={form.active}
                onChange={(e) => setForm({ ...form, active: Number(e.target.value) })}
              >
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Ngừng hoạt động</option>
              </select>
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button type="button" disabled={busy} onClick={() => setForm(null)}>
              Đóng
            </button>{" "}
            <button className="primary" disabled={busy}>
              {busy ? "Đang lưu…" : "Lưu dịch vụ"}
            </button>
          </form>
        </dialog>
      )}
    </article>
  );
}
