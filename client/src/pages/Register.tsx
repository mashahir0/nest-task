import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = useMemo(() => password.length >= 6, [password]);
  const formValid = nameValid && emailValid && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors: typeof error = {};
    if (!nameValid) fieldErrors.name = "Name must be at least 2 characters.";
    if (!emailValid) fieldErrors.email = "Enter a valid email.";
    if (!passwordValid) fieldErrors.password = "Password must be at least 6 characters.";
    setError(fieldErrors);
    if (!formValid) return;
    setSubmitting(true);
    try {
      await api.post("/auth/register", { name: name.trim(), email, password });
      navigate("/login");
    } catch (err: any) {
      const apiMsg = Array.isArray(err?.response?.data?.message)
        ? err.response.data.message.join("\n")
        : (err?.response?.data?.message || "Registration failed. Try a different email.");
      setError({ form: String(apiMsg) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md w-80 animate-scale-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          type="text"
          placeholder="Name"
          className={`border w-full p-2 mb-1 rounded ${error.name ? 'border-red-500' : ''}`}
          value={name}
          onChange={(e) => { setName(e.target.value); if (error.name) setError((er)=>({ ...er, name: undefined })); }}
        />
        {error.name && <div className="text-xs text-red-600 mb-2">{error.name}</div>}
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
        <button className="w-full py-2 rounded text-white bg-green-600 hover:bg-green-700">
          Register
        </button>
        <p className="text-sm text-center mt-3">
          Already have an account? <Link className="text-blue-600" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
