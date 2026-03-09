import { useEffect, useState } from "react";
import axios from "axios";

const API       = "http://localhost:8080/api/magazine/products";
const KIRIM_API = "http://localhost:8080/api/magazine/products/kirim";

const css = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .mag-row:hover { background: #f0f7ff !important; }
  .mag-btn-green:hover { background: #16a34a !important; }
  .mag-btn-red:hover   { background: #dc2626 !important; }
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

function ErrorBox({ children }) {
    return (
        <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
            padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 14
        }}>{children}</div>
    );
}

function MagazineHujjatlar() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const [kirimOpen, setKirimOpen]       = useState(false);
    const [kirimData, setKirimData]       = useState({ code: "", quantity: "" });
    const [kirimError, setKirimError]     = useState("");
    const [kirimLoading, setKirimLoading] = useState(false);

    const [chiqimOpen, setChiqimOpen]       = useState(false);
    const [chiqimCode, setChiqimCode]       = useState("");
    const [chiqimAmount, setChiqimAmount]   = useState("");
    const [chiqimError, setChiqimError]     = useState("");
    const [chiqimLoading, setChiqimLoading] = useState(false);

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

    async function handleKirim() {
        const { code, quantity } = kirimData;
        if (!code || !quantity) { setKirimError("Barcha maydonlarni to'ldiring"); return; }
        const exists = products.find(p => p.code === code);
        if (!exists) { setKirimError(`"${code}" kodli tavar yo'q`); return; }
        try {
            setKirimLoading(true); setKirimError("");
            await axios.post(KIRIM_API, { code, quantity: parseFloat(quantity) });
            await getProducts();
            setKirimOpen(false);
            setKirimData({ code: "", quantity: "" });
        } catch (err) {
            setKirimError(err.response?.data || err.message);
        } finally { setKirimLoading(false); }
    }

    async function handleChiqim() {
        if (!chiqimCode) { setChiqimError("Kodni kiriting"); return; }
        if (!chiqimAmount || parseFloat(chiqimAmount) <= 0) { setChiqimError("Miqdorni kiriting"); return; }
        const exists = products.find(p => p.code === chiqimCode);
        if (!exists) { setChiqimError(`"${chiqimCode}" kodli tavar yo'q`); return; }
        try {
            setChiqimLoading(true); setChiqimError("");
            await axios.put(`${API}/chiqim`, { code: chiqimCode, amount: parseFloat(chiqimAmount) });
            await getProducts();
            setChiqimOpen(false);
            setChiqimCode(""); setChiqimAmount("");
        } catch (err) {
            setChiqimError(err.response?.data || err.message);
        } finally { setChiqimLoading(false); }
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
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.3px", margin: 0 }}>
                        Magazin Hujjatlar
                    </h2>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="mag-btn-green"
                                onClick={() => { setKirimOpen(true); setKirimError(""); setKirimData({ code: "", quantity: "" }); }}
                                style={{
                                    padding: "10px 18px", borderRadius: 10, border: "none",
                                    background: "#22c55e", color: "#fff", fontWeight: 600,
                                    fontSize: 13, cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap"
                                }}>↑ Kirim</button>
                        <button className="mag-btn-red"
                                onClick={() => { setChiqimOpen(true); setChiqimError(""); setChiqimCode(""); setChiqimAmount(""); }}
                                style={{
                                    padding: "10px 18px", borderRadius: 10, border: "none",
                                    background: "#ef4444", color: "#fff", fontWeight: 600,
                                    fontSize: 13, cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap"
                                }}>↓ Chiqim</button>
                    </div>
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
                                <td colSpan={4} style={{ textAlign: "center", padding: "48px 20px", color: "#cbd5e1", fontSize: 14 }}>
                                    Mahsulotlar topilmadi
                                </td>
                            </tr>
                        ) : products.map((item, idx) => {
                            const c = getColor(item.quantity);
                            const pct = Math.min((item.quantity / maxQty) * 100, 100);
                            return (
                                <tr key={item.id} className="mag-row"
                                    style={{
                                        background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                                        borderBottom: "1px solid #f1f5f9", transition: "background 0.15s"
                                    }}>
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

                {/* KIRIM MODAL */}
                {kirimOpen && (
                    <Modal title="↑ Kirim" onClose={() => setKirimOpen(false)}>
                        <Field label="Tavar kodi" value={kirimData.code}
                               onChange={v => { setKirimData(p => ({ ...p, code: v })); setKirimError(""); }}
                               placeholder="Masalan: A101" />
                        {kirimData.code && (() => {
                            const found = products.find(p => p.code === kirimData.code);
                            return found ? (
                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#15803d" }}>
                                    ✓ <b>{found.name}</b> — qoldiq: <b>{found.quantity}</b>
                                </div>
                            ) : (
                                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#ef4444" }}>
                                    ✗ "{kirimData.code}" kodli tavar yo'q
                                </div>
                            );
                        })()}
                        <Field label="Miqdor" value={kirimData.quantity}
                               onChange={v => setKirimData(p => ({ ...p, quantity: v }))}
                               placeholder="0" type="number" />
                        {kirimError && <ErrorBox>{kirimError}</ErrorBox>}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setKirimOpen(false)} style={{
                                flex: 1, padding: "11px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                                background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer"
                            }}>Bekor</button>
                            <button onClick={handleKirim} disabled={kirimLoading} style={{
                                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                                background: kirimLoading ? "#86efac" : "#22c55e",
                                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer"
                            }}>{kirimLoading ? "Saqlanmoqda..." : "↑ Kirim qilish"}</button>
                        </div>
                    </Modal>
                )}

                {/* CHIQIM MODAL */}
                {chiqimOpen && (
                    <Modal title="↓ Chiqim" onClose={() => setChiqimOpen(false)}>
                        <Field label="Tavar kodi" value={chiqimCode}
                               onChange={v => { setChiqimCode(v); setChiqimError(""); }}
                               placeholder="Masalan: A101" />
                        {chiqimCode && (() => {
                            const found = products.find(p => p.code === chiqimCode);
                            return found ? (
                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#15803d" }}>
                                    ✓ <b>{found.name}</b> — qoldiq: <b>{found.quantity}</b>
                                </div>
                            ) : (
                                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#ef4444" }}>
                                    ✗ "{chiqimCode}" kodli tavar yo'q
                                </div>
                            );
                        })()}
                        <Field label="Ayirish miqdori" value={chiqimAmount}
                               onChange={v => setChiqimAmount(v)}
                               placeholder="0" type="number" />
                        {chiqimError && <ErrorBox>{chiqimError}</ErrorBox>}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setChiqimOpen(false)} style={{
                                flex: 1, padding: "11px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                                background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer"
                            }}>Bekor</button>
                            <button onClick={handleChiqim} disabled={chiqimLoading} style={{
                                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                                background: chiqimLoading ? "#fca5a5" : "#ef4444",
                                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer"
                            }}>{chiqimLoading ? "Saqlanmoqda..." : "↓ Chiqim qilish"}</button>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}

export default MagazineHujjatlar;