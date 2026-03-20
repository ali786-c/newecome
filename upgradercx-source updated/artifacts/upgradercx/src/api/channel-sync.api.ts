/**
 * Cross-Channel Synchronization API
 *
 * Laravel routes (suggested):
 *   GET    /api/sync/dashboard         → SyncController@dashboard
 *   GET    /api/sync/statuses          → SyncController@productStatuses
 *   POST   /api/sync/products/{id}     → SyncController@syncProduct
 *   POST   /api/sync/bulk              → SyncController@bulkSync
 *   POST   /api/sync/all               → SyncController@syncAll
 *   GET    /api/sync/queue             → SyncController@queue
 *   GET    /api/sync/jobs/failed       → SyncController@failedJobs
 *   POST   /api/sync/jobs/{id}/retry   → SyncController@retryJob
 *   GET    /api/sync/price-history     → SyncController@priceHistory
 *   GET    /api/sync/products/{id}/history → SyncController@productSyncHistory
 *   GET    /api/sync/notifications     → NotificationLogController@index
 *   GET    /api/sync/conflicts         → SyncController@conflicts
 *   POST   /api/sync/conflicts/{id}/resolve → SyncController@resolveConflict
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  ChannelSyncStatus, SyncJob, SyncDashboardStats, PriceHistory,
  PriceConflict, NotificationLog, SyncChannel,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

/* ── Mock Data ── */
const MOCK_DASHBOARD: SyncDashboardStats = {
  total_jobs_24h: 147,
  completed_24h: 138,
  failed_24h: 6,
  queued_now: 3,
  processing_now: 1,
  avg_duration_ms: 2340,
  success_rate_percent: 93.9,
  channels: [
    { channel: 'telegram', status: 'healthy', last_success_at: new Date(Date.now() - 120000).toISOString(), error_rate_24h: 2.1, total_synced_24h: 72, pending_count: 1 },
    { channel: 'discord', status: 'degraded', last_success_at: new Date(Date.now() - 5400000).toISOString(), last_failure_at: new Date(Date.now() - 300000).toISOString(), error_rate_24h: 8.3, total_synced_24h: 66, pending_count: 2 },
  ],
};

const MOCK_CHANNEL_STATUS: ChannelSyncStatus[] = [];
for (let i = 1; i <= 24; i++) {
  const price = parseFloat((9.99 + (i - 1) * 5).toFixed(2));
  const tgSynced = i % 2 === 0;
  const dcSynced = i % 3 === 0;
  const tgPrice = tgSynced ? (i % 5 === 0 ? price - 2 : price) : undefined;
  const dcPrice = dcSynced ? (i % 7 === 0 ? price + 1 : price) : undefined;
  MOCK_CHANNEL_STATUS.push(
    { product_id: i, channel: 'telegram', synced: tgSynced, synced_price: tgPrice, website_price: price, mismatched: tgSynced && tgPrice !== price, last_synced_at: tgSynced ? new Date(Date.now() - i * 3600000).toISOString() : undefined, last_error: !tgSynced && i % 4 === 0 ? 'Bot token expired' : undefined },
    { product_id: i, channel: 'discord', synced: dcSynced, synced_price: dcPrice, website_price: price, mismatched: dcSynced && dcPrice !== price, last_synced_at: dcSynced ? new Date(Date.now() - i * 1800000).toISOString() : undefined, last_error: !dcSynced && i % 6 === 0 ? 'Webhook URL invalid' : undefined },
  );
}

const MOCK_SYNC_JOBS: SyncJob[] = [
  { id: 1, product_id: 1, product_name: 'Office 365 Business', channel: 'telegram', status: 'completed', triggered_by: 'auto', retry_count: 0, max_retries: 3, duration_ms: 1230, started_at: new Date(Date.now() - 120000).toISOString(), completed_at: new Date(Date.now() - 118770).toISOString(), created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 2, product_id: 2, product_name: 'Adobe CC License', channel: 'discord', status: 'failed', triggered_by: 'manual', error_message: 'Discord webhook returned 403 Forbidden', retry_count: 3, max_retries: 3, started_at: new Date(Date.now() - 300000).toISOString(), created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 3, product_id: 3, product_name: 'VPN Premium 1yr', channel: 'telegram', status: 'queued', triggered_by: 'auto', retry_count: 0, max_retries: 3, created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 4, product_id: 5, product_name: 'Cloud Storage 1TB', channel: 'discord', status: 'processing', triggered_by: 'manual', retry_count: 0, max_retries: 3, started_at: new Date(Date.now() - 30000).toISOString(), created_at: new Date(Date.now() - 30000).toISOString() },
  { id: 5, product_id: 1, product_name: 'Office 365 Business', channel: 'discord', status: 'completed', triggered_by: 'auto', retry_count: 0, max_retries: 3, duration_ms: 980, started_at: new Date(Date.now() - 600000).toISOString(), completed_at: new Date(Date.now() - 599020).toISOString(), created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 6, product_id: 4, product_name: 'Dev Tools Pro', channel: 'telegram', status: 'failed', triggered_by: 'price_change', error_message: 'Telegram API rate limit exceeded', retry_count: 2, max_retries: 3, next_retry_at: new Date(Date.now() + 60000).toISOString(), started_at: new Date(Date.now() - 180000).toISOString(), created_at: new Date(Date.now() - 180000).toISOString() },
  { id: 7, product_id: 6, product_name: 'SEO Toolkit', channel: 'discord', status: 'failed', triggered_by: 'command', trigger_source: 'discord_command', error_message: 'Channel not found', retry_count: 1, max_retries: 3, started_at: new Date(Date.now() - 7200000).toISOString(), created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 8, product_id: 7, product_name: 'Email Marketing Suite', channel: 'telegram', status: 'completed', triggered_by: 'scheduled', retry_count: 0, max_retries: 3, duration_ms: 1540, started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3598460).toISOString(), created_at: new Date(Date.now() - 3600000).toISOString() },
];

