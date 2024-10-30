import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({adminStatus}) {
    const isAdmin = adminStatus || false

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
}
