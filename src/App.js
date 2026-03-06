import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import Tovarlar from "./pages/Tovarlar";
import Qoshish from "./pages/Qoshish";
import Ayrish from "./pages/Ayirish";
import Hisobotlar from "./pages/Hisobotlar";
import Qarzlar from "./pages/Qarzlar";
import Login from "./Login";
import "./App.css";

function AppContent() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // agar login sahifada bo‘lsa sidebar ko‘rinmaydi
  const isLoginPage = location.pathname === "/";

  return (
      <div className={isLoginPage ? "" : "container"}>

        {/* Sidebar faqat login bo‘lmaganda chiqadi */}
        {!isLoginPage && (
            <>
              <button className="menu-btn" onClick={() => setOpen(!open)}>
                ☰
              </button>

              <div className={`sidebar ${open ? "active" : ""}`}>
                <h2 className="logo">Ombor</h2>

                <NavLink to="/tovarlar">Tovarlar</NavLink>
                <NavLink to="/qoshish">Qoshish</NavLink>
                <NavLink to="/ayrish">Ayrish</NavLink>
                <NavLink to="/hisobotlar">Hisobotlar</NavLink>
                <NavLink to="/qarzlar">Qarzlar</NavLink>
              </div>
            </>
        )}

        <div className={isLoginPage ? "" : "main"}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/tovarlar" element={<Tovarlar />} />
            <Route path="/qoshish" element={<Qoshish />} />
            <Route path="/ayrish" element={<Ayrish />} />
            <Route path="/hisobotlar" element={<Hisobotlar />} />
            <Route path="/qarzlar" element={<Qarzlar />} />
          </Routes>
        </div>

      </div>
  );
}

export default function App() {
  return (
      <Router>
        <AppContent />
      </Router>
  );
}