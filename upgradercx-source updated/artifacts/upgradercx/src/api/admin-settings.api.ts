/**
 * Admin Settings API
 *
 * Laravel routes (suggested):
 *   GET  /api/admin/settings → AdminSettingController@index
 *   PUT  /api/admin/settings → AdminSettingController@update
 */
import { client, USE_MOCK, mockDelay } from './client';
import type { AdminSettings, ApiResponse } from '@/types';

const MOCK_SETTINGS: AdminSettings = {
  site_name: 'UpgraderCX',
  site_tagline: 'Premium Digital Services',
  support_email: 'support@upgradercx.com',
  currency: 'USD',
  timezone: 'UTC',
  maintenance_mode: false,
  registration_enabled: true,
  email_verification_required: true,
  wallet_enabled: true,
  referral_commission_rate: 10,
};

export const adminSettingsApi = {
  /** GET /settings (public) */
  async get(): Promise<ApiResponse<AdminSettings>> {
    const res = await client.get('/settings');
    return res.data;
  },

  /** PUT /api/admin/settings */
  async update(data: Partial<AdminSettings>): Promise<ApiResponse<AdminSettings>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_SETTINGS, ...data } });
    const res = await client.put('/admin/settings', data);
    return res.data;
  },
};
