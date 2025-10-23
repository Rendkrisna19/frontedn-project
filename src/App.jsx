import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "./api";

export default function App() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);

  async function fetchMe() {
    try {
      const { data } = await api.get("/auth/me");
      setMe(data);
    } catch {
      // 401: biarkan me = null
      setMe(null);
    }
  }

  useEffect(() => { fetchMe(); }, []);

  function logout() {
    localStorage.removeItem("token");
    setMe(null);
    nav("/login");
  }

  return (
    <div>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tight">BukuData</Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="px-3 py-1.5 rounded-lg hover:bg-white/10">User</Link>
            {me?.role === "admin" && (
              <Link to="/admin" className="px-3 py-1.5 rounded-lg hover:bg-white/10">Admin</Link>
            )}
            {me ? (
              <>
                <span className="px-2 py-1 rounded-full text-xs bg-white/10 border border-white/10">{me.role.toUpperCase()}</span>
                <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10">Logout</button>
              </>
            ) : (
              <button onClick={() => nav("/login")} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 shadow">
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
