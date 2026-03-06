import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/products";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0d0f14;
    color: #e8e6e1;
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
  }

  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .title-block .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #c8b560;
    margin-bottom: 6px;
  }

  .title-block h1 {
    font-size: 36px;
    font-weight: 800;
    color: #f0ede8;
    line-height: 1;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #c8b560;
    color: #0d0f14;
    border: none;
    padding: 12px 22px;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }
  .add-btn:hover { background: #dfc96e; transform: translateY(-1px); }
  .add-btn svg { width: 16px; height: 16px; }

  /* TABLE */
  .table-wrap {
    border: 1px solid #1e2230;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead tr {
    background: #131620;
    border-bottom: 2px solid #c8b560;
  }

  thead th {
    padding: 14px 20px;
    text-align: left;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #c8b560;
  }

  tbody tr {
    border-bottom: 1px solid #1a1d28;
    transition: background 0.15s;
  }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #131620; }

  tbody td {
    padding: 16px 20px;
    color: #ccc9c0;
  }

  .code-cell {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #c8b560 !important;
    background: #1a1d28;
    padding: 4px 8px;
    display: inline-block;
  }

  .qty-cell {
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    color: #e8e6e1 !important;
  }

  .empty-row td {
    text-align: center;
    padding: 48px;
    color: #3a3d50;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 1px;
  }

  /* MODAL */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

  .modal {
    background: #13151f;
    border: 1px solid #1e2230;
    border-top: 3px solid #c8b560;
    width: 100%;
    max-width: 440px;
    padding: 36px;
    animation: slideUp 0.25s ease;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }

  .modal-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #f0ede8;
  }

  .close-btn {
    background: none;
    border: 1px solid #2a2d3a;
    color: #888;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, color 0.2s;
  }
  .close-btn:hover { border-color: #c8b560; color: #c8b560; }

  .field {
    margin-bottom: 20px;
  }

  .field label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }

  .field input {
    width: 100%;
    background: #0d0f14;
    border: 1px solid #1e2230;
    color: #e8e6e1;
    padding: 12px 14px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .field input:focus { border-color: #c8b560; }
  .field input::placeholder { color: #3a3d50; }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
  }

  .submit-btn {
    flex: 1;
    background: #c8b560;
    color: #0d0f14;
    border: none;
    padding: 13px;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
  }
  .submit-btn:hover:not(:disabled) { background: #dfc96e; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cancel-btn {
    flex: 1;
    background: transparent;
    color: #888;
    border: 1px solid #2a2d3a;
    padding: 13px;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .cancel-btn:hover { border-color: #888; color: #ccc; }

  .error-msg {
    margin-top: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #e05c5c;
    letter-spacing: 0.5px;
  }

  .toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: #1a2a1a;
    border: 1px solid #3a6a3a;
    border-left: 4px solid #5ab05a;
    color: #9dd49d;
    padding: 14px 20px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.5px;
    animation: slideUp 0.3s ease;
    z-index: 200;
  }
`;

export default function Tovarlar() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({code:"", name: "", meterKvadrat: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fetchProducts = () => {
    axios.get(API).then((res) => setProducts(res.data)).catch(console.error);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openModal = () => {
    setForm({code:"", name: "", meterKvadrat: "" });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Mahsulot nomi kiritilishi shart."); return; }
    if (!form.meterKvadrat || isNaN(Number(form.meterKvadrat))) {
      setError("Metr kvadrat raqam bo'lishi kerak.");
      return;
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
      closeModal();
      setToast("Mahsulot muvaffaqiyatli qo'shildi!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="page">
        <div className="header">
          <div className="title-block">
            <p className="eyebrow">Ombor tizimi</p>
            <h1>Tovarlar</h1>
          </div>
          <button className="add-btn" onClick={openModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Yangi tovar
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kodi</th>
                <th>Nomi</th>
                <th>Metr²</th>
                <th>Soni</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={4}>— Mahsulotlar yo'q —</td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id}>
                    <td><span className="code-cell">{item.code ?? "—"}</span></td>
                    <td>{item.name}</td>
                    <td>{item.meterKvadrat ?? "—"}</td>
                    <td className="qty-cell">{item.quantity ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showModal && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>Yangi tovar qo'shish</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="field">
              <label>Mahsulot kodi</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Masalan: PLT-001"
                autoFocus
              />
            </div>

            <div className="field">
              <label>Mahsulot nomi</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masalan: Granit plitka"
                autoFocus
              />
            </div>

            <div className="field">
              <label>Metr kvadrat (m²)</label>
              <input
                name="meterKvadrat"
                type="number"
                min="0"
                step="0.01"
                value={form.meterKvadrat}
                onChange={handleChange}
                placeholder="Masalan: 2.5"
              />
            </div>

            {error && <p className="error-msg">⚠ {error}</p>}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Bekor</button>
              <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saqlanmoqda…" : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  );
}