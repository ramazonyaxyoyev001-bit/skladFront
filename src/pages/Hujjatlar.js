import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api";

const today = () => new Date().toISOString().split("T")[0];

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0f14; color: #e8e6e1; font-family: 'Syne', sans-serif; min-height: 100vh; }

  .page { max-width: 980px; margin: 0 auto; padding: 48px 24px; }

  /* HEADER */
  .header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; }
  .eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c8b560; margin-bottom: 6px; }
  h1 { font-size: 36px; font-weight: 800; color: #f0ede8; line-height: 1; }

  /* ACTION BUTTONS */
  .action-row { display: flex; gap: 12px; margin-bottom: 36px; }
  .btn-in  { background: #1a3a1a; border: 1px solid #3a6a3a; color: #7dd87d; padding: 13px 24px; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:.2s; }
  .btn-in:hover  { background: #1f4a1f; border-color:#5ab05a; }
  .btn-out { background: #3a1a1a; border: 1px solid #6a3a3a; color: #e07d7d; padding: 13px 24px; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:.2s; }
  .btn-out:hover { background: #4a1f1f; border-color:#b05a5a; }

  /* DOCUMENTS TABLE */
  .table-wrap { border: 1px solid #1e2230; overflow: hidden; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead tr { background: #131620; border-bottom: 2px solid #c8b560; }
  thead th { padding: 14px 20px; text-align: left; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #c8b560; }
  tbody tr { border-bottom: 1px solid #1a1d28; transition: background .15s; cursor: pointer; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #131620; }
  tbody td { padding: 16px 20px; color: #ccc9c0; }
  .empty-row td { text-align: center; padding: 48px; color: #3a3d50; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 1px; cursor: default; }

  .badge-in  { background:#1a3a1a; color:#7dd87d; border:1px solid #3a6a3a; padding:3px 10px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:1px; }
  .badge-out { background:#3a1a1a; color:#e07d7d; border:1px solid #6a3a3a; padding:3px 10px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:1px; }

  /* OVERLAY & MODAL */
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; animation:fadeIn .2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  .modal { background:#13151f; border:1px solid #1e2230; border-top:3px solid #c8b560; width:100%; max-width:460px; padding:36px; animation:slideUp .25s ease; }
  .modal-lg { max-width: 780px; max-height: 88vh; overflow-y: auto; }
  .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
  .modal-header h2 { font-size:20px; font-weight:700; color:#f0ede8; }
  .close-btn { background:none; border:1px solid #2a2d3a; color:#888; width:32px; height:32px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:.2s; }
  .close-btn:hover { border-color:#c8b560; color:#c8b560; }

  .field { margin-bottom: 20px; }
  .field label { display:block; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#888; margin-bottom:8px; }
  .field input, .field select { width:100%; background:#0d0f14; border:1px solid #1e2230; color:#e8e6e1; padding:12px 14px; font-family:'Syne',sans-serif; font-size:14px; outline:none; transition:border-color .2s; }
  .field input:focus, .field select:focus { border-color:#c8b560; }
  .field select option { background:#0d0f14; }

  .type-row { display:flex; gap:12px; margin-bottom:20px; }
  .type-btn { flex:1; padding:14px; border:2px solid #1e2230; background:transparent; color:#888; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:.2s; }
  .type-btn.active-in  { border-color:#5ab05a; background:#1a3a1a; color:#7dd87d; }
  .type-btn.active-out { border-color:#b05a5a; background:#3a1a1a; color:#e07d7d; }
  .type-btn:hover { border-color:#444; color:#ccc; }

  .modal-actions { display:flex; gap:12px; margin-top:28px; }
  .submit-btn { flex:1; background:#c8b560; color:#0d0f14; border:none; padding:13px; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:.2s; }
  .submit-btn:hover:not(:disabled) { background:#dfc96e; }
  .submit-btn:disabled { opacity:.5; cursor:not-allowed; }
  .cancel-btn { flex:1; background:transparent; color:#888; border:1px solid #2a2d3a; padding:13px; font-family:'Syne',sans-serif; font-size:13px; font-weight:600; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:.2s; }
  .cancel-btn:hover { border-color:#888; color:#ccc; }

  .error-msg { margin-top:12px; font-family:'DM Mono',monospace; font-size:12px; color:#e05c5c; letter-spacing:.5px; }

  /* DOCUMENT DETAIL PAGE */
  .back-btn { display:flex; align-items:center; gap:8px; background:none; border:1px solid #2a2d3a; color:#888; padding:10px 18px; font-family:'Syne',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:.2s; margin-bottom:32px; }
  .back-btn:hover { border-color:#c8b560; color:#c8b560; }

  .doc-meta { display:flex; gap:24px; margin-bottom:32px; flex-wrap:wrap; }
  .meta-pill { background:#131620; border:1px solid #1e2230; padding:10px 18px; font-family:'DM Mono',monospace; font-size:12px; color:#888; }
  .meta-pill span { color:#e8e6e1; font-weight:500; }

  .search-bar { position:relative; margin-bottom:20px; }
  .search-bar input { width:100%; background:#0d0f14; border:1px solid #1e2230; color:#e8e6e1; padding:13px 14px 13px 44px; font-family:'Syne',sans-serif; font-size:14px; outline:none; transition:border-color .2s; }
  .search-bar input:focus { border-color:#c8b560; }
  .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#555; width:18px; height:18px; }

  .product-search-results { border:1px solid #1e2230; border-top:none; background:#0d0f14; max-height:220px; overflow-y:auto; }
  .product-row { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #1a1d28; transition:background .15s; }
  .product-row:last-child { border-bottom:none; }
  .product-row:hover { background:#131620; }
  .product-info .pname { font-size:14px; color:#e8e6e1; }
  .product-info .pcode { font-family:'DM Mono',monospace; font-size:11px; color:#c8b560; margin-top:2px; }
  .add-product-btn { background:#c8b560; color:#0d0f14; border:none; padding:6px 14px; font-family:'Syne',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:.2s; }
  .add-product-btn:hover { background:#dfc96e; }

  .items-table-wrap { border:1px solid #1e2230; overflow:hidden; margin-top:24px; }
  .qty-controls { display:flex; align-items:center; gap:8px; }
  .qty-btn { width:28px; height:28px; background:#1e2230; border:none; color:#e8e6e1; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:.2s; }
  .qty-btn:hover { background:#c8b560; color:#0d0f14; }
  .qty-val { font-family:'DM Mono',monospace; font-size:14px; min-width:40px; text-align:center; }
  .remove-btn { background:none; border:1px solid #3a1a1a; color:#e07d7d; padding:5px 10px; font-size:11px; font-family:'DM Mono',monospace; cursor:pointer; transition:.2s; margin-left:8px; }
  .remove-btn:hover { background:#3a1a1a; }

  .approve-row { margin-top:28px; display:flex; justify-content:flex-end; }
  .approve-btn { background:#c8b560; color:#0d0f14; border:none; padding:14px 36px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; letter-spacing:1px; text-transform:uppercase; cursor:pointer; transition:.2s; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); }
  .approve-btn:hover:not(:disabled) { background:#dfc96e; }
  .approve-btn:disabled { opacity:.5; cursor:not-allowed; }

  .approved-badge { background:#1a3a1a; border:1px solid #3a6a3a; color:#7dd87d; padding:10px 20px; font-family:'DM Mono',monospace; font-size:12px; letter-spacing:1px; }

  /* TOAST */
  .toast { position:fixed; bottom:32px; right:32px; background:#1a2a1a; border:1px solid #3a6a3a; border-left:4px solid #5ab05a; color:#9dd49d; padding:14px 20px; font-family:'DM Mono',monospace; font-size:13px; letter-spacing:.5px; animation:slideUp .3s ease; z-index:200; }
  .toast.err { background:#2a1a1a; border-color:#6a3a3a; border-left-color:#b05a5a; color:#e09d9d; }
`;

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
function Toast({ msg, err, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast${err ? " err" : ""}`}>{msg}</div>;
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function Hujjatlar() {
  const [view, setView] = useState("list"); // "list" | "detail"
  const [documents, setDocuments] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [toast, setToast] = useState(null);

  // new document modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState(null);
  const [newDate, setNewDate] = useState(today());
  const [newStockId, setNewStockId] = useState("");
  const [creating, setCreating] = useState(false);

  // detail view
  const [activeDoc, setActiveDoc] = useState(null);
  const [search, setSearch] = useState("");
  const [docItems, setDocItems] = useState([]); // {product, quantity}
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

  /* ── Create document ── */
  const handleCreate = () => {
    if (!newType) { showToast("Hujjat turini tanlang", true); return; }
    if (!newStockId) { showToast("Omborni tanlang", true); return; }
    
    openDetail({ 
        type: newType, 
        date: newDate, 
        stockId: newStockId,
        stock: stocks.find(s => s.id === parseInt(newStockId))
    });
    setShowNewModal(false);
};

  /* ── Open detail ── */
  const openDetail = async (doc) => {
    setActiveDoc(doc);
    setDocItems([]);
    setSearch("");
    setApproved(false);
    setView("detail");

    // if existing document, fetch its items
    if (doc.id) {
        try {
            const res = await axios.get(`${API}/documents/${doc.id}/items`);
            const items = res.data.map(i => ({
                product: i.product,
                quantity: i.quantity
            }));
            setDocItems(items);
            setApproved(true); // existing docs are already approved, lock editing
        } catch (e) {
            showToast("Mahsulotlarni yuklashda xatolik", true);
        }
    }
};

  /* ── Product search ── */
  const filtered = search.trim().length > 0
    ? allProducts.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.code?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const addItem = (product) => {
    if (docItems.find(i => i.product.id === product.id)) {
      showToast("Bu mahsulot allaqachon qo'shilgan", true);
      return;
    }
    setDocItems(prev => [...prev, { product, quantity: 1 }]);
    setSearch("");
  };

  const changeQty = (productId, delta) => {
    setDocItems(prev => prev.map(i =>
      i.product.id === productId
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i
    ));
  };

  const removeItem = (productId) => {
    setDocItems(prev => prev.filter(i => i.product.id !== productId));
  };

  /* ── Approve ── */
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

  /* ─── RENDER: LIST ──────────────────────────────────────────────────────── */
  if (view === "list") return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="header">
          <div>
            <p className="eyebrow">Ombor tizimi</p>
            <h1>Hujjatlar</h1>
          </div>
        </div>

        <div className="action-row">
          <button className="btn-in" onClick={() => { setNewType("IN"); setNewDate(today()); setNewStockId(""); setShowNewModal(true); }}>
            + Kirim hujjati
          </button>
          <button className="btn-out" onClick={() => { setNewType("OUT"); setNewDate(today()); setNewStockId(""); setShowNewModal(true); }}>
            − Chiqim hujjati
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Sana</th>
                <th>Turi</th>
                <th>Ombor</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr className="empty-row"><td colSpan={4}>— Hujjatlar yo'q —</td></tr>
              ) : documents.map(doc => (
                <tr key={doc.id} onClick={() => openDetail(doc)}>
                  <td style={{ fontFamily: "'DM Mono', monospace", color: "#c8b560" }}>#{doc.id}</td>
                  <td>{doc.date}</td>
                  <td><span className={doc.type === "IN" ? "badge-in" : "badge-out"}>{doc.type === "IN" ? "Kirim" : "Chiqim"}</span></td>
                  <td>{doc.stock?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW DOCUMENT MODAL */}
      {showNewModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowNewModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Yangi hujjat</h2>
              <button className="close-btn" onClick={() => setShowNewModal(false)}>×</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#888", display: "block", marginBottom: 8 }}>Hujjat turi</label>
              <div className="type-row">
                <button className={`type-btn${newType === "IN" ? " active-in" : ""}`} onClick={() => setNewType("IN")}>↑ Kirim</button>
                <button className={`type-btn${newType === "OUT" ? " active-out" : ""}`} onClick={() => setNewType("OUT")}>↓ Chiqim</button>
              </div>
            </div>

            <div className="field">
              <label>Sana</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>

            <div className="field">
              <label>Ombor</label>
              <select value={newStockId} onChange={e => setNewStockId(e.target.value)}>
                <option value="">— Tanlang —</option>
                {stocks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowNewModal(false)}>Bekor</button>
              <button className="submit-btn" onClick={handleCreate} disabled={creating}>
                {creating ? "Yaratilmoqda…" : "Yaratish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </>
  );

  /* ─── RENDER: DETAIL ────────────────────────────────────────────────────── */
  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <button className="back-btn" onClick={() => setView("list")}>
          ← Orqaga
        </button>

        <div className="header" style={{ marginBottom: 24 }}>
          <div>
            <p className="eyebrow">Hujjat #{activeDoc?.id ?? "Yangi"}</p>
            <h1>{activeDoc?.type === "IN" ? "Kirim" : "Chiqim"}</h1>
          </div>
          {approved && <div className="approved-badge">✓ Tasdiqlandi</div>}
        </div>

        <div className="doc-meta">
          <div className="meta-pill">Sana: <span>{activeDoc?.date}</span></div>
          <div className="meta-pill">Turi: <span>{activeDoc?.type === "IN" ? "Kirim" : "Chiqim"}</span></div>
          <div className="meta-pill">Ombor: <span>{activeDoc?.stock?.name ?? "—"}</span></div>
        </div>

        {!approved && (
          <>
            <div className="search-bar">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Mahsulotni nomi yoki kodi bo'yicha qidiring…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>

            {filtered.length > 0 && (
              <div className="product-search-results">
                {filtered.map(p => (
                  <div className="product-row" key={p.id}>
                    <div className="product-info">
                      <div className="pname">{p.name}</div>
                      <div className="pcode">{p.code}</div>
                    </div>
                    <button className="add-product-btn" onClick={() => addItem(p)}>+ Qo'shish</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {docItems.length > 0 && (
          <div className="items-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kodi</th>
                  <th>Nomi</th>
                  <th>Miqdor</th>
                  {!approved && <th></th>}
                </tr>
              </thead>
              <tbody>
                {docItems.map(item => (
                  <tr key={item.product.id}>
                    <td style={{ fontFamily: "'DM Mono',monospace", color: "#c8b560", fontSize: 12 }}>{item.product.code}</td>
                    <td>{item.product.name}</td>
                    <td>
                      {approved ? (
                        <span style={{ fontFamily: "'DM Mono',monospace" }}>{item.quantity}</span>
                      ) : (
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => changeQty(item.product.id, -1)}>−</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => changeQty(item.product.id, +1)}>+</button>
                        </div>
                      )}
                    </td>
                    {!approved && (
                      <td><button className="remove-btn" onClick={() => removeItem(item.product.id)}>O'chirish</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!approved && (
          <div className="approve-row">
            <button className="approve-btn" onClick={handleApprove} disabled={approving || docItems.length === 0}>
              {approving ? "Tasdiqlanmoqda…" : "✓ Tasdiqlash"}
            </button>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} err={toast.err} onClose={() => setToast(null)} />}
    </>
  );
}