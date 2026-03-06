import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import Tovarlar from "./pages/Tovarlar";
import Hujjatlar from "./pages/Hujjatlar";
import Hisobotlar from "./pages/Hisobotlar";
import Qarzlar from "./pages/Qarzlar";
import Login from "./Login";
import "./App.css";

function AppContent() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

  return (
    <div className={isLoginPage ? "" : "container"}>
      {!isLoginPage && (
        <>
          <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
          <div className={`sidebar ${open ? "active" : ""}`}>
            <h2 className="logo">Ombor</h2>
            <NavLink to="/goods">Tovarlar</NavLink>
            <NavLink to="/documents">Hujjatlar</NavLink>
            <NavLink to="/reports">Hisobotlar</NavLink>
            <NavLink to="/debts">Qarzlar</NavLink>
          </div>
        </>
      )}

      <div className={isLoginPage ? "" : "main"}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/goods" element={<Tovarlar />} />
          <Route path="/documents" element={<Hujjatlar />} />
          <Route path="/reports" element={<Hisobotlar />} />
          <Route path="/debts" element={<Qarzlar />} />
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