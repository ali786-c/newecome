/**
 * Automation API — Random Posts, Featured Rotation, Stock Suppression, Import Queue, Reseller Tools
 *
 * Laravel routes (suggested):
 *   GET/PUT  /api/automations/random-post/config
 *   POST     /api/automations/random-post/toggle
 *   GET      /api/automations/random-post/jobs
 *   GET      /api/automations/random-post/health
 *   POST     /api/automations/random-post/test
 *   POST     /api/automations/random-post/jobs/{id}/retry
 *   GET      /api/automations/modules                      → list all automation modules
 *   PUT      /api/automations/modules/{id}/toggle           → enable/disable module
 *   GET/PUT  /api/automations/featured-rotation/config
 *   POST     /api/automations/featured-rotation/trigger
 *   GET/PUT  /api/automations/stock-suppression/config
 *   GET      /api/automations/import-queue
 *   POST     /api/automations/import-queue/{id}/approve
 *   POST     /api/automations/import-queue/{id}/reject
 *   GET      /api/automations/reseller/markup-preview
 *   GET      /api/automations/event-log
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  AutomationRule, AutomationRuleCreateData, AutomationRuleUpdateData,
  RandomPostConfig, AutomationJob, AutomationHealth, TestRunResult,
  AutomationModule, FeaturedRotationConfig, StockSuppressionConfig,
  ImportQueueItem, ResellerMarkupPreview,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

/* ── Mock: Modules ── */
const MOCK_MODULES: AutomationModule[] = [
  { id: 'random_post', name: 'Random Product Posting', description: 'Auto-post random eligible products to Telegram/Discord on schedule', enabled: true, last_run_at: new Date(Date.now() - 3600000).toISOString(), next_run_at: new Date(Date.now() + 7200000).toISOString(), jobs_24h: 4, failures_24h: 1 },
  { id: 'featured_rotation', name: 'Featured Product Rotation', description: 'Automatically rotate which products are marked as featured', enabled: true, last_run_at: new Date(Date.now() - 21600000).toISOString(), next_run_at: new Date(Date.now() + 43200000).toISOString(), jobs_24h: 1, failures_24h: 0 },
  { id: 'stock_suppression', name: 'Stock Suppression', description: 'Auto-hide or badge products at low/zero stock', enabled: true, last_run_at: new Date(Date.now() - 1800000).toISOString(), jobs_24h: 3, failures_24h: 0 },
  { id: 'import_review', name: 'Import Review Queue', description: 'Draft-to-publish workflow for CSV/API imported products', enabled: true, jobs_24h: 2, failures_24h: 0 },
  { id: 'recently_updated', name: 'Recently Updated Tagging', description: 'Auto-tag products with recent price or content changes', enabled: false, jobs_24h: 0, failures_24h: 0 },
  { id: 'reseller_markup', name: 'Reseller Markup Tracking', description: 'Track base cost vs selling price and margin analysis', enabled: true, jobs_24h: 0, failures_24h: 0 },
];

