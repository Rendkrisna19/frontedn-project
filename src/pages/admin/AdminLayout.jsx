import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex gap-4">
      <Sidebar />
      <section className="flex-1 p-2">
        <Outlet />
      </section>
    </div>
  );
}
