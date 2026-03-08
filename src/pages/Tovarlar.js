import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/products";

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32,
      background: "#f0fdf4", border: "1px solid #86efac",
      borderLeft: "4px solid #22c55e", color: "#15803d",
      padding: "14px 20px", borderRadius: 10,
      fontFamily: "'Segoe UI', sans-serif", fontSize: 13,
      boxShadow: "0 4px 20px rgba(0,0,0,.1)", zIndex: 200,
    }}>
      {msg}
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

export default function Tovarlar() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", meterKvadrat: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fetchProducts = () => {
    axios.get(API).then(res => setProducts(res.data)).catch(console.error);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openModal = () => {
    setForm({ code: "", name: "", meterKvadrat: "" });
    setError("");
    setShowModal(true);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Mahsulot nomi kiritilishi shart."); return; }
    if (!form.meterKvadrat || isNaN(Number(form.meterKvadrat))) {
      setError("Metr kvadrat raqam bo'lishi kerak."); return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(API, {
        code: form.code.trim(),
        name: form.name.trim(),
        meterKvadrat: parseFloat(form.meterKvadrat),
      });
      fetchProducts();
      setShowModal(false);
      setToast("Mahsulot muvaffaqiyatli qo'shildi!");
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Tovarlar</h1>
          <p style={styles.sub}>{products.length} ta mahsulot ro'yxati</p>
        </div>
        <button style={styles.addBtn} onClick={openModal}>+ Yangi tovar</button>
      </div>

      {/* table */}
      {products.length === 0 ? (
        <div style={styles.empty}>Hozircha mahsulot yo'q</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Kodi", "Nomi", "Metr²", "Soni"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(item => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: 5 }}>
                      {item.code ?? "—"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 500, color: "#0f172a" }}>{item.name}</td>
                  <td style={styles.td}>{item.meterKvadrat ?? "—"} m²</td>
                  <td style={{ ...styles.td, fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                    {item.quantity ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {showModal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Yangi tovar qo'shish</span>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <Field label="Mahsulot kodi">
                <input
                  name="code" value={form.code} onChange={handleChange}
                  placeholder="Masalan: PLT-001" style={styles.input} autoFocus
                />
              </Field>
              <Field label="Mahsulot nomi">
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="Masalan: Granit plitka" style={styles.input}
                />
              </Field>
              <Field label="Metr kvadrat (m²)">
                <input
                  name="meterKvadrat" type="number" min="0" step="0.01"
                  value={form.meterKvadrat} onChange={handleChange}
                  placeholder="Masalan: 2.5" style={styles.input}
                />
              </Field>

              {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>⚠ {error}</p>}

              <div style={styles.modalFooter}>
                <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Bekor</button>
                <button style={styles.saveBtn} onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saqlanmoqda…" : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

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
  tableWrap: { overflowX: "auto", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,.08)" },
  table:     { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: {
    background: "#f1f5f9", padding: "12px 14px", textAlign: "left",
    fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase",
    letterSpacing: ".04em", whiteSpace: "nowrap",
  },
  tr:   { borderBottom: "1px solid #f1f5f9" },
  td:   { padding: "12px 14px", fontSize: 14, color: "#475569", whiteSpace: "nowrap" },
  empty: { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 16 },
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