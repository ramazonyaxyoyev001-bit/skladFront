import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://stock-production-703f.up.railway.app/api";

const today = () => new Date().toISOString().split("T")[0];

function Toast({ msg, err, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32,
      background: err ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${err ? "#fca5a5" : "#86efac"}`,
      borderLeft: `4px solid ${err ? "#ef4444" : "#22c55e"}`,
      color: err ? "#b91c1c" : "#15803d",
      padding: "14px 20px", borderRadius: 10,
      fontFamily: "'Segoe UI', sans-serif", fontSize: 13,
      boxShadow: "0 4px 20px rgba(0,0,0,.1)", zIndex: 200,
    }}>
      {msg}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export default function Hisobotlar() {
  const [view, setView] = useState("list");

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem("hisobotlar");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ start: today(), end: today(), stockId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    try { localStorage.setItem("hisobotlar", JSON.stringify(reports)); } catch {}
  }, [reports]);

  useEffect(() => {
    axios.get(`${API}/stocks`).then(r => setStocks(r.data)).catch(() => {});
  }, []);

  const showToast = (msg, err = false) => setToast({ msg, err });

  const handleOpen = () => {
    setForm({ start: today(), end: today(), stockId: "" });
    setError("");
    setShowModal(true);
  };

  const handleGenerate = async () => {
    if (!form.start || !form.end) { setError("Sanalarni kiriting"); return; }
    if (form.end < form.start) { setError("Tugash sanasi boshlanishdan oldin bo'lishi mumkin emas"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/reports`, {
        params: { start: form.start, end: form.end, ...(form.stockId ? { stockId: form.stockId } : {}) }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const stock = stocks.find(s => s.id === parseInt(form.stockId)) ?? null;
      const newReport = { id: Date.now(), start: form.start, end: form.end, stock, data };
      setReports(prev => [newReport, ...prev]);
      setShowModal(false);
      setActiveReport(newReport);
      setReportData(data);
      setView("detail");
      showToast("Hisobot yaratildi");
    } catch {
      setError("Hisobotni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (report) => {
    setActiveReport(report);
    setReportData(Array.isArray(report.data) ? report.data : []);
    setView("detail");
  };

  const safeData = Array.isArray(reportData) ? reportData : [];
  const totalInc = safeData.reduce((s, r) => s + (r.increased ?? 0), 0);
  const totalDec = safeData.reduce((s, r) => s + (r.decreased ?? 0), 0);
  const totalCur = totalInc - totalDec;

  /* ── LIST ── */
  if (view === "list") return (
    <div style={styles.page}>
      {/* header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Hisobotlar</h1>
          <p style={styles.sub}>{reports.length} ta hisobot ro'yxati</p>
        </div>
        <button style={styles.addBtn} onClick={handleOpen}>+ Yangi hisobot</button>
      </div>

      {/* list */}
      {reports.length === 0 ? (
        <div style={styles.empty}>Hozircha hisobot yo'q</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Ombor", "Boshlanish", "Tugash", "Mahsulotlar", ""].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>
                    {r.stock?.name ?? "Barcha omborlar"}
                  </td>
                  <td style={styles.td}>{r.start}</td>
                  <td style={styles.td}>{r.end}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: "#2563eb", color: "#eff6ff" }}>
                      {r.data.length} ta mahsulot 
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => openDetail(r)}>
                      Ko'rish →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {showModal && (
        <Modal title="Yangi hisobot" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Boshlanish sanasi">
              <input
                type="date" style={styles.input}
                value={form.start}
                onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
              />
            </Field>
            <Field label="Tugash sanasi">
              <input
                type="date" style={styles.input}
                value={form.end}
                onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Ombor (ixtiyoriy)">
            <select
              style={styles.input}
              value={form.stockId}
              onChange={e => setForm(f => ({ ...f, stockId: e.target.value }))}
            >
              <option value="">— Barcha omborlar —</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>⚠ {error}</p>
          )}

          <div style={styles.modalFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Bekor</button>
            <button style={styles.saveBtn} onClick={handleGenerate} disabled={loading}>
              {loading ? "Yuklanmoqda…" : "Yaratish"}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </div>
  );

  /* ── DETAIL ── */
  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => setView("list")}>← Orqaga</button>

      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>{activeReport?.stock?.name ?? "Barcha omborlar"}</h1>
          <p style={styles.sub}>Hisobot</p>
        </div>
      </div>

      {/* meta pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          ["Boshlanish", activeReport?.start],
          ["Tugash", activeReport?.end],
          ["Mahsulotlar", `${safeData.length} ta`],
        ].map(([k, v]) => (
          <div key={k} style={styles.metaPill}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>{k}: </span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Kodi", "Nomi", "Metr²", "Kirim ↑", "Chiqim ↓", "Joriy miqdor"].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: "center", padding: 48, color: "#94a3b8" }}>
                  — Bu davr uchun ma'lumot yo'q —
                </td>
              </tr>
            ) : (
              <>
                {safeData.map((row, i) => {
                  const cur = (row.increased ?? 0) - (row.decreased ?? 0);
                  return (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.codeTag}>{row.code ?? "—"}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 500, color: "#0f172a" }}>{row.name}</td>
                      <td style={styles.td}>{row.meterKvadrat ?? "—"}</td>
                      <td style={{ ...styles.td, color: "#16a34a", fontWeight: 600 }}>+{row.increased ?? 0}</td>
                      <td style={{ ...styles.td, color: "#dc2626", fontWeight: 600 }}>−{row.decreased ?? 0}</td>
                      <td style={{ ...styles.td, fontWeight: 700, color: cur >= 0 ? "#16a34a" : "#dc2626" }}>
                        {cur}
                      </td>
                    </tr>
                  );
                })}
                {/* summary */}
                <tr style={{ background: "#f1f5f9", borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={3} style={{ ...styles.td, fontWeight: 700, color: "#0f172a" }}>Jami</td>
                  <td style={{ ...styles.td, color: "#16a34a", fontWeight: 700 }}>+{totalInc.toFixed(2)}</td>
                  <td style={{ ...styles.td, color: "#dc2626", fontWeight: 700 }}>−{totalDec.toFixed(2)}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: totalCur >= 0 ? "#16a34a" : "#dc2626" }}>
                    {totalCur.toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const styles = {
  page:      { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1e293b" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  h1:        { margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a" },
  sub:       { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  addBtn: {
    background: "#2563eb", color: "#fff", border: "none",
    padding: "10px 20px", borderRadius: 8, cursor: "pointer",
    fontWeight: 600, fontSize: 14,
  },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    background: "#fff", cursor: "pointer", fontWeight: 600,
    fontSize: 13, color: "#64748b", marginBottom: 24,
  },
  tableWrap: { overflowX: "auto", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,.08)" },
  table:     { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: {
    background: "#f1f5f9", padding: "12px 14px", textAlign: "left",
    fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase",
    letterSpacing: ".04em", whiteSpace: "nowrap",
  },
  tr:   { borderBottom: "1px solid #f1f5f9", transition: "background .15s" },
  td:   { padding: "12px 14px", fontSize: 14, color: "#475569", whiteSpace: "nowrap" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  codeTag: {
    fontFamily: "monospace", fontSize: 12, background: "#f1f5f9",
    color: "#2563eb", padding: "3px 8px", borderRadius: 5,
  },
  metaPill: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "8px 16px", fontSize: 14,
  },
  empty: { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 16 },
  actionBtn: {
    padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6,
    background: "#eff6ff", cursor: "pointer", fontSize: 12,
    fontWeight: 600, color: "#2563eb",
  },

  // modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 460,
    boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
  },
  modalTitle: { fontWeight: 700, fontSize: 17, color: "#0f172a" },
  closeBtn:   { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" },
  modalBody:  { padding: "22px" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 },
  input: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
    color: "#0f172a", background: "#f8fafc",
  },
  cancelBtn: {
    padding: "9px 18px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#64748b",
  },
  saveBtn: {
    padding: "9px 22px", border: "none", borderRadius: 8,
    background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
  },
};