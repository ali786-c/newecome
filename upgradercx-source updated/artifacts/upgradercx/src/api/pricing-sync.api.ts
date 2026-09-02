/**
 * Pricing Sync Settings & Conflict Detection API
 *
 * Laravel routes (suggested):
 *   GET    /api/admin/pricing/settings        → PricingSyncController@settings
 *   PUT    /api/admin/pricing/settings        → PricingSyncController@updateSettings
 *   GET    /api/admin/pricing/conflicts       → PricingSyncController@conflicts
 *   POST   /api/admin/pricing/conflicts/{id}/resolve → PricingSyncController@resolveConflict
 *   POST   /api/admin/pricing/approve/{id}    → PricingSyncController@approvePriceChange
 *   POST   /api/admin/pricing/reject/{id}     → PricingSyncController@rejectPriceChange
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  PricingSyncSettings, PriceConflict, PriceHistory,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

/* ── Mock data ── */
const MOCK_SETTINGS: PricingSyncSettings = {
  id: 1,
  auto_sync_on_price_change: true,
  sync_channels: ['telegram', 'discord'],
  approval_threshold_percent: 20,
  require_approval_above_threshold: true,
  telegram_command_enabled: true,
  discord_command_enabled: true,
  notify_on_mismatch: true,
  mismatch_threshold_percent: 5,
  batch_change_max_percent: 50,
  updated_at: new Date().toISOString(),
};

const MOCK_CONFLICTS: PriceConflict[] = [
  { id: 1, product_id: 2, product_name: 'Adobe CC License', channel: 'telegram', website_price: 54.99, channel_price: 49.99, drift_percent: 9.1, detected_at: new Date(Date.now() - 3600000).toISOString(), resolved: false },
  { id: 2, product_id: 5, product_name: 'Cloud Storage 1TB', channel: 'discord', website_price: 9.99, channel_price: 12.99, drift_percent: 30.0, detected_at: new Date(Date.now() - 7200000).toISOString(), resolved: false },
  { id: 3, product_id: 1, product_name: 'Office 365 Business', channel: 'telegram', website_price: 22.99, channel_price: 22.99, drift_percent: 0, detected_at: new Date(Date.now() - 86400000).toISOString(), resolved: true, resolved_action: 'force_website', resolved_by: 'Admin User', resolved_at: new Date(Date.now() - 82800000).toISOString() },
];

const MOCK_AUDIT_LOG: PriceHistory[] = [
  { id: 1, product_id: 1, product_name: 'Office 365 Business', field: 'price', old_value: 24.99, new_value: 22.99, change_percent: -8.0, source: 'website_admin', changed_by: 'Admin User', approval_status: 'auto_approved', sync_triggered: true, sync_outcome: 'success', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, product_id: 2, product_name: 'Adobe CC License', field: 'price', old_value: 49.99, new_value: 54.99, change_percent: 10.0, source: 'telegram_command', changed_by: 'Admin via Telegram', approval_status: 'auto_approved', sync_triggered: true, sync_outcome: 'partial', created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: 3, product_id: 3, product_name: 'VPN Premium 1yr', field: 'compare_price', old_value: 49.99, new_value: 44.99, change_percent: -10.0, source: 'website_admin', changed_by: 'Admin User', approval_status: 'auto_approved', sync_triggered: false, sync_outcome: undefined, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, product_id: 1, product_name: 'Office 365 Business', field: 'price', old_value: 29.99, new_value: 24.99, change_percent: -16.7, source: 'batch', changed_by: 'Admin User', approval_status: 'auto_approved', sync_triggered: true, sync_outcome: 'success', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, product_id: 5, product_name: 'Cloud Storage 1TB', field: 'price', old_value: 12.99, new_value: 9.99, change_percent: -23.1, source: 'discord_command', changed_by: 'Admin via Discord', approval_status: 'pending_approval', sync_triggered: false, sync_outcome: undefined, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 6, product_id: 4, product_name: 'Dev Tools Pro', field: 'price', old_value: 19.99, new_value: 29.99, change_percent: 50.0, source: 'api', changed_by: 'System', approval_status: 'pending_approval', sync_triggered: false, sync_outcome: undefined, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 7, product_id: 6, product_name: 'SEO Toolkit', field: 'price', old_value: 39.99, new_value: 24.99, change_percent: -37.5, source: 'website_admin', changed_by: 'Admin User', approval_status: 'rejected', approved_by: 'Senior Admin', approved_at: new Date(Date.now() - 100000).toISOString(), sync_triggered: false, sync_outcome: undefined, created_at: new Date(Date.now() - 400000).toISOString() },
];

export const pricingSyncApi = {
  async getSettings(): Promise<ApiResponse<PricingSyncSettings>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_SETTINGS });
    const res = await client.get('/admin/pricing/settings');
    return res.data;
  },

  async updateSettings(data: Partial<PricingSyncSettings>): Promise<ApiResponse<PricingSyncSettings>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_SETTINGS, ...data, updated_at: new Date().toISOString() } });
    const res = await client.put('/admin/pricing/settings', data);
    return res.data;
  },

  async getConflicts(params?: ListParams): Promise<PaginatedResponse<PriceConflict>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_CONFLICTS];
      if (params?.resolved === false) filtered = filtered.filter((c) => !c.resolved);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/pricing/conflicts', { params });
    return res.data;
  },

  async resolveConflict(id: number, action: 'force_website' | 'accept_channel' | 'manual'): Promise<ApiResponse<PriceConflict>> {
    if (USE_MOCK) {
      const conflict = MOCK_CONFLICTS.find((c) => c.id === id) || MOCK_CONFLICTS[0];
      return mockDelay({ data: { ...conflict, resolved: true, resolved_action: action, resolved_by: 'Admin User', resolved_at: new Date().toISOString() } });
    }
    const res = await client.post(`/admin/pricing/conflicts/${id}/resolve`, { action });
    return res.data;
  },

  async getAuditLog(params?: ListParams): Promise<PaginatedResponse<PriceHistory>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_AUDIT_LOG, params));
    const res = await client.get('/admin/pricing/audit-log', { params });
    return res.data;
  },

  async approvePriceChange(id: number): Promise<ApiResponse<PriceHistory>> {
    if (USE_MOCK) {
      const entry = MOCK_AUDIT_LOG.find((e) => e.id === id) || MOCK_AUDIT_LOG[0];
      return mockDelay({ data: { ...entry, approval_status: 'approved', approved_by: 'Admin User', approved_at: new Date().toISOString(), sync_triggered: true, sync_outcome: 'pending' } });
    }
    const res = await client.post(`/admin/pricing/approve/${id}`);
    return res.data;
  },

  async rejectPriceChange(id: number): Promise<ApiResponse<PriceHistory>> {
    if (USE_MOCK) {
      const entry = MOCK_AUDIT_LOG.find((e) => e.id === id) || MOCK_AUDIT_LOG[0];
      return mockDelay({ data: { ...entry, approval_status: 'rejected', approved_by: 'Admin User', approved_at: new Date().toISOString() } });
    }
    const res = await client.post(`/admin/pricing/reject/${id}`);
    return res.data;
  },
};
