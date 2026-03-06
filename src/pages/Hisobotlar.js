import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

const today = () => new Date().toISOString().split("T")[0];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0f14; color: #e8e6e1; font-family: 'Syne', sans-serif; min-height: 100vh; }

  .page { max-width: 1100px; margin: 0 auto; padding: 48px 24px; }

  .header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; }
  .eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c8b560; margin-bottom: 6px; }
  h1 { font-size: 36px; font-weight: 800; color: #f0ede8; line-height: 1; }

  .new-btn {
    display: flex; align-items: center; gap: 8px;
    background: #c8b560; color: #0d0f14; border: none;
    padding: 12px 22px; font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer; transition: .2s;
    clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
  }
  .new-btn:hover { background: #dfc96e; }

  .reports-grid { display: flex; flex-direction: column; gap: 12px; }
  .report-card {
    background: #131620; border: 1px solid #1e2230; border-left: 3px solid #c8b560;
    padding: 20px 24px; cursor: pointer;
    display: flex; justify-content: space-between; align-items: center;
    transition: background .15s;
  }
  .report-card:hover { background: #181b27; }
  .report-card-left .rc-title { font-size: 15px; font-weight: 700; color: #f0ede8; margin-bottom: 4px; }
  .report-card-left .rc-dates { font-family: 'DM Mono', monospace; font-size: 12px; color: #888; }
  .rc-arrow { color: #c8b560; font-size: 20px; }

  .empty-state { text-align: center; padding: 64px; color: #3a3d50; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 1px; border: 1px dashed #1e2230; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn .2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  .modal { background: #13151f; border: 1px solid #1e2230; border-top: 3px solid #c8b560; width: 100%; max-width: 460px; padding: 36px; animation: slideUp .25s ease; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
  .modal-header h2 { font-size: 20px; font-weight: 700; color: #f0ede8; }
  .close-btn { background: none; border: 1px solid #2a2d3a; color: #888; width: 32px; height: 32px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: .2s; }
  .close-btn:hover { border-color: #c8b560; color: #c8b560; }

  .field { margin-bottom: 20px; }
  .field label { display: block; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .field input, .field select { width: 100%; background: #0d0f14; border: 1px solid #1e2230; color: #e8e6e1; padding: 12px 14px; font-family: 'Syne', sans-serif; font-size: 14px; outline: none; transition: border-color .2s; }
  .field input:focus, .field select:focus { border-color: #c8b560; }
  .field select option { background: #0d0f14; }

  .date-row { display: flex; gap: 12px; }
  .date-row .field { flex: 1; }

  .modal-actions { display: flex; gap: 12px; margin-top: 28px; }
  .submit-btn { flex: 1; background: #c8b560; color: #0d0f14; border: none; padding: 13px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: .2s; }
  .submit-btn:hover:not(:disabled) { background: #dfc96e; }
  .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
  .cancel-btn { flex: 1; background: transparent; color: #888; border: 1px solid #2a2d3a; padding: 13px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: .2s; }
  .cancel-btn:hover { border-color: #888; color: #ccc; }
  .error-msg { margin-top: 12px; font-family: 'DM Mono', monospace; font-size: 12px; color: #e05c5c; }

  .back-btn { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid #2a2d3a; color: #888; padding: 10px 18px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: .2s; margin-bottom: 32px; }
  .back-btn:hover { border-color: #c8b560; color: #c8b560; }

  .doc-meta { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
  .meta-pill { background: #131620; border: 1px solid #1e2230; padding: 10px 18px; font-family: 'DM Mono', monospace; font-size: 12px; color: #888; }
  .meta-pill span { color: #e8e6e1; font-weight: 500; }

  .table-wrap { border: 1px solid #1e2230; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 700px; }
  thead tr { background: #131620; border-bottom: 2px solid #c8b560; }
  thead th { padding: 14px 18px; text-align: left; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8b560; }
  tbody tr { border-bottom: 1px solid #1a1d28; transition: background .15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #131620; }
  tbody td { padding: 15px 18px; color: #ccc9c0; }

  .code-tag { font-family: 'DM Mono', monospace; font-size: 11px; color: #c8b560; background: #1a1d28; padding: 3px 8px; }
  .inc { color: #7dd87d; font-family: 'DM Mono', monospace; font-weight: 600; }
  .dec { color: #e07d7d; font-family: 'DM Mono', monospace; font-weight: 600; }
  .cur { font-family: 'DM Mono', monospace; font-weight: 700; }
  .cur.positive { color: #7dd87d; }
  .cur.negative { color: #e07d7d; }

  .summary-row { background: #131620 !important; border-top: 2px solid #c8b560 !important; }
  .summary-row td { color: #f0ede8 !important; font-weight: 700; }

  .empty-row td { text-align: center; padding: 48px; color: #3a3d50; font-family: 'DM Mono', monospace; font-size: 13px; }

  .toast { position: fixed; bottom: 32px; right: 32px; background: #1a2a1a; border: 1px solid #3a6a3a; border-left: 4px solid #5ab05a; color: #9dd49d; padding: 14px 20px; font-family: 'DM Mono', monospace; font-size: 13px; animation: slideUp .3s ease; z-index: 200; }
  .toast.err { background: #2a1a1a; border-color: #6a3a3a; border-left-color: #b05a5a; color: #e09d9d; }
`;

function Toast({ msg, err, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast${err ? " err" : ""}`}>{msg}</div>;
}

export default function Hisobotlar() {
  const [view, setView] = useState("list");

  // Load from localStorage on first render
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem("hisobotlar");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ start: today(), end: today(), stockId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);

  // Save to localStorage whenever reports change
  useEffect(() => {
    try {
      localStorage.setItem("hisobotlar", JSON.stringify(reports));
    } catch {}
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
        params: { start: form.start, end: form.end }
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
    } catch (e) {
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
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="header">
          <div>
            <p className="eyebrow">Ombor tizimi</p>
            <h1>Hisobotlar</h1>
          </div>
          <button className="new-btn" onClick={handleOpen}>+ Yangi hisobot</button>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">— Hisobotlar yo'q. Yangi hisobot yarating —</div>
        ) : (
          <div className="reports-grid">
            {reports.map(r => (
              <div className="report-card" key={r.id} onClick={() => openDetail(r)}>
                <div className="report-card-left">
                  <div className="rc-title">{r.stock?.name ?? "Barcha omborlar"}</div>
                  <div className="rc-dates">{r.start} → {r.end} &bull; {r.data.length} ta mahsulot</div>
                </div>
                <span className="rc-arrow">→</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Yangi hisobot</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="date-row">
              <div className="field">
                <label>Boshlanish sanasi</label>
                <input type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div className="field">
                <label>Tugash sanasi</label>
                <input type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>

            <div className="field">
              <label>Ombor (ixtiyoriy)</label>
              <select value={form.stockId} onChange={e => setForm(f => ({ ...f, stockId: e.target.value }))}>
                <option value="">— Barcha omborlar —</option>
                {stocks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {error && <p className="error-msg">⚠ {error}</p>}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Bekor</button>
              <button className="submit-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "Yuklanmoqda…" : "Yaratish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </>
  );

  /* ── DETAIL ── */
  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <button className="back-btn" onClick={() => setView("list")}>← Orqaga</button>

        <div className="header" style={{ marginBottom: 24 }}>
          <div>
            <p className="eyebrow">Hisobot</p>
            <h1>{activeReport?.stock?.name ?? "Barcha omborlar"}</h1>
          </div>
        </div>

        <div className="doc-meta">
          <div className="meta-pill">Boshlanish: <span>{activeReport?.start}</span></div>
          <div className="meta-pill">Tugash: <span>{activeReport?.end}</span></div>
          <div className="meta-pill">Mahsulotlar: <span>{safeData.length}</span></div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kodi</th>
                <th>Nomi</th>
                <th>Metr²</th>
                <th>Kirim ↑</th>
                <th>Chiqim ↓</th>
                <th>Joriy miqdor</th>
              </tr>
            </thead>
            <tbody>
              {safeData.length === 0 ? (
                <tr className="empty-row"><td colSpan={6}>— Bu davr uchun ma'lumot yo'q —</td></tr>
              ) : (
                <>
                  {safeData.map((row, i) => {
                    const cur = (row.increased ?? 0) - (row.decreased ?? 0);
                    return (
                      <tr key={i}>
                        <td><span className="code-tag">{row.code ?? "—"}</span></td>
                        <td>{row.name}</td>
                        <td style={{ fontFamily: "'DM Mono',monospace" }}>{row.meterKvadrat ?? "—"}</td>
                        <td><span className="inc">+{row.increased ?? 0}</span></td>
                        <td><span className="dec">−{row.decreased ?? 0}</span></td>
                        <td><span className={`cur ${cur >= 0 ? "positive" : "negative"}`}>{cur}</span></td>
                      </tr>
                    );
                  })}
                  <tr className="summary-row">
                    <td colSpan={3}>Jami</td>
                    <td><span className="inc">+{totalInc.toFixed(2)}</span></td>
                    <td><span className="dec">−{totalDec.toFixed(2)}</span></td>
                    <td><span className={`cur ${totalCur >= 0 ? "positive" : "negative"}`}>{totalCur.toFixed(2)}</span></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </>
  );
}