const MOCK_PRICE_HISTORY: PriceHistory[] = [
  { id: 1, product_id: 1, product_name: 'Office 365 Business', field: 'price', old_value: 24.99, new_value: 22.99, change_percent: -8.0, source: 'website_admin', changed_by: 'Admin User', approval_status: 'auto_approved', sync_triggered: true, sync_outcome: 'success', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, product_id: 2, product_name: 'Adobe CC License', field: 'price', old_value: 49.99, new_value: 54.99, change_percent: 10.0, source: 'telegram_command', changed_by: 'Admin via Telegram', approval_status: 'auto_approved', sync_triggered: true, sync_outcome: 'partial', created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: 3, product_id: 3, product_name: 'VPN Premium 1yr', field: 'compare_price', old_value: 49.99, new_value: 44.99, change_percent: -10.0, source: 'website_admin', changed_by: 'Admin User', approval_status: 'auto_approved', sync_triggered: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, product_id: 1, product_name: 'Office 365 Business', field: 'price', old_value: 29.99, new_value: 24.99, change_percent: -16.7, source: 'batch', changed_by: 'Admin User', approval_status: 'auto_approved', sync_triggered: true, sync_outcome: 'success', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, product_id: 5, product_name: 'Cloud Storage 1TB', field: 'price', old_value: 12.99, new_value: 9.99, change_percent: -23.1, source: 'discord_command', changed_by: 'Admin via Discord', approval_status: 'pending_approval', sync_triggered: false, created_at: new Date(Date.now() - 259200000).toISOString() },
];

const MOCK_NOTIFICATIONS: NotificationLog[] = [
  { id: 1, event_type: 'ticket_created', channel: 'discord', reference_type: 'ticket', reference_id: 3, reference_label: 'Ticket #3: License not working', status: 'sent', message_id: 'dc_n001', payload_preview: '🎫 New ticket from customer@email.com — License not working', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, event_type: 'ticket_created', channel: 'telegram', reference_type: 'ticket', reference_id: 3, reference_label: 'Ticket #3: License not working', status: 'sent', message_id: 'tg_n001', payload_preview: '🎫 New ticket from customer@email.com — License not working', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, event_type: 'order_completed', channel: 'discord', reference_type: 'order', reference_id: 1042, reference_label: 'Order #1042', status: 'sent', message_id: 'dc_n002', payload_preview: '✅ Order #1042 completed — $22.99', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, event_type: 'order_failed', channel: 'telegram', reference_type: 'order', reference_id: 1043, reference_label: 'Order #1043', status: 'failed', error_message: 'Bot blocked by user', payload_preview: '❌ Order #1043 payment failed', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 5, event_type: 'price_approval_needed', channel: 'discord', reference_type: 'product', reference_id: 5, reference_label: 'Cloud Storage 1TB', status: 'sent', message_id: 'dc_n003', payload_preview: '⚠️ Price change needs approval: $12.99 → $9.99 (-23%)', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 6, event_type: 'sync_failed', channel: 'telegram', reference_type: 'system', reference_label: 'Discord sync batch', status: 'sent', message_id: 'tg_n004', payload_preview: '🔴 3 Discord sync jobs failed in the last hour', created_at: new Date(Date.now() - 21600000).toISOString() },
  { id: 7, event_type: 'ticket_status_changed', channel: 'discord', reference_type: 'ticket', reference_id: 2, reference_label: 'Ticket #2: Billing question', status: 'skipped', payload_preview: 'Ticket #2 status → answered', created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: 8, event_type: 'low_stock', channel: 'telegram', reference_type: 'product', reference_id: 3, reference_label: 'VPN Premium 1yr', status: 'sent', message_id: 'tg_n005', payload_preview: '📉 Low stock: VPN Premium 1yr — 2 remaining', created_at: new Date(Date.now() - 43200000).toISOString() },
];

