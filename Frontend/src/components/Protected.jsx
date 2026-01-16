import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/verify" replace />;
  }

  return children;
}
