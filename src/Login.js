import { useState } from "react";
import "../src/Login.css";

function Login() {

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Name:", name);
        console.log("Password:", password);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back 👋</h2>
                <p className="subtitle">Please login to your account</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Ism</label>
                        <input
                            type="name"
                            placeholder="Ismingizni kiriting name"
                            value={name}
                            onChange={(e)=>setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Parol</label>
                        <input
                            type="parol"
                            placeholder="Parol kiriting"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>


            </div>
        </div>
    );
}

export default Login;