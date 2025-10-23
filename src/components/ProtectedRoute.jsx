import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

export default function ProtectedRoute({ role = "admin", children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setAllowed(data?.role === role);
      } catch {
        setAllowed(false);
      }
    })();
  }, [role]);

  if (allowed === null) return <div className="p-6">Memeriksa akses…</div>;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
}
