import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/magazine/hisobot";

const css = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(0.8); opacity: 0.3; }
    50%       { transform: scale(1.2); opacity: 1; }
  }
  .hisob-row:hover { background: #f0f7ff !important; }
  .delete-btn:hover { background: #dc2626 !important; }

  @media (max-width: 600px) {
    .hisob-topbar { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .hisob-table  { min-width: 420px !important; }
    .hisob-th, .hisob-td { padding: 10px 12px !important; font-size: 12px !important; }
    .hisob-title  { font-size: 18px !important; }
  }
`;

function ConfirmModal({ onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
            <div style={{
                background: "#fff", borderRadius: 16, width: "100%", maxWidth: 360,
                padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                animation: "fadeIn 0.2s ease", textAlign: "center"
            }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
                    Hamma tarixni o'chirish?
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
                    Bu amalni qaytarib bo'lmaydi. Barcha chiqim tarixi o'chib ketadi.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: "11px", borderRadius: 8,
                        border: "1.5px solid #e2e8f0", background: "#fff",
                        color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>Bekor</button>
                    <button onClick={onConfirm} className="delete-btn" style={{
                        flex: 1, padding: "11px", borderRadius: 8, border: "none",
                        background: "#ef4444", color: "#fff", fontWeight: 700,
                        fontSize: 14, cursor: "pointer", transition: "background 0.15s"
                    }}>O'chirish</button>
                </div>
            </div>
        </div>
    );
}

function MagazineHisobotlar() {
    const [tarix, setTarix]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [confirm, setConfirm]       = useState(false);
    const [deleting, setDeleting]     = useState(false);

    async function getTarix() {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get(API);
            setTarix(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAll() {
        try {
            setDeleting(true);
            await axios.delete(API);
            setTarix([]);
            setConfirm(false);
        } catch (err) {
            alert("Xato: " + err.message);
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => { getTarix(); }, []);

    function formatDate(dateStr) {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        const pad = n => String(n).padStart(2, "0");
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    if (loading) return (
        <>
            <style>{css}</style>
            <div style={{ display: "flex", alignItems: "center",
                justifyContent: "center", height: 300, gap: 8 }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%", background: "#3b82f6",
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                ))}
            </div>
        </>
    );

    if (error) return (
        <>
            <style>{css}</style>
            <div style={{ padding: 32, color: "#ef4444", fontSize: 14 }}>⚠ Xato: {error}</div>
        </>
    );

    return (
        <>
            <style>{css}</style>
            <div style={{ padding: "24px 16px" }}>

                {/* Top bar */}
                <div className="hisob-topbar" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 12, marginBottom: 20
                }}>
                    <div>
                        <h2 className="hisob-title" style={{
                            fontSize: 22, fontWeight: 700, color: "#1e293b",
                            letterSpacing: "-0.3px", margin: 0
                        }}>
                            Chiqim Hisobotlari
                        </h2>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                            Jami {tarix.length} ta yozuv
                        </p>
                    </div>

                    {tarix.length > 0 && (
                        <button className="delete-btn"
                                onClick={() => setConfirm(true)}
                                disabled={deleting}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "10px 18px", borderRadius: 10, border: "none",
                                    background: "#ef4444", color: "#fff", fontWeight: 600,
                                    fontSize: 13, cursor: "pointer", transition: "background 0.15s"
                                }}>
                            🗑 Hammasini o'chirish
                        </button>
                    )}
                </div>

                {/* Table */}
                {tarix.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "64px 20px",
                        background: "#fff", borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
                            Chiqim tarixi yo'q
                        </div>
                        <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
                            Tavar chiqim qilinganida bu yerda ko'rinadi
                        </div>
                    </div>
                ) : (
                    <div style={{
                        borderRadius: 14, border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                        overflowX: "auto", WebkitOverflowScrolling: "touch",
                        background: "#fff"
                    }}>
                        <table className="hisob-table" style={{
                            width: "100%", borderCollapse: "collapse", minWidth: 480
                        }}>
                            <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                {[
                                    { label: "#",       w: "5%"  },
                                    { label: "KOD",     w: "15%" },
                                    { label: "NOMI",    w: "30%" },
                                    { label: "MIQDOR",  w: "15%" },
                                    { label: "SANA",    w: "35%" },
                                ].map((h, i) => (
                                    <th key={i} className="hisob-th" style={{
                                        padding: "12px 16px", fontSize: 10, fontWeight: 600,
                                        color: "#94a3b8", textTransform: "uppercase",
                                        letterSpacing: "0.8px", textAlign: "left",
                                        width: h.w, whiteSpace: "nowrap"
                                    }}>{h.label}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {tarix.map((item, idx) => (
                                <tr key={item.id} className="hisob-row"
                                    style={{
                                        background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                                        borderBottom: "1px solid #f1f5f9",
                                        transition: "background 0.15s",
                                        animation: "fadeIn 0.2s ease"
                                    }}
                                >
                                    {/* # */}
                                    <td className="hisob-td" style={{
                                        padding: "12px 16px", fontSize: 12, color: "#cbd5e1"
                                    }}>
                                        {idx + 1}
                                    </td>

                                    {/* KOD */}
                                    <td className="hisob-td" style={{ padding: "12px 16px" }}>
                                            <span style={{
                                                background: "#eff6ff", color: "#3b82f6",
                                                padding: "3px 8px", borderRadius: 6,
                                                fontSize: 12, fontWeight: 600,
                                                fontFamily: "monospace", whiteSpace: "nowrap"
                                            }}>{item.productCode}</span>
                                    </td>

                                    {/* NOMI */}
                                    <td className="hisob-td" style={{
                                        padding: "12px 16px", fontSize: 13,
                                        fontWeight: 600, color: "#1e293b"
                                    }}>
                                        {item.productName}
                                    </td>

                                    {/* MIQDOR */}
                                    <td className="hisob-td" style={{ padding: "12px 16px" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                background: "#fef2f2", color: "#ef4444",
                                                padding: "3px 10px", borderRadius: 20,
                                                fontSize: 12, fontWeight: 700
                                            }}>
                                                <span style={{
                                                    width: 5, height: 5, borderRadius: "50%",
                                                    background: "#ef4444", flexShrink: 0
                                                }} />
                                                −{item.amount}
                                            </span>
                                    </td>

                                    {/* SANA */}
                                    <td className="hisob-td" style={{
                                        padding: "12px 16px", fontSize: 12,
                                        color: "#64748b", whiteSpace: "nowrap"
                                    }}>
                                        {formatDate(item.createdAt)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {confirm && (
                <ConfirmModal
                    onConfirm={handleDeleteAll}
                    onCancel={() => setConfirm(false)}
                />
            )}
        </>
    );
}

export default MagazineHisobotlar;