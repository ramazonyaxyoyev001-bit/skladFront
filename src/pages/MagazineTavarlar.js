import { useEffect, useState } from "react";
import axios from "axios";

function MagazineTavarlar() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function getProducts() {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get("http://localhost:8080/api/magazine/products");
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { getProducts(); }, []);

    const maxQty = Math.max(...products.map(p => p.quantity || 0), 1);

    const getColor = (qty) => {
        if (qty <= 0)  return { text: "#ef4444", bg: "#fee2e2", bar: "#ef4444" };
        if (qty < 10)  return { text: "#f59e0b", bg: "#fef3c7", bar: "#f59e0b" };
        return             { text: "#22c55e", bg: "#dcfce7", bar: "#22c55e" };
    };

    if (loading) return <div style={{ padding: 40, color: "#888" }}>Yuklanmoqda...</div>;
    if (error)   return <div style={{ padding: 40, color: "#f87171" }}>Xato: {error}</div>;

    return (
        <div style={{ padding: "32px 24px" }}>

            <h2 style={{
                fontSize: 22, fontWeight: 700, color: "#1e293b",
                marginBottom: 20, letterSpacing: "-0.3px"
            }}>
                Magazin Tovarlar
            </h2>

            {/* TABLE WRAPPER — responsive */}
            <div style={{
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch"
            }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 520,
                    background: "#fff"
                }}>

                    {/* THEAD */}
                    <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                        {[
                            { label: "KOD",    w: "15%" },
                            { label: "NOMI",   w: "30%" },
                            { label: "M²",     w: "15%" },
                            { label: "QOLDIQ", w: "40%" },
                        ].map((h, i) => (
                            <th key={i} style={{
                                padding: "12px 20px",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#94a3b8",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                textAlign: "left",
                                width: h.w,
                                whiteSpace: "nowrap"
                            }}>{h.label}</th>
                        ))}
                    </tr>
                    </thead>

                    {/* TBODY */}
                    <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{
                                textAlign: "center", padding: "48px 20px",
                                color: "#cbd5e1", fontSize: 14
                            }}>
                                Mahsulotlar topilmadi
                            </td>
                        </tr>
                    ) : (
                        products.map((item, idx) => {
                            const c = getColor(item.quantity);
                            const pct = Math.min((item.quantity / maxQty) * 100, 100);

                            return (
                                <tr key={item.id}
                                    style={{
                                        background: idx % 2 === 0 ? "#ffffff" : "#fafbfc",
                                        borderBottom: "1px solid #f1f5f9",
                                        transition: "background 0.15s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#fafbfc"}
                                >
                                    {/* KOD */}
                                    <td style={{ padding: "14px 20px" }}>
                                            <span style={{
                                                background: "#eff6ff", color: "#3b82f6",
                                                padding: "3px 10px", borderRadius: 6,
                                                fontSize: 12, fontWeight: 600, fontFamily: "monospace"
                                            }}>
                                                {item.code}
                                            </span>
                                    </td>

                                    {/* NOMI */}
                                    <td style={{
                                        padding: "14px 20px", fontSize: 14,
                                        fontWeight: 600, color: "#1e293b"
                                    }}>
                                        {item.name}
                                    </td>

                                    {/* M² */}
                                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#64748b" }}>
                                        {item.meterKvadrat}
                                        <span style={{ color: "#cbd5e1", fontSize: 11, marginLeft: 3 }}>m²</span>
                                    </td>

                                    {/* QOLDIQ — raqam + progress bar tagma-tag */}
                                    <td style={{ padding: "10px 20px" }}>
                                        {/* Raqam */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            marginBottom: 5
                                        }}>
                                                <span style={{
                                                    width: 7, height: 7, borderRadius: "50%",
                                                    background: c.bar, flexShrink: 0
                                                }} />
                                            <span style={{
                                                fontSize: 13, fontWeight: 700, color: c.text
                                            }}>
                                                    {item.quantity}
                                                </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {products.length > 0 && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
                    Jami <b style={{ color: "#475569" }}>{products.length}</b> ta mahsulot
                </div>
            )}
        </div>
    );
}

export default MagazineTavarlar;