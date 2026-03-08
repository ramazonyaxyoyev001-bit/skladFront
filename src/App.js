import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import Tovarlar from "./pages/Tovarlar";
import Hujjatlar from "./pages/Hujjatlar";
import Hisobotlar from "./pages/Hisobotlar";
import Qarzlar from "./pages/Qarzlar";
import Login from "./Login";
import "./App.css";
import Skladlar from "./pages/Skladlar";
import MagazineHujjatlar from "./pages/MagazineHujjatlar";
import MagazineHisobotlar from "./pages/MagazineHisobotlar";
import MagazineTavarlar from "./pages/MagazineTavarlar";

function AppContent() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const isLoginPage = location.pathname === "/";
    const isMagazine = location.pathname.startsWith("/magazine");

    return (
        <div className={isLoginPage ? "" : "container"}>
            {!isLoginPage && (
                <>
                    <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>

                    <div className={`sidebar ${open ? "active" : ""}`}>
                        <h2 className="logo">Ombor</h2>

                        {!isMagazine && (
                            <>
                                <NavLink to="/goods">Tovarlar</NavLink>
                                <NavLink to="/documents">Hujjatlar</NavLink>
                                <NavLink to="/reports">Hisobotlar</NavLink>
                                <NavLink to="/debts">Qarzlar</NavLink>
                                <NavLink to="/skladlar">Skladlar</NavLink>
                                <NavLink to="/magazine/documents">Magazin</NavLink>
                            </>
                        )}

                        {isMagazine && (
                            <>
                                <NavLink to="/magazine/product">Tavar</NavLink>
                                <NavLink to="/magazine/documents">Hujjatlar</NavLink>
                                <NavLink to="/magazine/reports">Hisobotlar</NavLink>
                                <NavLink to="/goods">Ombor</NavLink>
                            </>
                        )}
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
                    <Route path="/skladlar" element={<Skladlar />} />
                    <Route path="/magazine/product" element={<MagazineTavarlar />} />
                    <Route path="/magazine/documents" element={<MagazineHujjatlar />} />
                    <Route path="/magazine/reports" element={<MagazineHisobotlar />} />
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