import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      try {
        await api.get("/tasks/", { params: { page: 1, size: 1 } });
        setIsAuthed(true);
      } catch {
        setIsAuthed(false);
      } finally {
        setIsChecking(false);
      }
    };
    validateSession();
  }, []);

  if (isChecking) {
    return <div className="p-6 text-center text-slate-300">Checking session...</div>;
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
