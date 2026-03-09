import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://stock-production-703f.up.railway.app/api/magazine/products";

const css = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mag-btn-blue:hover { background: #2563eb !important; }
`;

function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
            <div style={{
                background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden",
                animation: "fadeIn 0.2s ease"
            }}>
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 20px", borderBottom: "1px solid #f1f5f9"
                }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{title}</span>
                    <button onClick={onClose} style={{
                        background: "#f1f5f9", border: "none", borderRadius: 8,
                        width: 32, height: 32, cursor: "pointer", fontSize: 20,
                        color: "#64748b", display: "flex", alignItems: "center",
                        justifyContent: "center", lineHeight: 1
                    }}>×</button>
                </div>
                <div style={{ padding: "20px", overflowY: "auto", maxHeight: "70vh" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{
                display: "block", fontSize: 11, fontWeight: 600,
                color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px"
            }}>{label}</label>
            <input
                type={type} value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8,
                    border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b",
                    outline: "none", boxSizing: "border-box", background: "#fafbfc",
                    WebkitAppearance: "none"
                }}
                onFocus={e => e.target.style.border = "1.5px solid #3b82f6"}
                onBlur={e => e.target.style.border = "1.5px solid #e2e8f0"}
            />
        </div>
    );
}

function MagazineTavarlar() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    // Tavar qo'shish
    const [tavarOpen, setTavarOpen]       = useState(false);
    const [tavarData, setTavarData]       = useState({ code: "", name: "", meterKvadrat: "" });
    const [tavarError, setTavarError]     = useState("");
    const [tavarLoading, setTavarLoading] = useState(false);

    async function getProducts() {
        try {
            setLoading(true); setError(null);
            const { data } = await axios.get(API);
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { getProducts(); }, []);

    async function handleTavarAdd() {
        const { code, name, meterKvadrat } = tavarData;
        if (!code || !name || !meterKvadrat) { setTavarError("Barcha maydonlarni to'ldiring"); return; }
        try {
            setTavarLoading(true); setTavarError("");
            await axios.post(API, { code, name, meterKvadrat: parseFloat(meterKvadrat) });
            await getProducts();
            setTavarOpen(false);
            setTavarData({ code: "", name: "", meterKvadrat: "" });
        } catch (err) {
            setTavarError(err.response?.data || err.message);
        } finally { setTavarLoading(false); }
    }

    const getColor = (qty) => {
        if (qty <= 0) return { text: "#ef4444", bg: "#fee2e2", bar: "#ef4444" };
        if (qty < 10) return { text: "#f59e0b", bg: "#fef3c7", bar: "#f59e0b" };
        return            { text: "#22c55e", bg: "#dcfce7", bar: "#22c55e" };
    };

    const maxQty = Math.max(...products.map(p => p.quantity || 0), 1);

    if (loading) return <div style={{ padding: 40, color: "#888" }}>Yuklanmoqda...</div>;
    if (error)   return <div style={{ padding: 40, color: "#f87171" }}>Xato: {error}</div>;

    return (
        <>
            <style>{css}</style>
            <div style={{ padding: "32px 24px" }}>

                {/* Top bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 12, marginBottom: 20
                }}>
                    <h2 style={{
                        fontSize: 22, fontWeight: 700, color: "#1e293b",
                        letterSpacing: "-0.3px", margin: 0
                    }}>Magazin Tovarlar</h2>

                    <button className="mag-btn-blue"
                            onClick={() => { setTavarOpen(true); setTavarError(""); }}
                            style={{
                                padding: "10px 18px", borderRadius: 10, border: "none",
                                background: "#3b82f6", color: "#fff", fontWeight: 600,
                                fontSize: 13, cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap"
                            }}>＋ Tavar qo'shish</button>
                </div>

                {/* Table */}
                <div style={{
                    borderRadius: 14, border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                    overflowX: "auto", WebkitOverflowScrolling: "touch"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520, background: "#fff" }}>
                        <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            {[
                                { label: "KOD",    w: "15%" },
                                { label: "NOMI",   w: "30%" },
                                { label: "M²",     w: "15%" },
                                { label: "QOLDIQ", w: "40%" },
                            ].map((h, i) => (
                                <th key={i} style={{
                                    padding: "12px 20px", fontSize: 11, fontWeight: 600,
                                    color: "#94a3b8", textTransform: "uppercase",
                                    letterSpacing: "0.8px", textAlign: "left",
                                    width: h.w, whiteSpace: "nowrap"
                                }}>{h.label}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{
                                    textAlign: "center", padding: "48px 20px",
                                    color: "#cbd5e1", fontSize: 14
                                }}>Mahsulotlar topilmadi</td>
                            </tr>
                        ) : products.map((item, idx) => {
                            const c = getColor(item.quantity);
                            const pct = Math.min((item.quantity / maxQty) * 100, 100);
                            return (
                                <tr key={item.id}
                                    style={{
                                        background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                                        borderBottom: "1px solid #f1f5f9", transition: "background 0.15s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc"}
                                >
                                    <td style={{ padding: "14px 20px" }}>
                                            <span style={{
                                                background: "#eff6ff", color: "#3b82f6",
                                                padding: "3px 10px", borderRadius: 6,
                                                fontSize: 12, fontWeight: 600, fontFamily: "monospace"
                                            }}>{item.code}</span>
                                    </td>
                                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                                        {item.name}
                                    </td>
                                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#64748b" }}>
                                        {item.meterKvadrat}
                                        <span style={{ color: "#cbd5e1", fontSize: 11, marginLeft: 3 }}>m²</span>
                                    </td>
                                    <td style={{ padding: "10px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.bar, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{item.quantity}</span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 99, background: c.bg, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: c.bar, transition: "width 0.4s ease" }} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {products.length > 0 && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                        Jami <b style={{ color: "#475569" }}>{products.length}</b> ta mahsulot
                    </div>
                )}

                {/* TAVAR QO'SHISH MODAL */}
                {tavarOpen && (
                    <Modal title="＋ Yangi Tavar" onClose={() => setTavarOpen(false)}>
                        <Field label="Kod" value={tavarData.code}
                               onChange={v => setTavarData(p => ({ ...p, code: v }))}
                               placeholder="Masalan: A101" />
                        <Field label="Nomi" value={tavarData.name}
                               onChange={v => setTavarData(p => ({ ...p, name: v }))}
                               placeholder="Tavar nomi" />
                        <Field label="Metr kvadrat (m²)" value={tavarData.meterKvadrat}
                               onChange={v => setTavarData(p => ({ ...p, meterKvadrat: v }))}
                               placeholder="0.00" type="number" />
                        {tavarError && (
                            <div style={{
                                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                                padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 14
                            }}>{tavarError}</div>
                        )}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setTavarOpen(false)} style={{
                                flex: 1, padding: "11px", borderRadius: 8,
                                border: "1.5px solid #e2e8f0", background: "#fff",
                                color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer"
                            }}>Bekor</button>
                            <button onClick={handleTavarAdd} disabled={tavarLoading} style={{
                                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                                background: tavarLoading ? "#93c5fd" : "#3b82f6",
                                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer"
                            }}>{tavarLoading ? "Saqlanmoqda..." : "✓ Saqlash"}</button>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

export default MagazineTavarlar;