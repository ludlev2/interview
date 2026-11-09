import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { UserRole } from '@/lib/types';
import { useAuth } from './useAuth';

export function RequireRole({
  roles,
  children,
}: {
  roles?: UserRole[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
