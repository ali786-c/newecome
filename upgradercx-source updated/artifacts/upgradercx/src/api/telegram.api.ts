/**
 * Telegram Integration API — Admin Commands & Notifications
 *
 * Laravel routes (suggested):
 *   GET    /api/integrations/telegram/config          → TelegramController@config
 *   PUT    /api/integrations/telegram/config          → TelegramController@updateConfig
 *   POST   /api/integrations/telegram/bot-token       → TelegramController@setBotToken
 *   POST   /api/integrations/telegram/test            → TelegramController@testConnection
 *   GET    /api/integrations/telegram/posts           → TelegramController@postHistory
 *   GET    /api/integrations/telegram/preview/{id}    → TelegramController@previewPost
 *   POST   /api/integrations/telegram/push/{id}       → TelegramController@pushProduct
 *   POST   /api/integrations/telegram/posts/{id}/retry → TelegramController@retryPost
 *   GET    /api/integrations/telegram/commands/permissions → TelegramCommandController@permissions
 *   PUT    /api/integrations/telegram/commands/permissions → TelegramCommandController@updatePermissions
 *   GET    /api/integrations/telegram/commands/log    → TelegramCommandController@log
 *   GET    /api/integrations/telegram/alerts/config   → TelegramAlertController@config
 *   PUT    /api/integrations/telegram/alerts/config   → TelegramAlertController@updateConfig
 *
 * IMPORTANT: Bot token is stored server-side only. Frontend never sees the token value.
 * All commands received by the bot are validated by Laravel middleware before execution.
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  TelegramConfig, TelegramCommandPermission, TelegramCommandLog,
  TelegramAlertConfig, ChannelPost, ChannelPostPreview,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

/* ── Mock Config ── */
const MOCK_CONFIG: TelegramConfig = {
  id: 1,
  bot_token_set: true,
  bot_username: 'UpgraderCXBot',
  channel_id: '-1001234567890',
  channel_title: 'UpgraderCX Products',
  webhook_url: 'https://api.upgradercx.com/webhooks/telegram/bot',
  auto_sync_enabled: true,
  post_format: 'detailed',
  include_image: true,
  include_price: true,
  include_link: true,
  admin_chat_ids: ['123456789', '987654321'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

/* ── Mock Posts ── */
const MOCK_POSTS: ChannelPost[] = [
  { id: 1, product_id: 1, product_name: 'Office 365 Business', channel: 'telegram', action: 'create', status: 'sent', message_id: '1234', posted_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, product_id: 2, product_name: 'Adobe CC License', channel: 'telegram', action: 'update', status: 'sent', message_id: '1235', posted_at: new Date(Date.now() - 7200000).toISOString(), created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, product_id: 3, product_name: 'VPN Premium 1yr', channel: 'telegram', action: 'create', status: 'failed', error_message: 'Bot was blocked by the user', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 4, product_id: 5, product_name: 'Cloud Storage 1TB', channel: 'telegram', action: 'update', status: 'sent', message_id: '1240', posted_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, product_id: 4, product_name: 'Dev Tools Pro', channel: 'telegram', action: 'create', status: 'pending', created_at: new Date(Date.now() - 60000).toISOString() },
];

const MOCK_PREVIEW: ChannelPostPreview = {
  product_id: 1,
  product_name: 'Office 365 Business',
  channel: 'telegram',
  preview_text: '🔥 *Office 365 Business*\n\n💰 Price: $22.99 ~~$29.99~~\n📦 In Stock\n\n🔗 [View Product](https://upgradercx.com/products/office-365)',
  price: 22.99,
  compare_price: 29.99,
  link: 'https://upgradercx.com/products/office-365',
};

/* ── Mock Command Permissions ── */
const MOCK_PERMISSIONS: TelegramCommandPermission[] = [
  { command: 'price', enabled: true, requires_approval: true, description: 'Update product price', usage: '/price [product_id] [new_price]', category: 'pricing' },
  { command: 'enable', enabled: true, requires_approval: false, description: 'Enable (activate) a product', usage: '/enable [product_id]', category: 'product' },
  { command: 'disable', enabled: true, requires_approval: false, description: 'Disable (deactivate) a product', usage: '/disable [product_id]', category: 'product' },
  { command: 'feature', enabled: true, requires_approval: false, description: 'Mark product as featured', usage: '/feature [product_id]', category: 'product' },
  { command: 'sync', enabled: true, requires_approval: false, description: 'Force sync a product to channels', usage: '/sync [product_id]', category: 'sync' },
  { command: 'syncall', enabled: true, requires_approval: false, description: 'Trigger full sync of all products', usage: '/syncall', category: 'sync' },
  { command: 'preview', enabled: true, requires_approval: false, description: 'Preview a product post', usage: '/preview [product_id]', category: 'sync' },
  { command: 'status', enabled: true, requires_approval: false, description: 'Show bot and sync status', usage: '/status', category: 'system' },
  { command: 'pause', enabled: true, requires_approval: false, description: 'Pause auto-sync temporarily', usage: '/pause', category: 'system' },
  { command: 'resume', enabled: true, requires_approval: false, description: 'Resume auto-sync', usage: '/resume', category: 'system' },
  { command: 'errors', enabled: true, requires_approval: false, description: 'Show recent sync errors', usage: '/errors', category: 'system' },
  { command: 'draft', enabled: true, requires_approval: true, description: 'Create draft product update request', usage: '/draft [product_id] [field] [value]', category: 'product' },
  { command: 'ticket', enabled: true, requires_approval: false, description: 'Notify support team about a ticket', usage: '/ticket [ticket_id]', category: 'support' },
  { command: 'alerts', enabled: true, requires_approval: false, description: 'Toggle automation alert preferences', usage: '/alerts [on|off]', category: 'system' },
];

/* ── Mock Command Log ── */
const MOCK_COMMAND_LOG: TelegramCommandLog[] = [
  { id: 1, command: 'price', raw_input: '/price 1 22.99', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'executed', product_id: 1, product_name: 'Office 365 Business', result_message: 'Price updated: $24.99 → $22.99', old_value: '24.99', new_value: '22.99', approval_status: 'auto_approved', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, command: 'sync', raw_input: '/sync 2', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'executed', product_id: 2, product_name: 'Adobe CC License', result_message: 'Sync queued for all channels', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 3, command: 'price', raw_input: '/price 5 1.99', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'pending_approval', product_id: 5, product_name: 'Cloud Storage 1TB', result_message: 'Price change exceeds 23% threshold — held for approval', old_value: '9.99', new_value: '1.99', approval_status: 'pending_approval', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, command: 'enable', raw_input: '/enable 3', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'executed', product_id: 3, product_name: 'VPN Premium 1yr', result_message: 'Product activated', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, command: 'price', raw_input: '/price 99 15.00', telegram_user_id: '555555555', telegram_username: 'unknown_user', status: 'rejected', error_message: 'Unauthorized: Telegram user not in admin list', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 6, command: 'syncall', raw_input: '/syncall', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'executed', result_message: 'Full sync triggered: 24 products queued', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 7, command: 'feature', raw_input: '/feature 1', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'executed', product_id: 1, product_name: 'Office 365 Business', result_message: 'Product marked as featured', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 8, command: 'disable', raw_input: '/disable abc', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'failed', error_message: 'Invalid product ID: abc', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 9, command: 'draft', raw_input: '/draft 2 price 39.99', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'pending_approval', product_id: 2, product_name: 'Adobe CC License', result_message: 'Draft update request created — awaiting admin approval', old_value: '54.99', new_value: '39.99', approval_status: 'pending_approval', created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 10, command: 'ticket', raw_input: '/ticket 3', telegram_user_id: '123456789', telegram_username: 'admin_john', status: 'executed', result_message: 'Ticket #3 notification sent to support channel', created_at: new Date(Date.now() - 120000).toISOString() },
];

/* ── Mock Alert Config ── */
const MOCK_ALERT_CONFIG: TelegramAlertConfig = {
  new_ticket: true,
  ticket_high_priority: true,
  order_completed: true,
  order_failed: true,
  price_approval_needed: true,
  sync_failed: true,
  low_stock: false,
  automation_triggered: true,
};

export const telegramApi = {
  /* ── Config ── */
  async getConfig(): Promise<ApiResponse<TelegramConfig>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CONFIG });
    const res = await client.get('/admin/telegram/config');
    return res.data;
  },
  async updateConfig(data: Partial<TelegramConfig>): Promise<ApiResponse<TelegramConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, ...data, updated_at: new Date().toISOString() } });
    const res = await client.put('/admin/telegram/config', data);
    return res.data;
  },
  async testConnection(): Promise<ApiResponse<{ success: boolean; bot_info?: { username: string } }>> {
    if (USE_MOCK) return mockDelay({ data: { success: true, bot_info: { username: 'UpgraderCXBot' } } });
    const res = await client.post('/admin/telegram/test');
    return res.data;
  },
  async setBotToken(token: string): Promise<ApiResponse<TelegramConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, bot_token_set: true } });
    const res = await client.post('/admin/telegram/bot-token', { token });
    return res.data;
  },

  /* ── Posts ── */
  async getPostHistory(params?: ListParams): Promise<PaginatedResponse<ChannelPost>> {
    if (USE_MOCK) {
      const page = params?.page ?? 1;
      const perPage = params?.per_page ?? 10;
      return mockDelay({
        data: MOCK_POSTS.slice((page - 1) * perPage, page * perPage),
        meta: { current_page: page, last_page: 1, per_page: perPage, total: MOCK_POSTS.length },
        links: { first: '', last: '', prev: null, next: null },
      });
    }
    const res = await client.get('/admin/telegram/posts', { params });
    return res.data;
  },
  async previewPost(productId: number): Promise<ApiResponse<ChannelPostPreview>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_PREVIEW, product_id: productId } });
    const res = await client.get(`/admin/telegram/preview/${productId}`);
    return res.data;
  },
  async pushProduct(productId: number): Promise<ApiResponse<ChannelPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id: Date.now(), product_id: productId, status: 'pending' as const, created_at: new Date().toISOString() } });
    const res = await client.post(`/admin/telegram/push/${productId}`);
    return res.data;
  },
  async retryPost(postId: number): Promise<ApiResponse<ChannelPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id: postId, status: 'pending' as const } });
    const res = await client.post(`/admin/telegram/posts/${postId}/retry`);
    return res.data;
  },

  /* ── Command Permissions ── */
  async getCommandPermissions(): Promise<ApiResponse<TelegramCommandPermission[]>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_PERMISSIONS });
    const res = await client.get('/admin/telegram/commands/permissions');
    return res.data;
  },
  async updateCommandPermission(command: string, data: Partial<TelegramCommandPermission>): Promise<ApiResponse<TelegramCommandPermission[]>> {
    if (USE_MOCK) {
      const updated = MOCK_PERMISSIONS.map((p) => p.command === command ? { ...p, ...data } : p);
      return mockDelay({ data: updated });
    }
    const res = await client.put('/admin/telegram/commands/permissions', { command, ...data });
    return res.data;
  },

  /* ── Command Log ── */
  async getCommandLog(params?: ListParams): Promise<PaginatedResponse<TelegramCommandLog>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_COMMAND_LOG];
      if (params?.status) filtered = filtered.filter((l) => l.status === params.status);
      if (params?.command) filtered = filtered.filter((l) => l.command === params.command);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/telegram/commands/log', { params });
    return res.data;
  },

  /* ── Alert Config ── */
  async getAlertConfig(): Promise<ApiResponse<TelegramAlertConfig>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_ALERT_CONFIG });
    const res = await client.get('/admin/telegram/alerts/config');
    return res.data;
  },
  async updateAlertConfig(data: Partial<TelegramAlertConfig>): Promise<ApiResponse<TelegramAlertConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_ALERT_CONFIG, ...data } });
    const res = await client.put('/admin/telegram/alerts/config', data);
    return res.data;
  },
};
