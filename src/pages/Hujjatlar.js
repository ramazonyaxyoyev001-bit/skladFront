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

function Modal({ title, onClose, children, large }) {
  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, ...(large ? { maxWidth: 780, maxHeight: "88vh", overflowY: "auto" } : {}) }}>
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

export default function Hujjatlar() {
  const [view, setView] = useState("list");
  const [documents, setDocuments] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [toast, setToast] = useState(null);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState(null);
  const [newDate, setNewDate] = useState(today());
  const [newStockId, setNewStockId] = useState("");
  const [creating, setCreating] = useState(false);

  const [activeDoc, setActiveDoc] = useState(null);
  const [search, setSearch] = useState("");
  const [docItems, setDocItems] = useState([]);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    fetchDocuments();
    axios.get(`${API}/stocks`).then(r => setStocks(r.data)).catch(() => {});
    axios.get(`${API}/products`).then(r => setAllProducts(r.data)).catch(() => {});
  }, []);

  const fetchDocuments = () => {
    axios.get(`${API}/documents`).then(r => setDocuments(r.data)).catch(() => {});
  };

  const showToast = (msg, err = false) => setToast({ msg, err });

  const handleCreate = () => {
    if (!newType) { showToast("Hujjat turini tanlang", true); return; }
    if (!newStockId) { showToast("Omborni tanlang", true); return; }
    openDetail({
      type: newType, date: newDate, stockId: newStockId,
      stock: stocks.find(s => s.id === parseInt(newStockId))
    });
    setShowNewModal(false);
  };

  const openDetail = async (doc) => {
    setActiveDoc(doc);
    setDocItems([]);
    setSearch("");
    setApproved(false);
    setView("detail");
    if (doc.id) {
      try {
        const res = await axios.get(`${API}/documents/${doc.id}/items`);
        setDocItems(res.data.map(i => ({ product: i.product, quantity: i.quantity })));
        setApproved(true);
      } catch { showToast("Mahsulotlarni yuklashda xatolik", true); }
    }
  };

  const filtered = search.trim().length > 0
    ? allProducts.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.code?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const addItem = (product) => {
    if (docItems.find(i => i.product.id === product.id)) {
      showToast("Bu mahsulot allaqachon qo'shilgan", true); return;
    }
    setDocItems(prev => [...prev, { product, quantity: 1 }]);
    setSearch("");
  };

  const changeQty = (productId, delta) => {
    setDocItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  const removeItem = (productId) => {
    setDocItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleApprove = async () => {
    if (docItems.length === 0) { showToast("Kamida 1 ta mahsulot qo'shing", true); return; }
    setApproving(true);
    try {
      await axios.post(`${API}/documents`, {
        stockId: parseInt(activeDoc.stockId),
        type: activeDoc.type,
        date: activeDoc.date,
        items: docItems.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      });
      setApproved(true);
      fetchDocuments();
      showToast("Hujjat tasdiqlandi!");
    } catch (e) {
      showToast(e.response?.data || "Xatolik yuz berdi", true);
    } finally {
      setApproving(false);
    }
  };

  /* ── LIST ── */
  if (view === "list") return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Hujjatlar</h1>
          <p style={styles.sub}>{documents.length} ta hujjat ro'yxati</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ ...styles.addBtn, background: "#dcfce7", color: "#15803d", border: "1.5px solid #86efac" }}
            onClick={() => { setNewType("IN"); setNewDate(today()); setNewStockId(""); setShowNewModal(true); }}
          >
            + Kirim hujjati
          </button>
          <button
            style={{ ...styles.addBtn, background: "#fef2f2", color: "#b91c1c", border: "1.5px solid #fca5a5" }}
            onClick={() => { setNewType("OUT"); setNewDate(today()); setNewStockId(""); setShowNewModal(true); }}
          >
            − Chiqim hujjati
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div style={styles.empty}>Hozircha hujjat yo'q</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["#", "Sana", "Turi", "Ombor", ""].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontFamily: "monospace", color: "#2563eb", fontWeight: 700 }}>#{doc.id}</td>
                  <td style={styles.td}>{doc.date}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: doc.type === "IN" ? "#dcfce7" : "#fef2f2",
                      color: doc.type === "IN" ? "#15803d" : "#b91c1c",
                    }}>
                      {doc.type === "IN" ? "Kirim" : "Chiqim"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 500, color: "#0f172a" }}>{doc.stock?.name ?? "—"}</td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => openDetail(doc)}>Ko'rish →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNewModal && (
        <Modal title="Yangi hujjat" onClose={() => setShowNewModal(false)}>
          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Hujjat turi</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {[["IN", "↑ Kirim", "#dcfce7", "#15803d", "#86efac"], ["OUT", "↓ Chiqim", "#fef2f2", "#b91c1c", "#fca5a5"]].map(([val, label, bg, color, border]) => (
                <button
                  key={val}
                  onClick={() => setNewType(val)}
                  style={{
                    flex: 1, padding: "12px", border: `2px solid ${newType === val ? border : "#e2e8f0"}`,
                    borderRadius: 8, background: newType === val ? bg : "#f8fafc",
                    color: newType === val ? color : "#94a3b8",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Sana">
            <input type="date" style={styles.input} value={newDate} onChange={e => setNewDate(e.target.value)} />
          </Field>
          <Field label="Ombor">
            <select style={styles.input} value={newStockId} onChange={e => setNewStockId(e.target.value)}>
              <option value="">— Tanlang —</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          <div style={styles.modalFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowNewModal(false)}>Bekor</button>
            <button style={styles.saveBtn} onClick={handleCreate} disabled={creating}>
              {creating ? "Yaratilmoqda…" : "Yaratish"}
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
          <h1 style={styles.h1}>{activeDoc?.type === "IN" ? "Kirim" : "Chiqim"}</h1>
          <p style={styles.sub}>Hujjat #{activeDoc?.id ?? "Yangi"}</p>
        </div>
        {approved && (
          <span style={{ ...styles.badge, background: "#dcfce7", color: "#15803d", fontSize: 13, padding: "8px 16px" }}>
            ✓ Tasdiqlandi
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[["Sana", activeDoc?.date], ["Turi", activeDoc?.type === "IN" ? "Kirim" : "Chiqim"], ["Ombor", activeDoc?.stock?.name ?? "—"]].map(([k, v]) => (
          <div key={k} style={styles.metaPill}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>{k}: </span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{v}</span>
          </div>
        ))}
      </div>

      {!approved && (
        <>
          <div style={{ position: "relative", marginBottom: 4 }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#94a3b8" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Mahsulotni nomi yoki kodi bo'yicha qidiring…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              style={{ ...styles.input, paddingLeft: 40 }}
            />
          </div>

          {filtered.length > 0 && (
            <div style={{ border: "1.5px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 8px 8px", background: "#fff", maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
              {filtered.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div>
                    <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#2563eb", marginTop: 2 }}>{p.code}</div>
                  </div>
                  <button style={{ ...styles.actionBtn, background: "#eff6ff", color: "#2563eb" }} onClick={() => addItem(p)}>
                    + Qo'shish
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {docItems.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Kodi", "Nomi", "Miqdor", ...(!approved ? [""] : [])].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docItems.map(item => (
                <tr key={item.product.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: 5 }}>
                      {item.product.code}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 500, color: "#0f172a" }}>{item.product.name}</td>
                  <td style={styles.td}>
                    {approved ? (
                      <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{item.quantity}</span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button style={styles.qtyBtn} onClick={() => changeQty(item.product.id, -1)}>−</button>
                        <span style={{ fontFamily: "monospace", minWidth: 36, textAlign: "center", fontWeight: 600 }}>{item.quantity}</span>
                        <button style={styles.qtyBtn} onClick={() => changeQty(item.product.id, +1)}>+</button>
                      </div>
                    )}
                  </td>
                  {!approved && (
                    <td style={styles.td}>
                      <button
                        style={{ padding: "5px 12px", border: "1px solid #fca5a5", borderRadius: 6, background: "#fef2f2", color: "#b91c1c", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        onClick={() => removeItem(item.product.id)}
                      >
                        O'chirish
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!approved && (
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{ ...styles.saveBtn, padding: "12px 32px", opacity: approving || docItems.length === 0 ? 0.5 : 1, cursor: approving || docItems.length === 0 ? "not-allowed" : "pointer" }}
            onClick={handleApprove}
            disabled={approving || docItems.length === 0}
          >
            {approving ? "Tasdiqlanmoqda…" : "✓ Tasdiqlash"}
          </button>
        </div>
      )}

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </div>
  );
}

const styles = {
  page:      { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1e293b" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  h1:        { margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a" },
  sub:       { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  addBtn:    { padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, border: "none" },
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
  tr:   { borderBottom: "1px solid #f1f5f9" },
  td:   { padding: "12px 14px", fontSize: 14, color: "#475569", whiteSpace: "nowrap" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  empty: { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 16 },
  actionBtn: {
    padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6,
    background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569",
  },
  qtyBtn: {
    width: 28, height: 28, border: "1.5px solid #e2e8f0", borderRadius: 6,
    background: "#f8fafc", cursor: "pointer", fontSize: 16, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", color: "#475569",
  },
  metaPill: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "8px 16px", fontSize: 14,
  },
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