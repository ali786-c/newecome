import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { settings, isLoading: settingsLoading } = useSettings();
  const location = useLocation();

  const isLoading = authLoading || settingsLoading;
  
  // If still loading, wait
  if (isLoading) return null;

  const mValue = settings?.maintenance_mode;
  const isMaintenanceMode = mValue === 'true' || mValue === true || mValue === '1' || mValue === 1;
  const isAdmin = user?.role === 'admin';
  const isMaintenancePath = location.pathname === '/maintenance';
  const isAuthPath = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);
  const isAdminPath = location.pathname.startsWith('/admin');

  console.log('[Maintenance] mode:', isMaintenanceMode, 'isAdmin:', isAdmin, 'path:', location.pathname);

  // If maintenance is ON
  if (isMaintenanceMode) {
    if (isAdmin) return <>{children}</>;
    if (isAuthPath || isAdminPath) return <>{children}</>;
    if (!isMaintenancePath) {
      return <Navigate to="/maintenance" replace />;
    }
  } else {
    if (isMaintenancePath) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
