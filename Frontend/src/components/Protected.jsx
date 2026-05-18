import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Protected({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading">Checking credentials...</div>;

  if (!user) {
    return <Navigate to="/verify" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