/* ── Legacy rule mocks ── */
const MOCK_RULES: AutomationRule[] = [
  { id: 1, name: 'Auto-Fulfill Orders', trigger: 'order.paid', action: 'fulfill_order', active: true, last_run_at: '2025-03-10T08:00:00Z', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Send Welcome Email', trigger: 'user.registered', action: 'send_email', active: true, config: { template: 'welcome' }, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

/* ── Random post config mock ── */
const MOCK_CONFIG: RandomPostConfig = {
  id: 1, enabled: true, frequency: 'twice_daily', time_slots: ['09:00', '18:00'], timezone: 'UTC',
  channels: { telegram: true, discord: true },
  eligibility: { categories: [], require_in_stock: true, require_approved: true, require_image: false, cooldown_days: 7 },
  safety: { price_check_before_post: true, compliance_gate: true, skip_flagged: true },
  created_at: '2025-01-01T00:00:00Z', updated_at: new Date().toISOString(),
};

/* ── Job history mocks ── */
const MOCK_JOBS: AutomationJob[] = [
  { id: 1, type: 'random_post', status: 'completed', channel: 'telegram', product_id: 1, product_name: 'Office 365 Business', scheduled_at: new Date(Date.now() - 3600000).toISOString(), started_at: new Date(Date.now() - 3595000).toISOString(), completed_at: new Date(Date.now() - 3590000).toISOString(), created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, type: 'random_post', status: 'completed', channel: 'discord', product_id: 3, product_name: 'VPN Premium 1yr', scheduled_at: new Date(Date.now() - 7200000).toISOString(), started_at: new Date(Date.now() - 7195000).toISOString(), completed_at: new Date(Date.now() - 7190000).toISOString(), created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, type: 'random_post', status: 'failed', channel: 'telegram', product_id: 5, product_name: 'Cloud Storage 1TB', error_message: 'Telegram API timeout after 30s', scheduled_at: new Date(Date.now() - 14400000).toISOString(), started_at: new Date(Date.now() - 14395000).toISOString(), created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 4, type: 'random_post', status: 'skipped', channel: 'discord', skip_reason: 'No eligible products (all in cooldown)', scheduled_at: new Date(Date.now() - 28800000).toISOString(), created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: 5, type: 'featured_rotation', status: 'completed', product_id: 2, product_name: 'Adobe CC License', scheduled_at: new Date(Date.now() - 21600000).toISOString(), started_at: new Date(Date.now() - 21595000).toISOString(), completed_at: new Date(Date.now() - 21590000).toISOString(), created_at: new Date(Date.now() - 21600000).toISOString() },
  { id: 6, type: 'stock_suppression', status: 'completed', product_id: 4, product_name: 'Dev Tools Pro', scheduled_at: new Date(Date.now() - 1800000).toISOString(), started_at: new Date(Date.now() - 1795000).toISOString(), completed_at: new Date(Date.now() - 1790000).toISOString(), created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 7, type: 'random_post', status: 'queued', channel: 'telegram', scheduled_at: new Date(Date.now() + 7200000).toISOString(), created_at: new Date().toISOString() },
];

const MOCK_HEALTH: AutomationHealth = {
  total_jobs_24h: 7, successful_24h: 4, failed_24h: 1, skipped_24h: 1, success_rate: 80.0,
  next_scheduled_at: new Date(Date.now() + 7200000).toISOString(),
  last_successful_at: new Date(Date.now() - 1790000).toISOString(), is_paused: false,
};

const MOCK_TEST_RUN: TestRunResult = {
  product_id: 6, product_name: 'SEO Toolkit', channel: 'telegram',
  preview_text: '🎲 Random Pick!\n\n🔥 *SEO Toolkit*\n💰 $34.99 ~~$49.99~~\n📦 In Stock\n\n🔗 [View Product](https://upgradercx.com/products/seo-toolkit)',
  would_post: true,
};

/* ── Featured Rotation Config ── */
const MOCK_FEATURED_CONFIG: FeaturedRotationConfig = {
  id: 1, enabled: true, rotation_interval_hours: 24, max_featured: 6,
  require_in_stock: true, require_image: true, category_distribution: true,
  exclude_recently_unfeatured_days: 3, notify_on_rotation: true, updated_at: new Date().toISOString(),
};

/* ── Stock Suppression Config ── */
const MOCK_STOCK_CONFIG: StockSuppressionConfig = {
  id: 1, enabled: true, auto_hide_at_zero: true, auto_disable_sync_at_zero: true,
  low_stock_threshold: 5, low_stock_badge: true,
  notify_admin_on_low_stock: true, notify_admin_on_out_of_stock: true,
  auto_restore_on_restock: true, updated_at: new Date().toISOString(),
};

/* ── Import Queue ── */
const MOCK_IMPORT_QUEUE: ImportQueueItem[] = [
  { id: 1, product_name: 'Windows 11 Pro Key', source: 'csv', imported_by: 'Admin User', status: 'pending', field_warnings: ['No image provided', 'Category not matched'], price: 14.99, category_name: 'Software Licenses', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, product_name: 'Antivirus 1yr', source: 'csv', imported_by: 'Admin User', status: 'pending', field_warnings: [], price: 9.99, category_name: 'VPN & Security', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, product_name: 'Project Management Tool', source: 'api', imported_by: 'API Import', status: 'approved', field_warnings: [], price: 29.99, category_name: 'Cloud Services', created_at: new Date(Date.now() - 86400000).toISOString(), reviewed_at: new Date(Date.now() - 82800000).toISOString(), reviewed_by: 'Admin User' },
  { id: 4, product_name: 'Unknown Product X', source: 'csv', imported_by: 'Admin User', status: 'rejected', field_warnings: ['Price is $0.00', 'No description', 'Duplicate SKU'], price: 0, created_at: new Date(Date.now() - 172800000).toISOString(), reviewed_at: new Date(Date.now() - 170000000).toISOString(), reviewed_by: 'Admin User' },
  { id: 5, product_name: 'Cloud Backup 500GB', source: 'manual', imported_by: 'Admin User', status: 'draft', field_warnings: ['Missing compare_price'], price: 19.99, category_name: 'Cloud Services', created_at: new Date(Date.now() - 7200000).toISOString() },
];

/* ── Reseller Markup ── */
const MOCK_MARKUP: ResellerMarkupPreview[] = [
  { product_id: 1, product_name: 'Office 365 Business', base_cost: 15.00, website_price: 22.99, markup_percent: 53.3, margin_amount: 7.99, suggested_price: 24.99 },
  { product_id: 2, product_name: 'Adobe CC License', base_cost: 35.00, website_price: 54.99, markup_percent: 57.1, margin_amount: 19.99, suggested_price: 52.50 },
  { product_id: 3, product_name: 'VPN Premium 1yr', base_cost: 8.00, website_price: 14.99, markup_percent: 87.4, margin_amount: 6.99 },
  { product_id: 4, product_name: 'Dev Tools Pro', base_cost: 20.00, website_price: 29.99, markup_percent: 50.0, margin_amount: 9.99 },
  { product_id: 5, product_name: 'Cloud Storage 1TB', base_cost: 5.00, website_price: 9.99, markup_percent: 99.8, margin_amount: 4.99 },
];

export const automationApi = {
  /* ── Modules ── */
  async getModules(): Promise<ApiResponse<AutomationModule[]>> {
    const res = await client.get('/admin/automation/modules');
    return res.data;
  },
  async toggleModule(moduleId: string, enabled: boolean): Promise<ApiResponse<AutomationModule>> {
    const res = await client.put(`/admin/automation/modules/${moduleId}/toggle`, { enabled });
    return res.data;
  },

  /* Legacy rule CRUD */
  async list(params?: ListParams): Promise<PaginatedResponse<AutomationRule>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_RULES, params));
    const res = await client.get('/admin/automation', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<AutomationRule>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_RULES.find((r) => r.id === id) || MOCK_RULES[0] });
    const res = await client.get(`/admin/automation/${id}`);
    return res.data;
  },
  async create(data: AutomationRuleCreateData): Promise<ApiResponse<AutomationRule>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_RULES[0], ...data, id: 99 } as AutomationRule });
    const res = await client.post('/admin/automation', data);
    return res.data;
  },
  async update(id: number, data: AutomationRuleUpdateData): Promise<ApiResponse<AutomationRule>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_RULES[0], ...data, id } as AutomationRule });
    const res = await client.put(`/admin/automation/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    if (USE_MOCK) return mockDelay(undefined);
    await client.delete(`/admin/automation/${id}`);
  },

  /* ── Random Post ── */
  async getRandomPostConfig(): Promise<ApiResponse<RandomPostConfig>> {
    const res = await client.get('/admin/automation/random-post/config');
    return res.data;
  },
  async updateRandomPostConfig(data: Partial<RandomPostConfig>): Promise<ApiResponse<RandomPostConfig>> {
    const res = await client.put('/admin/automation/random-post/config', data);
    return res.data;
  },
  async togglePause(paused: boolean): Promise<ApiResponse<{ is_paused: boolean }>> {
    const res = await client.post('/admin/automation/random-post/toggle', { paused });
    return res.data;
  },
  async getJobs(params?: ListParams): Promise<PaginatedResponse<AutomationJob>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_JOBS];
      if (params?.channel) filtered = filtered.filter((j) => j.channel === params.channel);
      if (params?.status) filtered = filtered.filter((j) => j.status === params.status);
      if (params?.type) filtered = filtered.filter((j) => j.type === params.type);
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/automation/random-post/jobs', { params });
    return res.data;
  },
  async getHealth(): Promise<ApiResponse<AutomationHealth>> {
    const res = await client.get('/admin/automation/random-post/health');
    return res.data;
  },
  async testRun(channel: 'telegram' | 'discord'): Promise<ApiResponse<TestRunResult>> {
    const res = await client.post('/admin/automation/random-post/test', { channel });
    return res.data;
  },
  async retryJob(jobId: number): Promise<ApiResponse<AutomationJob>> {
    const res = await client.post(`/admin/automation/random-post/jobs/${jobId}/retry`);
    return res.data;
  },

  /* ── Featured Rotation ── */
  async getFeaturedConfig(): Promise<ApiResponse<FeaturedRotationConfig>> {
    const res = await client.get('/admin/automation/featured-rotation/config');
    return res.data;
  },
  async updateFeaturedConfig(data: Partial<FeaturedRotationConfig>): Promise<ApiResponse<FeaturedRotationConfig>> {
    const res = await client.put('/admin/automation/featured-rotation/config', data);
    return res.data;
  },
  async triggerFeaturedRotation(): Promise<ApiResponse<{ rotated: number }>> {
    const res = await client.post('/admin/automation/featured-rotation/trigger');
    return res.data;
  },

  /* ── Stock Suppression ── */
  async getStockConfig(): Promise<ApiResponse<StockSuppressionConfig>> {
    const res = await client.get('/admin/automation/stock-suppression/config');
    return res.data;
  },
  async updateStockConfig(data: Partial<StockSuppressionConfig>): Promise<ApiResponse<StockSuppressionConfig>> {
    const res = await client.put('/admin/automation/stock-suppression/config', data);
    return res.data;
  },

  /* ── Import Queue ── */
  async getImportQueue(params?: ListParams): Promise<PaginatedResponse<ImportQueueItem>> {
    const res = await client.get('/admin/automation/import-queue', { params });
    return res.data;
  },
  async approveImport(id: number): Promise<ApiResponse<ImportQueueItem>> {
    const res = await client.post(`/admin/automation/import-queue/${id}/approve`);
    return res.data;
  },
  async rejectImport(id: number): Promise<ApiResponse<ImportQueueItem>> {
    const res = await client.post(`/admin/automation/import-queue/${id}/reject`);
    return res.data;
  },

  /* ── Reseller Markup ── */
  async getMarkupPreview(params?: ListParams): Promise<PaginatedResponse<ResellerMarkupPreview>> {
    const res = await client.get('/admin/automation/reseller/markup-preview', { params });
    return res.data;
  },

  /* ── AI Blog Automation ── */
  async getAIBlogConfig(): Promise<ApiResponse<any>> {
    const res = await client.get('/admin/blog-automation/config');
    return res.data;
  },
  async updateAIBlogConfig(data: any): Promise<ApiResponse<any>> {
    const res = await client.put('/admin/blog-automation/config', data);
    return res.data;
  },
  async getKeywords(params?: ListParams): Promise<PaginatedResponse<any>> {
    const res = await client.get('/admin/blog-automation/keywords', { params });
    return res.data;
  },
  async addKeyword(keyword: string): Promise<ApiResponse<any>> {
    const res = await client.post('/admin/blog-automation/keywords', { keyword });
    return res.data;
  },
  async bulkAddKeywords(keywords: string[]): Promise<ApiResponse<any>> {
    const res = await client.post('/admin/blog-automation/keywords/bulk', { keywords });
    return res.data;
  },
  async updateKeyword(id: number, data: any): Promise<ApiResponse<any>> {
    const res = await client.put(`/admin/blog-automation/keywords/${id}`, data);
    return res.data;
  },
  async deleteKeyword(id: number): Promise<void> {
    await client.delete(`/admin/blog-automation/keywords/${id}`);
  },
  async triggerAIBlog(): Promise<ApiResponse<any>> {
    const res = await client.post('/admin/blog-automation/trigger');
    return res.data;
  },
  async getAIBlogStatus(): Promise<ApiResponse<any>> {
    const res = await client.get('/admin/blog-automation/status');
    return res.data;
  },
  async getTelegramConfig(): Promise<ApiResponse<any>> {
    const res = await client.get('/admin/blog-automation/telegram');
    return res.data;
  },
  async updateTelegramConfig(data: any): Promise<ApiResponse<any>> {
    const res = await client.put('/admin/blog-automation/telegram', data);
    return res.data;
  },
  async testTelegram(): Promise<ApiResponse<any>> {
    const res = await client.post('/admin/blog-automation/telegram/test');
    return res.data;
  },
  async sendPostToTelegram(postId: number): Promise<ApiResponse<any>> {
    const res = await client.post(`/admin/blog-automation/telegram/send/${postId}`);
    return res.data;
  },
  async getPinterestConfig(): Promise<ApiResponse<any>> {
    const res = await client.get('/admin/blog-automation/pinterest');
    return res.data;
  },
  async updatePinterestConfig(data: any): Promise<ApiResponse<any>> {
    const res = await client.put('/admin/blog-automation/pinterest', data);
    return res.data;
  },
  async testPinterest(): Promise<ApiResponse<any>> {
    const res = await client.post('/admin/blog-automation/pinterest/test');
    return res.data;
  },
  async sendPostToPinterest(postId: number): Promise<ApiResponse<any>> {
    const res = await client.post(`/admin/blog-automation/pinterest/send/${postId}`);
    return res.data;
  },
  async getDiscordConfig(): Promise<ApiResponse<any>> {
    const res = await client.get('/admin/blog-automation/discord');
    return res.data;
  },
  async updateDiscordConfig(data: any): Promise<ApiResponse<any>> {
    const res = await client.put('/admin/blog-automation/discord', data);
    return res.data;
  },
  async testDiscord(): Promise<ApiResponse<any>> {
    const res = await client.post('/admin/blog-automation/discord/test');
    return res.data;
  },
  async sendPostToDiscord(postId: number): Promise<ApiResponse<any>> {
    const res = await client.post(`/admin/blog-automation/discord/send/${postId}`);
    return res.data;
  },
};
