import { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080/api";

const today = () => new Date().toISOString().split("T")[0];

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("uz-UZ").format(n) + " so'm";

const statusBadge = (debt) => {
  const paid = debt.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
  if (paid >= debt.amount) return { label: "To'langan", color: "#22c55e" };
  if (paid > 0) return { label: "Qisman", color: "#f59e0b" };
  return { label: "To'lanmagan", color: "#ef4444" };
};

// ── tiny modal wrapper ────────────────────────────────────────────────────────
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

// ── field component ───────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Qarzlar() {
  const [debts, setDebts]     = useState([]);
  const [stocks, setStocks]   = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showAdd, setShowAdd]         = useState(false);
  const [showPay, setShowPay]         = useState(null);   // debt object
  const [showHistory, setShowHistory] = useState(null);   // debt object

  // add-debt form
  const [form, setForm] = useState({ date: today(), fromStock: "", toStock: "", amount: "" });
  // pay form
  const [payAmount, setPayAmount]   = useState("");
  const [payDate, setPayDate]       = useState(today());

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/stocks`)
      .then((r) => {
        console.log("stocks status:", r.status);
        if (!r.ok) throw new Error(`stocks ${r.status}`);
        return r.json();
      })
      .then((s) => {
        console.log("stocks data:", s);
        setStocks(s);
      })
      .catch((e) => console.error("stocks fetch error:", e));

    fetch(`${API_BASE}/debts`)
      .then((r) => {
        console.log("debts status:", r.status);
        if (!r.ok) throw new Error(`debts ${r.status}`);
        return r.json();
      })
      .then((d) => {
        console.log("debts data:", d);
        setDebts(d);
      })
      .catch((e) => console.error("debts fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  // ── add debt ───────────────────────────────────────────────────────────────
  async function handleAddDebt() {
    if (!form.date || !form.fromStock || !form.toStock || !form.amount) return;
    if (form.fromStock === form.toStock) return alert("Bir xil sklad tanlab bo'lmaydi");
    const body = {
      date: form.date,
      fromStockId: Number(form.fromStock),
      toStockId: Number(form.toStock),
      amount: Number(form.amount),
    };
    const res  = await fetch(`${API_BASE}/debts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const saved = await res.json();
    setDebts((prev) => [saved, ...prev]);
    setForm({ date: "", fromStock: "", toStock: "", amount: "" });
    setShowAdd(false);
  }

  // ── pay installment ────────────────────────────────────────────────────────
  async function handlePay() {
    if (!payAmount || Number(payAmount) <= 0) return;
    const debt = showPay;
    const paid = debt.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
    const remaining = debt.amount - paid;
    if (Number(payAmount) > remaining) return alert(`Qoldiq: ${fmt(remaining)}`);

    const body = { debtId: debt.id, amount: Number(payAmount), date: payDate };
    const res  = await fetch(`${API_BASE}/debts/${debt.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payment = await res.json();
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debt.id
          ? { ...d, payments: [...(d.payments ?? []), payment] }
          : d
      )
    );
    setPayAmount("");
    setPayDate(today());
    setShowPay(null);
  }

  // ── render ─────────────────────────────────────────────────────────────────
  const stockName = (id) => stocks.find((s) => s.id === id)?.name ?? id;

  if (loading) return <div style={styles.loading}>Yuklanmoqda…</div>;

  return (
    <div style={styles.page}>
      {/* header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Qarzlar</h1>
          <p style={styles.sub}>{debts.length} ta qarz ro'yxati</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          + Yangi qarz
        </button>
      </div>

      {/* table */}
      {debts.length === 0 ? (
        <div style={styles.empty}>Hozircha qarz yo'q</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Sana", "Kimdan", "Kimga", "Umumiy summa", "To'langan", "Qoldiq", "Holat", "Amallar"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {debts.map((debt) => {
                const paid      = debt.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
                const remaining = debt.amount - paid;
                const badge     = statusBadge(debt);
                return (
                  <tr key={debt.id} style={styles.tr}>
                    <td style={styles.td}>{debt.date}</td>
                    <td style={styles.td}>{stockName(debt.fromStockId)}</td>
                    <td style={styles.td}>{stockName(debt.toStockId)}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{fmt(debt.amount)}</td>
                    <td style={{ ...styles.td, color: "#22c55e" }}>{fmt(paid)}</td>
                    <td style={{ ...styles.td, color: remaining > 0 ? "#ef4444" : "#22c55e" }}>
                      {fmt(remaining)}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: badge.color + "22", color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => setShowHistory(debt)}
                        >
                          Tarix
                        </button>
                        {remaining > 0 && (
                          <button
                            style={{ ...styles.actionBtn, ...styles.payBtn }}
                            onClick={() => { setShowPay(debt); setPayDate(today()); setPayAmount(""); }}
                          >
                            To'lash
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD DEBT MODAL ── */}
      {showAdd && (
        <Modal title="Yangi qarz qo'shish" onClose={() => setShowAdd(false)}>
          <Field label="Sana">
            <input
              type="date"
              style={styles.input}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="Kimdan (qarz beruvchi sklad)">
            <select
              style={styles.input}
              value={form.fromStock}
              onChange={(e) => setForm({ ...form, fromStock: e.target.value })}
            >
              <option value="">— tanlang —</option>
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Kimga (qarz oluvchi sklad)">
            <select
              style={styles.input}
              value={form.toStock}
              onChange={(e) => setForm({ ...form, toStock: e.target.value })}
            >
              <option value="">— tanlang —</option>
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Summa (so'm)">
            <input
              type="number"
              min="1"
              placeholder="Masalan: 500000"
              style={styles.input}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </Field>
          <div style={styles.modalFooter}>
            <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Bekor</button>
            <button style={styles.saveBtn} onClick={handleAddDebt}>Saqlash</button>
          </div>
        </Modal>
      )}

      {/* ── PAY MODAL ── */}
      {showPay && (() => {
        const paid      = showPay.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;
        const remaining = showPay.amount - paid;
        return (
          <Modal title="Qarzni to'lash" onClose={() => setShowPay(null)}>
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span>Umumiy qarz:</span>
                <strong>{fmt(showPay.amount)}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>To'langan:</span>
                <strong style={{ color: "#22c55e" }}>{fmt(paid)}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Qoldiq:</span>
                <strong style={{ color: "#ef4444" }}>{fmt(remaining)}</strong>
              </div>
            </div>
            <Field label="To'lov sanasi">
              <input
                type="date"
                style={styles.input}
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </Field>
            <Field label={`To'lov miqdori (maks: ${fmt(remaining)})`}>
              <input
                type="number"
                min="1"
                max={remaining}
                placeholder={`1 – ${remaining}`}
                style={styles.input}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </Field>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowPay(null)}>Bekor</button>
              <button style={styles.saveBtn} onClick={handlePay}>To'lash</button>
            </div>
          </Modal>
        );
      })()}

      {/* ── PAYMENT HISTORY MODAL ── */}
      {showHistory && (
        <Modal
          title={`To'lov tarixi — ${stockName(showHistory.fromStockId)} → ${stockName(showHistory.toStockId)}`}
          onClose={() => setShowHistory(null)}
        >
          {(!showHistory.payments || showHistory.payments.length === 0) ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>
              Hali to'lov amalga oshirilmagan
            </p>
          ) : (
            <table style={{ ...styles.table, marginTop: 0 }}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Sana</th>
                  <th style={styles.th}>Summa</th>
                </tr>
              </thead>
              <tbody>
                {showHistory.payments.map((p, i) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{p.date}</td>
                    <td style={{ ...styles.td, color: "#22c55e", fontWeight: 600 }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ ...styles.infoBox, marginTop: 16 }}>
            <div style={styles.infoRow}>
              <span>Umumiy:</span>
              <strong>{fmt(showHistory.amount)}</strong>
            </div>
            <div style={styles.infoRow}>
              <span>To'langan:</span>
              <strong style={{ color: "#22c55e" }}>
                {fmt(showHistory.payments?.reduce((s, p) => s + p.amount, 0) ?? 0)}
              </strong>
            </div>
            <div style={styles.infoRow}>
              <span>Qoldiq:</span>
              <strong style={{ color: "#ef4444" }}>
                {fmt(showHistory.amount - (showHistory.payments?.reduce((s, p) => s + p.amount, 0) ?? 0))}
              </strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const styles = {
  page:      { padding: "24px", fontFamily: "'Segoe UI', sans-serif", color: "#1e293b" },
  loading:   { padding: 40, textAlign: "center", color: "#64748b" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  h1:        { margin: 0, fontSize: 26, fontWeight: 700 },
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
  tr:    { borderBottom: "1px solid #f1f5f9", transition: "background .15s" },
  td:    { padding: "12px 14px", fontSize: 14, whiteSpace: "nowrap" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  empty: { textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 16 },
  actionBtn: {
    padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: 6,
    background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569",
  },
  payBtn:  { background: "#dcfce7", borderColor: "#86efac", color: "#15803d" },

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
  closeBtn: {
    background: "none", border: "none", fontSize: 18, cursor: "pointer",
    color: "#94a3b8", lineHeight: 1,
  },
  modalBody:   { padding: "22px" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  label:  { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 },
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
  infoBox: {
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "14px 16px", marginBottom: 18,
  },
  infoRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: 14, color: "#475569", marginBottom: 6,
  },
};