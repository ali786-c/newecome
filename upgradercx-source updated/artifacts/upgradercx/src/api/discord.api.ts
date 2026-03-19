/**
 * Discord Integration API — Webhooks, Bot Commands & Notifications
 *
 * Laravel routes (suggested):
 *   GET    /api/integrations/discord/config            → DiscordController@config
 *   PUT    /api/integrations/discord/config            → DiscordController@updateConfig
 *   POST   /api/integrations/discord/webhook           → DiscordController@setWebhookUrl
 *   POST   /api/integrations/discord/alert-webhook     → DiscordController@setAlertWebhookUrl
 *   POST   /api/integrations/discord/bot-token         → DiscordController@setBotToken
 *   POST   /api/integrations/discord/test              → DiscordController@testConnection
 *   PUT    /api/integrations/discord/mappings/{id}     → DiscordController@updateMapping
 *   GET    /api/integrations/discord/posts             → DiscordController@postHistory
 *   GET    /api/integrations/discord/preview/{id}      → DiscordController@previewPost
 *   POST   /api/integrations/discord/push/{id}         → DiscordController@pushProduct
 *   POST   /api/integrations/discord/posts/{id}/retry  → DiscordController@retryPost
 *   GET    /api/integrations/discord/commands/permissions → DiscordCommandController@permissions
 *   PUT    /api/integrations/discord/commands/permissions → DiscordCommandController@updatePermissions
 *   GET    /api/integrations/discord/commands/log      → DiscordCommandController@log
 *   GET    /api/integrations/discord/alerts/config     → DiscordAlertController@config
 *   PUT    /api/integrations/discord/alerts/config     → DiscordAlertController@updateConfig
 *
 * IMPORTANT: Bot token and webhook URLs are stored server-side only.
 * All bot commands are validated by Laravel middleware before execution.
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  DiscordConfig, DiscordChannelMapping, DiscordCommandPermission, DiscordCommandLog,
  DiscordAlertConfig, ChannelPost, ChannelPostPreview,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

/* ── Mock Data ── */
const MOCK_MAPPINGS: DiscordChannelMapping[] = [
  { id: 1, category_id: 1, category_name: 'Software Licenses', discord_channel_id: '111222333', discord_channel_name: '#software-deals', enabled: true },
  { id: 2, category_id: 2, category_name: 'Cloud Services', discord_channel_id: '444555666', discord_channel_name: '#cloud-deals', enabled: true },
  { id: 3, category_id: 3, category_name: 'VPN & Security', discord_channel_id: '777888999', discord_channel_name: '#security-deals', enabled: false },
];

