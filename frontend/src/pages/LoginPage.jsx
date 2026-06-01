import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../services/errorMessage";
import Notification from "../components/Notification";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminFocus, setIsAdminFocus] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/auth/login", { email, password });
      setNotification({ message: "Login successful", type: "success" });
      const meResponse = await api.get("/auth/me");
      if (meResponse.data?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setNotification({
        message: getErrorMessage(error, "Login failed"),
        type: "error"
      });
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-xl px-4">
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-white">
        {isAdminFocus ? "Admin Login" : "Welcome back"}
      </h1>
      <p className="mb-6 text-center text-sm text-slate-300">
        {isAdminFocus
          ? "Administrators sign in here. New admin accounts are not created through this site."
          : "Log in with your account."}
      </p>
      <Notification {...notification} />
      <form
        className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur"
        onSubmit={handleSubmit}
      >
        <input
          className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
        <button
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          type="submit"
        >
          {isAdminFocus ? "Sign in as administrator" : "Login"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-300">
        New user?{" "}
        <Link className="font-semibold text-blue-400 hover:text-blue-300" to="/register">
          Register
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-300">
        <button
          type="button"
          onClick={() => setIsAdminFocus((prev) => !prev)}
          className="font-semibold text-blue-400 hover:text-blue-300"
        >
          {isAdminFocus ? "Back to user sign-in" : "Are you an admin? Click here"}
        </button>
      </p>
    </div>
  );
}
