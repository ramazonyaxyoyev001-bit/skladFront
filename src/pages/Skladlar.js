import { useState, useEffect } from "react";

const API_BASE = "https://stock-production-703f.up.railway.app/api";

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
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

export default function Skladlar() {
  const [stocks, setStocks]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [showEdit, setShowEdit] = useState(null); // stock object
  const [showDel, setShowDel]   = useState(null); // stock object
  const [name, setName]         = useState("");
  const [editName, setEditName] = useState("");
  const [error, setError]       = useState("");

  // ── fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/stocks`)
      .then((r) => r.json())
      .then(setStocks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── add ──────────────────────────────────────────────────────────────────
  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return setError("Sklad nomini kiriting");
    if (stocks.some((s) => s.name.toLowerCase() === trimmed.toLowerCase()))
      return setError("Bu nom allaqachon mavjud");

    const res  = await fetch(`${API_BASE}/stocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const saved = await res.json();
    setStocks((prev) => [...prev, saved]);
    setName("");
    setError("");
    setShowAdd(false);
  }

  // ── edit ─────────────────────────────────────────────────────────────────
  async function handleEdit() {
    const trimmed = editName.trim();
    if (!trimmed) return setError("Sklad nomini kiriting");

    const res  = await fetch(`${API_BASE}/stocks/${showEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const updated = await res.json();
    setStocks((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setShowEdit(null);
    setEditName("");
    setError("");
  }

  // ── delete ───────────────────────────────────────────────────────────────
  async function handleDelete() {
    await fetch(`${API_BASE}/stocks/${showDel.id}`, { method: "DELETE" });
    setStocks((prev) => prev.filter((s) => s.id !== showDel.id));
    setShowDel(null);
  }

  // ── render ───────────────────────────────────────────────────────────────
  if (loading) return <div style={styles.loading}>Yuklanmoqda…</div>;

  return (
    <div style={styles.page}>
      {/* header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Skladlar</h1>
          <p style={styles.sub}>{stocks.length} ta sklad ro'yxatda</p>
        </div>
        <button style={styles.addBtn} onClick={() => { setShowAdd(true); setName(""); setError(""); }}>
          + Yangi sklad
        </button>
      </div>

      {/* grid */}
      {stocks.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🏭</div>
          <p>Hozircha sklad yo'q</p>
          <button style={styles.addBtn} onClick={() => setShowAdd(true)}>Birinchi skladni qo'shing</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {stocks.map((stock, i) => (
            <div key={stock.id} style={styles.card}>
              <div style={{ ...styles.cardAccent, background: COLORS[i % COLORS.length] }} />
              <div style={styles.cardBody}>
                <div style={styles.cardIcon}>🏭</div>
                <div style={styles.cardName}>{stock.name}</div>
              </div>
              <div style={styles.cardActions}>
                <button
                  style={styles.editBtn}
                  onClick={() => { setShowEdit(stock); setEditName(stock.name); setError(""); }}
                >
                    Tahrirlash
                </button>
                <button
                  style={styles.delBtn}
                  onClick={() => setShowDel(stock)}
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {showAdd && (
        <Modal title="Yangi sklad qo'shish" onClose={() => setShowAdd(false)}>
          <label style={styles.label}>Sklad nomi</label>
          <input
            autoFocus
            style={styles.input}
            placeholder="Masalan: Asosiy sklad"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Bekor</button>
            <button style={styles.saveBtn} onClick={handleAdd}>Saqlash</button>
          </div>
        </Modal>
      )}

      {/* ── EDIT MODAL ── */}
      {showEdit && (
        <Modal title="Skladni tahrirlash" onClose={() => setShowEdit(null)}>
          <label style={styles.label}>Yangi nom</label>
          <input
            autoFocus
            style={styles.input}
            value={editName}
            onChange={(e) => { setEditName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          />
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={() => setShowEdit(null)}>Bekor</button>
            <button style={styles.saveBtn} onClick={handleEdit}>Saqlash</button>
          </div>
        </Modal>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDel && (
        <Modal title="Skladni o'chirish" onClose={() => setShowDel(null)}>
          <p style={{ color: "#475569", marginBottom: 20 }}>
            <strong>"{showDel.name}"</strong> skladini o'chirishni tasdiqlaysizmi?
            Bu amalni ortga qaytarib bo'lmaydi.
          </p>
          <div style={styles.footer}>
            <button style={styles.cancelBtn} onClick={() => setShowDel(null)}>Bekor</button>
            <button style={{ ...styles.saveBtn, background: "#ef4444" }} onClick={handleDelete}>
              O'chirish
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

const styles = {
  page:    { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1e293b" },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
  header:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  h1:      { margin: 0, fontSize: 26, fontWeight: 700 },
  sub:     { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  addBtn: {
    background: "#2563eb", color: "#fff", border: "none",
    padding: "10px 20px", borderRadius: 8, cursor: "pointer",
    fontWeight: 600, fontSize: 14,
  },
  empty: {
    textAlign: "center", padding: "60px 0", color: "#94a3b8",
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },

  // cards
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff", borderRadius: 12,
    boxShadow: "0 1px 8px rgba(0,0,0,.08)",
    overflow: "hidden", display: "flex", flexDirection: "column",
  },
  cardAccent: { height: 5 },
  cardBody: { padding: "20px 20px 12px", flexGrow: 1 },
  cardIcon: { fontSize: 28, marginBottom: 10 },
  cardName: { fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 },
  cardId:   { fontSize: 12, color: "#94a3b8" },
  cardActions: {
    display: "flex", gap: 8, padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
  },
  editBtn: {
    flex: 1, padding: "6px 0", border: "1px solid #e2e8f0",
    borderRadius: 6, background: "#f8fafc", cursor: "pointer",
    fontSize: 12, fontWeight: 600, color: "#475569",
  },
  delBtn: {
    padding: "6px 10px", border: "1px solid #fecaca",
    borderRadius: 6, background: "#fef2f2", cursor: "pointer", fontSize: 13,
  },

  // modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflow: "hidden",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
  },
  modalTitle: { fontWeight: 700, fontSize: 17, color: "#0f172a" },
  closeBtn: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "#94a3b8",
  },
  modalBody: { padding: "22px" },
  label:  { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 },
  input: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
    color: "#0f172a", background: "#f8fafc",
  },
  error:  { color: "#ef4444", fontSize: 13, marginTop: 6 },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: {
    padding: "9px 18px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#64748b",
  },
  saveBtn: {
    padding: "9px 22px", border: "none", borderRadius: 8,
    background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14,
  },
};