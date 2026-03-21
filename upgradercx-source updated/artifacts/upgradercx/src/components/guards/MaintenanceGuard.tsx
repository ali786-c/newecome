import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { settings, isLoading } = useSettings();
  const location = useLocation();

  // If still loading settings, show nothing (or a loader)
  if (isLoading) return null;

  const isMaintenanceMode = settings?.maintenance_mode;
  const isAdmin = user?.role === 'admin';
  const isMaintenancePath = location.pathname === '/maintenance';
  const isAuthPath = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);
  const isAdminPath = location.pathname.startsWith('/admin');

  // If maintenance is ON
  if (isMaintenanceMode) {
    // Admins can see everything
    if (isAdmin) return <>{children}</>;

    // Allow login/auth paths so the admin can log in
    if (isAuthPath || isAdminPath) return <>{children}</>;

    // Redirect everyone else to /maintenance
    if (!isMaintenancePath) {
      return <Navigate to="/maintenance" replace />;
    }
  } else {
    // If maintenance is OFF, and someone is on /maintenance, send home
    if (isMaintenancePath) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
