import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) return <Navigate to="/users" replace />;
  return <>{children}</>;
}


