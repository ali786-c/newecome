import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminSettingsApi } from '@/api/admin-settings.api';

interface Settings {
  maintenance_mode: boolean;
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await adminSettingsApi.get();
        const data = response.data as any;
        setSettings({
          ...data,
          maintenance_mode: data.maintenance_mode === 'true' || 
                           data.maintenance_mode === true || 
                           data.maintenance_mode === '1' || 
                           data.maintenance_mode === 1
        });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
