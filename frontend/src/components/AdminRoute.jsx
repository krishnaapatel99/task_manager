import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function AdminRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data?.role === "admin") {
          setRedirect("allow");
        } else {
          setRedirect("user");
        }
      } catch {
        setRedirect("login");
      } finally {
        setIsChecking(false);
      }
    };
    validateAdmin();
  }, []);

  if (isChecking) {
    return <div className="p-6 text-center text-slate-300">Checking admin access...</div>;
  }

  if (redirect === "login") {
    return <Navigate to="/login" replace />;
  }
  if (redirect === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
