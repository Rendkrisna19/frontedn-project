import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import UserBooks from "./pages/UserBooks.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminBooks from "./pages/admin/AdminBooks.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <UserBooks /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [{ index: true, element: <AdminBooks /> }],
      },
    ],
  },
  { path: "/login", element: <Login /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