const MOCK_CONFLICTS: PriceConflict[] = [
  { id: 1, product_id: 10, product_name: 'Product #10', channel: 'telegram', website_price: 54.99, channel_price: 52.99, drift_percent: -3.6, detected_at: new Date(Date.now() - 3600000).toISOString(), resolved: false },
  { id: 2, product_id: 21, product_name: 'Product #21', channel: 'discord', website_price: 109.99, channel_price: 110.99, drift_percent: 0.9, detected_at: new Date(Date.now() - 7200000).toISOString(), resolved: false },
  { id: 3, product_id: 5, product_name: 'Cloud Storage 1TB', channel: 'telegram', website_price: 9.99, channel_price: 12.99, drift_percent: 30.0, detected_at: new Date(Date.now() - 86400000).toISOString(), resolved: true, resolved_action: 'force_website', resolved_by: 'Admin User', resolved_at: new Date(Date.now() - 82800000).toISOString() },
];

export const channelSyncApi = {
  /* ── Dashboard ── */
  async getDashboardStats(): Promise<ApiResponse<SyncDashboardStats>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_DASHBOARD });
    const res = await client.get('/admin/sync/dashboard');
    return res.data;
  },

  /* ── Product Statuses ── */
  async getProductStatuses(params?: ListParams): Promise<PaginatedResponse<ChannelSyncStatus>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_CHANNEL_STATUS];
      if (params?.channel) filtered = filtered.filter((s) => s.channel === params.channel);
      if (params?.mismatched_only) filtered = filtered.filter((s) => s.mismatched);
      if (params?.errors_only) filtered = filtered.filter((s) => !!s.last_error);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/sync/statuses', { params });
    return res.data;
  },

  /* ── Sync Actions ── */
  async syncProduct(productId: number, channel: SyncChannel): Promise<ApiResponse<SyncJob>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_SYNC_JOBS[0], id: Date.now(), product_id: productId, channel, status: 'queued' as const, triggered_by: 'manual' as const, retry_count: 0, max_retries: 3, created_at: new Date().toISOString() } });
    const res = await client.post(`/admin/sync/products/${productId}`, { channel });
    return res.data;
  },
  async bulkSync(productIds: number[], channel: SyncChannel): Promise<ApiResponse<{ queued: number }>> {
    if (USE_MOCK) return mockDelay({ data: { queued: productIds.length } });
    const res = await client.post('/admin/sync/bulk', { product_ids: productIds, channel });
    return res.data;
  },
  async syncAll(channel: SyncChannel): Promise<ApiResponse<{ queued: number }>> {
    if (USE_MOCK) return mockDelay({ data: { queued: 24 } });
    const res = await client.post('/admin/sync/all', { channel });
    return res.data;
  },

  /* ── Queue & Jobs ── */
  async getQueue(params?: ListParams): Promise<PaginatedResponse<SyncJob>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_SYNC_JOBS, params));
    const res = await client.get('/admin/sync/queue', { params });
    return res.data;
  },
  async getFailedJobs(params?: ListParams): Promise<PaginatedResponse<SyncJob>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_SYNC_JOBS.filter((j) => j.status === 'failed'), params));
    const res = await client.get('/admin/sync/jobs/failed', { params });
    return res.data;
  },
  async retryJob(jobId: number): Promise<ApiResponse<SyncJob>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_SYNC_JOBS[0], id: jobId, status: 'queued' as const, retry_count: 0, max_retries: 3 } });
    const res = await client.post(`/admin/sync/jobs/${jobId}/retry`);
    return res.data;
  },
  async getProductSyncHistory(productId: number, params?: ListParams): Promise<PaginatedResponse<SyncJob>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_SYNC_JOBS.filter((j) => j.product_id === productId), params));
    const res = await client.get(`/admin/sync/products/${productId}/history`, { params });
    return res.data;
  },

  /* ── Price History ── */
  async getPriceHistory(params?: ListParams): Promise<PaginatedResponse<PriceHistory>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_PRICE_HISTORY, params));
    const res = await client.get('/admin/sync/price-history', { params });
    return res.data;
  },

  /* ── Notification Log ── */
  async getNotificationLog(params?: ListParams): Promise<PaginatedResponse<NotificationLog>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_NOTIFICATIONS];
      if (params?.channel) filtered = filtered.filter((n) => n.channel === params.channel);
      if (params?.event_type) filtered = filtered.filter((n) => n.event_type === params.event_type);
      if (params?.status) filtered = filtered.filter((n) => n.status === params.status);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/sync/notifications', { params });
    return res.data;
  },

  /* ── Conflicts ── */
  async getConflicts(params?: ListParams): Promise<PaginatedResponse<PriceConflict>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_CONFLICTS];
      if (params?.resolved === 'false') filtered = filtered.filter((c) => !c.resolved);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/sync/conflicts', { params });
    return res.data;
  },
  async resolveConflict(conflictId: number, action: 'force_website' | 'accept_channel' | 'manual'): Promise<ApiResponse<PriceConflict>> {
    if (USE_MOCK) {
      const found = MOCK_CONFLICTS.find((c) => c.id === conflictId) || MOCK_CONFLICTS[0];
      return mockDelay({ data: { ...found, resolved: true, resolved_action: action, resolved_by: 'Admin User', resolved_at: new Date().toISOString() } });
    }
    const res = await client.post(`/admin/sync/conflicts/${conflictId}/resolve`, { action });
    return res.data;
  },
};
