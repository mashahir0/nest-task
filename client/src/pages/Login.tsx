import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = useMemo(() => password.length >= 6, [password]);
  const formValid = emailValid && passwordValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors: typeof error = {};
    if (!emailValid) fieldErrors.email = "Enter a valid email.";
    if (!passwordValid) fieldErrors.password = "Password must be at least 6 characters.";
    setError(fieldErrors);
    if (!formValid) return;
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/users");
    } catch (err: any) {
      const apiMsg = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join("\n")
        : (err?.response?.data?.message || "Invalid email or password.");
      setError({ form: String(apiMsg) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-md w-80 animate-scale-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className={`border w-full p-2 mb-1 rounded ${error.email ? 'border-red-500' : ''}`}
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error.email) setError((er)=>({ ...er, email: undefined })); }}
        />
        {error.email && <div className="text-xs text-red-600 mb-2">{error.email}</div>}
        <input
          type="password"
          placeholder="Password"
          className={`border w-full p-2 mb-2 rounded ${error.password ? 'border-red-500' : ''}`}
          value={password}
          onChange={(e) => { setPassword(e.target.value); if (error.password) setError((er)=>({ ...er, password: undefined })); }}
        />
        {error.password && <div className="text-xs text-red-600 mb-2">{error.password}</div>}
        {error.form && <div className="text-xs text-red-600 mb-2 text-center">{error.form}</div>}
        <button className="w-full py-2 rounded text-white bg-blue-600 hover:bg-blue-700">
          Login
        </button>
        <p className="text-sm text-center mt-3">
          No account? <Link className="text-blue-600" to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