const MOCK_CONFIG: DiscordConfig = {
  id: 1,
  webhook_url_set: true,
  bot_token_set: true,
  server_name: 'UpgraderCX Community',
  server_id: '123456789012345678',
  alert_webhook_url_set: true,
  channel_mappings: MOCK_MAPPINGS,
  auto_sync_enabled: false,
  post_format: 'embed',
  include_image: true,
  include_price: true,
  embed_color: '#5865F2',
  admin_role_ids: ['1100000000000', '1100000000001'],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

const MOCK_POSTS: ChannelPost[] = [
  { id: 10, product_id: 1, product_name: 'Office 365 Business', channel: 'discord', action: 'create', status: 'sent', message_id: 'dc_1001', posted_at: new Date(Date.now() - 5400000).toISOString(), created_at: new Date(Date.now() - 5400000).toISOString() },
  { id: 11, product_id: 3, product_name: 'VPN Premium 1yr', channel: 'discord', action: 'update', status: 'failed', error_message: 'Webhook returned 403 Forbidden', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 12, product_id: 5, product_name: 'Cloud Storage 1TB', channel: 'discord', action: 'create', status: 'sent', message_id: 'dc_1002', posted_at: new Date(Date.now() - 43200000).toISOString(), created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: 13, product_id: 2, product_name: 'Adobe CC License', channel: 'discord', action: 'update', status: 'pending', created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 14, product_id: 4, product_name: 'Dev Tools Pro', channel: 'discord', action: 'create', status: 'sent', message_id: 'dc_1003', posted_at: new Date(Date.now() - 172800000).toISOString(), created_at: new Date(Date.now() - 172800000).toISOString() },
];

const MOCK_PREVIEW: ChannelPostPreview = {
  product_id: 1,
  product_name: 'Office 365 Business',
  channel: 'discord',
  preview_text: '**Office 365 Business**\n\n💰 **$22.99** ~~$29.99~~\n📦 In Stock\n\n[View Product](https://upgradercx.com/products/office-365)',
  price: 22.99,
  compare_price: 29.99,
  link: 'https://upgradercx.com/products/office-365',
};

const MOCK_PERMISSIONS: DiscordCommandPermission[] = [
  { command: 'price', enabled: true, requires_approval: true, description: 'Update product price', usage: '!price [product_id] [new_price]', category: 'pricing' },
  { command: 'enable', enabled: true, requires_approval: false, description: 'Enable (activate) a product', usage: '!enable [product_id]', category: 'product' },
  { command: 'disable', enabled: true, requires_approval: false, description: 'Disable (deactivate) a product', usage: '!disable [product_id]', category: 'product' },
  { command: 'feature', enabled: true, requires_approval: false, description: 'Mark product as featured', usage: '!feature [product_id]', category: 'product' },
  { command: 'sync', enabled: true, requires_approval: false, description: 'Force sync a product to channels', usage: '!sync [product_id]', category: 'sync' },
  { command: 'syncall', enabled: true, requires_approval: false, description: 'Trigger full sync of all products', usage: '!syncall', category: 'sync' },
  { command: 'preview', enabled: true, requires_approval: false, description: 'Preview a product post', usage: '!preview [product_id]', category: 'sync' },
  { command: 'status', enabled: true, requires_approval: false, description: 'Show bot and sync status', usage: '!status', category: 'system' },
  { command: 'pause', enabled: true, requires_approval: false, description: 'Pause auto-sync temporarily', usage: '!pause', category: 'system' },
  { command: 'resume', enabled: true, requires_approval: false, description: 'Resume auto-sync', usage: '!resume', category: 'system' },
  { command: 'errors', enabled: true, requires_approval: false, description: 'Show recent sync errors', usage: '!errors', category: 'system' },
  { command: 'draft', enabled: true, requires_approval: true, description: 'Create draft product update request', usage: '!draft [product_id] [field] [value]', category: 'product' },
  { command: 'ticket', enabled: true, requires_approval: false, description: 'Notify support team about a ticket', usage: '!ticket [ticket_id]', category: 'support' },
  { command: 'alerts', enabled: true, requires_approval: false, description: 'Toggle automation alert preferences', usage: '!alerts [on|off]', category: 'system' },
];

const MOCK_COMMAND_LOG: DiscordCommandLog[] = [
  { id: 1, command: 'price', raw_input: '!price 1 22.99', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'executed', product_id: 1, product_name: 'Office 365 Business', result_message: 'Price updated: $24.99 → $22.99', old_value: '24.99', new_value: '22.99', approval_status: 'auto_approved', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, command: 'sync', raw_input: '!sync 2', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'executed', product_id: 2, product_name: 'Adobe CC License', result_message: 'Sync queued for all channels', created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 3, command: 'price', raw_input: '!price 5 1.99', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'pending_approval', product_id: 5, product_name: 'Cloud Storage 1TB', result_message: 'Price change exceeds 23% threshold — held for approval', old_value: '9.99', new_value: '1.99', approval_status: 'pending_approval', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, command: 'enable', raw_input: '!enable 3', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'executed', product_id: 3, product_name: 'VPN Premium 1yr', result_message: 'Product activated', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, command: 'price', raw_input: '!price 99 15.00', discord_user_id: '9999999999', discord_username: 'random_user', status: 'rejected', error_message: 'Unauthorized: User does not have admin role', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 6, command: 'syncall', raw_input: '!syncall', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'executed', result_message: 'Full sync triggered: 24 products queued', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 7, command: 'feature', raw_input: '!feature 1', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'executed', product_id: 1, product_name: 'Office 365 Business', result_message: 'Product marked as featured', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 8, command: 'disable', raw_input: '!disable abc', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'failed', error_message: 'Invalid product ID: abc', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 9, command: 'draft', raw_input: '!draft 2 price 39.99', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'pending_approval', product_id: 2, product_name: 'Adobe CC License', result_message: 'Draft update request created — awaiting admin approval', old_value: '54.99', new_value: '39.99', approval_status: 'pending_approval', created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 10, command: 'ticket', raw_input: '!ticket 5', discord_user_id: '2200000001', discord_username: 'admin_john', status: 'executed', result_message: 'Ticket #5 notification sent to support channel', created_at: new Date(Date.now() - 120000).toISOString() },
];

const MOCK_ALERT_CONFIG: DiscordAlertConfig = {
  new_ticket: true,
  ticket_high_priority: true,
  order_completed: true,
  order_failed: true,
  price_approval_needed: true,
  sync_failed: true,
  low_stock: false,
  automation_triggered: true,
};

export const discordApi = {
  /* ── Config ── */
  async getConfig(): Promise<ApiResponse<DiscordConfig>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CONFIG });
    const res = await client.get('/integrations/discord/config');
    return res.data;
  },
  async updateConfig(data: Partial<DiscordConfig>): Promise<ApiResponse<DiscordConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, ...data, updated_at: new Date().toISOString() } });
    const res = await client.put('/integrations/discord/config', data);
    return res.data;
  },
  async setWebhookUrl(url: string): Promise<ApiResponse<DiscordConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, webhook_url_set: true } });
    const res = await client.post('/integrations/discord/webhook', { webhook_url: url });
    return res.data;
  },
  async setAlertWebhookUrl(url: string): Promise<ApiResponse<DiscordConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, alert_webhook_url_set: true } });
    const res = await client.post('/integrations/discord/alert-webhook', { webhook_url: url });
    return res.data;
  },
  async setBotToken(token: string): Promise<ApiResponse<DiscordConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, bot_token_set: true } });
    const res = await client.post('/integrations/discord/bot-token', { token });
    return res.data;
  },
  async testConnection(): Promise<ApiResponse<{ success: boolean; server_name?: string }>> {
    if (USE_MOCK) return mockDelay({ data: { success: true, server_name: 'UpgraderCX Community' } });
    const res = await client.post('/integrations/discord/test');
    return res.data;
  },
  async updateChannelMapping(mapping: Partial<DiscordChannelMapping> & { id: number }): Promise<ApiResponse<DiscordChannelMapping>> {
    if (USE_MOCK) {
      const found = MOCK_MAPPINGS.find((m) => m.id === mapping.id) || MOCK_MAPPINGS[0];
      return mockDelay({ data: { ...found, ...mapping } });
    }
    const res = await client.put(`/integrations/discord/mappings/${mapping.id}`, mapping);
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
    const res = await client.get('/integrations/discord/posts', { params });
    return res.data;
  },
  async previewPost(productId: number): Promise<ApiResponse<ChannelPostPreview>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_PREVIEW, product_id: productId } });
    const res = await client.get(`/integrations/discord/preview/${productId}`);
    return res.data;
  },
  async pushProduct(productId: number): Promise<ApiResponse<ChannelPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id: Date.now(), product_id: productId, status: 'pending' as const, created_at: new Date().toISOString() } });
    const res = await client.post(`/integrations/discord/push/${productId}`);
    return res.data;
  },
  async retryPost(postId: number): Promise<ApiResponse<ChannelPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id: postId, status: 'pending' as const } });
    const res = await client.post(`/integrations/discord/posts/${postId}/retry`);
    return res.data;
  },

  /* ── Command Permissions ── */
  async getCommandPermissions(): Promise<ApiResponse<DiscordCommandPermission[]>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_PERMISSIONS });
    const res = await client.get('/integrations/discord/commands/permissions');
    return res.data;
  },
  async updateCommandPermission(command: string, data: Partial<DiscordCommandPermission>): Promise<ApiResponse<DiscordCommandPermission[]>> {
    if (USE_MOCK) {
      const updated = MOCK_PERMISSIONS.map((p) => p.command === command ? { ...p, ...data } : p);
      return mockDelay({ data: updated });
    }
    const res = await client.put('/integrations/discord/commands/permissions', { command, ...data });
    return res.data;
  },

  /* ── Command Log ── */
  async getCommandLog(params?: ListParams): Promise<PaginatedResponse<DiscordCommandLog>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_COMMAND_LOG];
      if (params?.status) filtered = filtered.filter((l) => l.status === params.status);
      if (params?.command) filtered = filtered.filter((l) => l.command === params.command);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/integrations/discord/commands/log', { params });
    return res.data;
  },

  /* ── Alert Config ── */
  async getAlertConfig(): Promise<ApiResponse<DiscordAlertConfig>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_ALERT_CONFIG });
    const res = await client.get('/integrations/discord/alerts/config');
    return res.data;
  },
  async updateAlertConfig(data: Partial<DiscordAlertConfig>): Promise<ApiResponse<DiscordAlertConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_ALERT_CONFIG, ...data } });
    const res = await client.put('/integrations/discord/alerts/config', data);
    return res.data;
  },
};
