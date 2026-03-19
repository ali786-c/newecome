import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard() {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const to = sessionExpired ? '/login?expired=1' : '/login';
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
