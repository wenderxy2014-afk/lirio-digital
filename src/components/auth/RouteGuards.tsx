import { Navigate, Outlet } from "react-router-dom";
import { useAuth, hasAnyRole, type AppRole } from "@/providers/AuthProvider";

export function RequireAuth({ redirectTo = "/auth" }: { redirectTo?: string }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}

export function RequireRole({ allowed, redirectTo = "/" }: { allowed: AppRole[]; redirectTo?: string }) {
  const { user, roles, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasAnyRole(roles, allowed)) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
