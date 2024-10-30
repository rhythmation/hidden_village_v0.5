import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({loginStatus}) {
  const isLoggedIn = loginStatus || false


  return isLoggedIn ? <Outlet /> : <Navigate to="signIn" />;
}
