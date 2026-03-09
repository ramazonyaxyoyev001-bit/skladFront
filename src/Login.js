import { useState } from "react";
import axios from "axios";
import "../src/Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await axios.post("https://stock-production-703f.up.railway.app/api/auth/login", { username, password });
            window.location.href = "/goods";
        } catch (err) {
            setError("Username yoki parol noto'g'ri.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back 👋</h2>
                <p className="subtitle">Hisobingizga kiring</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Username kiriting"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Parol</label>
                        <input
                            type="password"
                            placeholder="Parol kiriting"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Kirilmoqda..." : "Kirish"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;