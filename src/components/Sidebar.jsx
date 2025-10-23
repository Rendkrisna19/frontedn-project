import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-[calc(100vh-72px)] sticky top-[72px] glass border-r border-white/10 p-4">
      <div className="text-xs uppercase tracking-widest text-slate-400 mb-3">Admin Panel</div>
      <nav className="space-y-2 text-sm">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg transition ${
              isActive ? "bg-primary-500 text-white" : "hover:bg-white/10"
            }`
          }
        >
          Buku
        </NavLink>
        {/* Tambah menu lain di sini jika perlu */}
      </nav>
    </aside>
  );
}
