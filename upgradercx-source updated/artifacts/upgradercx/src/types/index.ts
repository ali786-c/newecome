// ==========================================
// Shared Types — Laravel API Compatible
// ==========================================
// These interfaces mirror Laravel Eloquent models and API Resources.
// Each type uses snake_case to match Laravel's default JSON serialisation.
// Timestamps follow ISO-8601 (Carbon::toISOString()).

/* ── Roles ── */
export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';

/* ── Auth ── */
/** Maps to: App\Http\Resources\UserResource */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  email_verified_at?: string;
  wallet_balance?: number;
  created_at: string;
  updated_at: string;
}

/** Laravel Sanctum token response */
export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/* ── API Response Wrappers ── */
/** Standard Laravel API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/** Laravel 422 validation error shape */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/** Laravel paginate() response shape */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

/** Common query parameters for list endpoints */
export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  [key: string]: unknown;
}

/* ── Products ── */
/** Maps to: App\Models\Product */
export type ProductStatus = 'active' | 'draft' | 'archived';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'limited';
export type ComplianceStatus = 'approved' | 'pending_review' | 'flagged' | 'rejected';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  discount_label?: string;
  category_id: number;
  category?: Category;
  tags: string[];
  status: ProductStatus;
  stock_status: StockStatus;
  image_url?: string;
  gallery?: string[];
  telegram_enabled: boolean;
  discord_enabled: boolean;
  random_post_eligible: boolean;
  compliance_status: ComplianceStatus;
  internal_notes?: string;
  features?: string[];
  badge?: string;
  onHold?: boolean;
  startingAt?: boolean;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateData {
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  discount_label?: string;
  category_id: number;
  tags?: string[];
  status?: ProductStatus;
  stock_status?: StockStatus;
  image_url?: string;
  telegram_enabled?: boolean;
  discord_enabled?: boolean;
  random_post_eligible?: boolean;
  compliance_status?: ComplianceStatus;
  internal_notes?: string;
}

export type ProductUpdateData = Partial<ProductCreateData>;

export interface ProductBulkActionData {
  ids: number[];
  action: 'enable' | 'disable' | 'archive' | 'assign_category' | 'update_pricing' | 'delete';
  payload?: Record<string, unknown>;
}

/* ── Categories ── */
/** Maps to: App\Models\Category */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
}

export type CategoryUpdateData = Partial<CategoryCreateData>;

/* ── Orders ── */
/** Maps to: App\Models\Order */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
export type FulfillmentStatus = 'pending' | 'processing' | 'delivered' | 'failed';

export interface Order {
  id: number;
  user_id: number;
  user?: User;
  order_number: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  total: number;
  items: OrderItem[];
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  total: number;
  credentials?: any;
  supplier_order_id?: string;
  supplier_reference?: string;
}

export interface OrderCreateData {
  items: { product_id: number; quantity: number }[];
  payment_method?: string;
  notes?: string;
}

/* ── Wallet ── */
/** Maps to: App\Models\Wallet / WalletTransaction */
export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  created_at: string;
}

export interface TopUpData {
  amount: number;
  payment_method: string;
}

/* ── Blog ── */
/** Maps to: App\Models\BlogPost */
export type BlogPostStatus = 'draft' | 'in_review' | 'published' | 'scheduled' | 'archived';
export type BlogComplianceStatus = 'unchecked' | 'approved' | 'flagged' | 'rejected';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author_id: number;
  author?: User;
  status: BlogPostStatus;
  compliance_status: BlogComplianceStatus;
  image_url?: string;
  tags?: string[];
  /* SEO */
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  /* Linking */
  related_product_ids?: number[];
  related_category_id?: number;
  /* Scheduling */
  scheduled_at?: string;
  published_at?: string;
  /* Review */
  reviewed_by?: string;
  reviewed_at?: string;
  /* Internal */
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostCreateData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  status?: BlogPostStatus;
  image_url?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  related_product_ids?: number[];
  related_category_id?: number;
  scheduled_at?: string;
  compliance_status?: BlogComplianceStatus;
  internal_notes?: string;
}

export type BlogPostUpdateData = Partial<BlogPostCreateData>;

/* ── Support Tickets ── */
/** Maps to: App\Models\Ticket / TicketMessage */
export type TicketStatus = 'open' | 'pending' | 'answered' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'order_issue' | 'product_question' | 'billing' | 'account' | 'technical' | 'other';

export interface Ticket {
  id: number;
  user_id: number;
  user?: User;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  order_id?: number;
  order_number?: string;
  product_id?: number;
  product_name?: string;
  assigned_to?: number;
  assigned_user?: User;
  first_response_at?: string;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  user?: User;
  message: string;
  is_internal: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface TicketCreateData {
  subject: string;
  message: string;
  category: TicketCategory;
  priority?: TicketPriority;
  order_id?: number;
  product_id?: number;
}

/* ── Pricing Rules ── */
/** Maps to: App\Models\PricingRule */
export type PricingRuleType = 'discount' | 'tier' | 'promo';

export interface PricingRule {
  id: number;
  name: string;
  type: PricingRuleType;
  value: number;
  conditions?: Record<string, unknown>;
  active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PricingRuleCreateData {
  name: string;
  type: PricingRuleType;
  value: number;
  conditions?: Record<string, unknown>;
  active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export type PricingRuleUpdateData = Partial<PricingRuleCreateData>;

/* ── Automation ── */
/** Maps to: App\Models\AutomationRule */
export interface AutomationRule {
  id: number;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  config?: Record<string, unknown>;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationRuleCreateData {
  name: string;
  trigger: string;
  action: string;
  config?: Record<string, unknown>;
  active?: boolean;
}

export type AutomationRuleUpdateData = Partial<AutomationRuleCreateData>;

/* ── Random Post Automation ── */
export type AutomationFrequency = 'once_daily' | 'twice_daily' | 'three_daily' | 'hourly' | 'every_6h' | 'weekly';
export type AutomationJobStatus = 'completed' | 'failed' | 'skipped' | 'running' | 'queued';
export type AutomationJobType = 'random_post' | 'featured_rotation' | 'stock_suppression' | 'import_review' | 'recently_updated' | 'supplier_discovery' | 'auto_fulfillment' | 'renewal_reminder';

export type AutomationModuleId = 'random_post' | 'featured_rotation' | 'stock_suppression' | 'import_review' | 'recently_updated' | 'reseller_markup' | 'supplier_discovery' | 'auto_fulfillment' | 'renewal_reminder';

export interface AutomationModule {
  id: AutomationModuleId;
  name: string;
  description: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
  jobs_24h: number;
  failures_24h: number;
}

/** Maps to: App\Models\RandomPostConfig */
export interface RandomPostConfig {
  id: number;
  enabled: boolean;
  frequency: AutomationFrequency;
  time_slots: string[];
  timezone: string;
  channels: { telegram: boolean; discord: boolean };
  eligibility: {
    categories: number[];
    require_in_stock: boolean;
    require_approved: boolean;
    require_image: boolean;
    cooldown_days: number;
    min_price?: number;
    max_price?: number;
  };
  safety: {
    price_check_before_post: boolean;
    compliance_gate: boolean;
    skip_flagged: boolean;
  };
  created_at: string;
  updated_at: string;
}

/** Featured product rotation config */
export interface FeaturedRotationConfig {
  id: number;
  enabled: boolean;
  rotation_interval_hours: number;
  max_featured: number;
  require_in_stock: boolean;
  require_image: boolean;
  category_distribution: boolean;
  exclude_recently_unfeatured_days: number;
  notify_on_rotation: boolean;
  updated_at: string;
}

/** Stock suppression config */
export interface StockSuppressionConfig {
  id: number;
  enabled: boolean;
  auto_hide_at_zero: boolean;
  auto_disable_sync_at_zero: boolean;
  low_stock_threshold: number;
  low_stock_badge: boolean;
  notify_admin_on_low_stock: boolean;
  notify_admin_on_out_of_stock: boolean;
  auto_restore_on_restock: boolean;
  updated_at: string;
}

/** Import review queue item */
export type ImportReviewStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface ImportQueueItem {
  id: number;
  product_name: string;
  source: 'csv' | 'api' | 'manual';
  imported_by: string;
  status: ImportReviewStatus;
  field_warnings: string[];
  price?: number;
  category_name?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

/** Reseller markup preview */
export interface ResellerMarkupPreview {
  product_id: number;
  product_name: string;
  base_cost: number;
  website_price: number;
  markup_percent: number;
  margin_amount: number;
  suggested_price?: number;
}

export interface AutomationJob {
  id: number;
  type: AutomationJobType;
  status: AutomationJobStatus;
  channel?: SyncChannel;
  product_id?: number;
  product_name?: string;
  error_message?: string;
  skip_reason?: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface AutomationHealth {
  total_jobs_24h: number;
  successful_24h: number;
  failed_24h: number;
  skipped_24h: number;
  success_rate: number;
  next_scheduled_at?: string;
  last_successful_at?: string;
  is_paused: boolean;
}

export interface TestRunResult {
  product_id: number;
  product_name: string;
  channel: SyncChannel;
  preview_text: string;
  would_post: boolean;
  skip_reason?: string;
}

/* ── Integrations ── */
/** Maps to: App\Models\Integration */
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: number;
  name: string;
  provider: string;
  status: IntegrationStatus;
  config?: Record<string, unknown>;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

/* ── Sync Logs ── */
/** Maps to: App\Models\SyncLog */
export type SyncLogStatus = 'success' | 'failed' | 'partial';

export interface SyncLog {
  id: number;
  integration_id: number;
  integration?: Integration;
  action: string;
  status: SyncLogStatus;
  details?: string;
  records_processed?: number;
  created_at: string;
}

/* ── Notifications ── */
/** Maps to: Laravel\Notifications\DatabaseNotification */
export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  read_at?: string;
  created_at: string;
}

/* ── Referrals ── */
/** Maps to: App\Models\Referral */
export type ReferralStatus = 'pending' | 'credited';

export interface Referral {
  id: number;
  referrer_id: number;
  referred_id: number;
  referred_user?: User;
  commission: number;
  status: ReferralStatus;
  created_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  total_earned: number;
  commission_rate: number;
  referral_code: string;
  referral_url: string;
}

/* ── Channel Sync ── */
export type SyncChannel = 'telegram' | 'discord';
export type SyncJobStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type PriceChangeSource = 'website_admin' | 'telegram_command' | 'discord_command' | 'api' | 'batch' | 'scheduled';
export type PriceApprovalStatus = 'auto_approved' | 'pending_approval' | 'approved' | 'rejected';

export interface ChannelSyncStatus {
  product_id: number;
  product_name?: string;
  channel: SyncChannel;
  synced: boolean;
  synced_price?: number;
  website_price: number;
  mismatched: boolean;
  drift_percent?: number;
  last_synced_at?: string;
  last_error?: string;
}

export interface SyncJob {
  id: number;
  product_id: number;
  product_name: string;
  channel: SyncChannel;
  status: SyncJobStatus;
  triggered_by: 'manual' | 'auto' | 'webhook' | 'price_change' | 'command' | 'scheduled';
  trigger_source?: PriceChangeSource;
  idempotency_key?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  created_at: string;
}

export interface SyncDashboardStats {
  total_jobs_24h: number;
  completed_24h: number;
  failed_24h: number;
  queued_now: number;
  processing_now: number;
  avg_duration_ms: number;
  success_rate_percent: number;
  channels: {
    channel: SyncChannel;
    status: 'healthy' | 'degraded' | 'down';
    last_success_at?: string;
    last_failure_at?: string;
    error_rate_24h: number;
    total_synced_24h: number;
    pending_count: number;
  }[];
}

export type NotificationEventType =
  | 'ticket_created' | 'ticket_replied' | 'ticket_status_changed'
  | 'order_completed' | 'order_failed'
  | 'price_approval_needed' | 'price_approved' | 'price_rejected'
  | 'sync_failed' | 'low_stock' | 'automation_triggered';

export type NotificationDeliveryStatus = 'sent' | 'failed' | 'skipped' | 'pending';

export interface NotificationLog {
  id: number;
  event_type: NotificationEventType;
  channel: SyncChannel;
  reference_type: 'ticket' | 'order' | 'product' | 'system';
  reference_id?: number;
  reference_label?: string;
  status: NotificationDeliveryStatus;
  error_message?: string;
  message_id?: string;
  payload_preview?: string;
  created_at: string;
}

export interface PriceHistory {
  id: number;
  product_id: number;
  product_name: string;
  field: 'price' | 'compare_price';
  old_value: number;
  new_value: number;
  change_percent: number;
  source: PriceChangeSource;
  changed_by: string;
  approval_status: PriceApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  sync_triggered: boolean;
  sync_outcome?: 'success' | 'partial' | 'failed' | 'pending';
  created_at: string;
}

export interface PricingSyncSettings {
  id: number;
  auto_sync_on_price_change: boolean;
  sync_channels: SyncChannel[];
  approval_threshold_percent: number;
  require_approval_above_threshold: boolean;
  telegram_command_enabled: boolean;
  discord_command_enabled: boolean;
  notify_on_mismatch: boolean;
  mismatch_threshold_percent: number;
  batch_change_max_percent: number;
  updated_at: string;
}

export interface PriceConflict {
  id: number;
  product_id: number;
  product_name: string;
  channel: SyncChannel;
  website_price: number;
  channel_price: number;
  drift_percent: number;
  detected_at: string;
  resolved: boolean;
  resolved_action?: 'force_website' | 'accept_channel' | 'manual';
  resolved_by?: string;
  resolved_at?: string;
}

/* ── Channel Integration Configs ── */
/** Maps to: App\Models\TelegramConfig */
export interface TelegramConfig {
  id: number;
  bot_token_set: boolean;
  bot_username?: string;
  channel_id?: string;
  channel_title?: string;
  webhook_url?: string;
  auto_sync_enabled: boolean;
  post_format: 'simple' | 'detailed' | 'custom';
  include_image: boolean;
  include_price: boolean;
  include_link: boolean;
  custom_template?: string;
  admin_chat_ids: string[];
  created_at: string;
  updated_at: string;
}

export type TelegramCommandName =
  | 'price' | 'enable' | 'disable' | 'feature'
  | 'sync' | 'syncall' | 'preview' | 'status'
  | 'pause' | 'resume' | 'errors' | 'draft'
  | 'ticket' | 'alerts';

export type TelegramCommandStatus = 'executed' | 'failed' | 'rejected' | 'pending_approval';

export interface TelegramCommandPermission {
  command: TelegramCommandName;
  enabled: boolean;
  requires_approval: boolean;
  description: string;
  usage: string;
  category: 'pricing' | 'product' | 'sync' | 'support' | 'system';
}

export interface TelegramCommandLog {
  id: number;
  command: TelegramCommandName;
  raw_input: string;
  telegram_user_id: string;
  telegram_username?: string;
  status: TelegramCommandStatus;
  product_id?: number;
  product_name?: string;
  result_message?: string;
  error_message?: string;
  old_value?: string;
  new_value?: string;
  approval_status?: PriceApprovalStatus;
  created_at: string;
}

export interface TelegramAlertConfig {
  new_ticket: boolean;
  ticket_high_priority: boolean;
  order_completed: boolean;
  order_failed: boolean;
  price_approval_needed: boolean;
  sync_failed: boolean;
  low_stock: boolean;
  automation_triggered: boolean;
}

/** Maps to: App\Models\DiscordConfig */
export interface DiscordConfig {
  id: number;
  webhook_url_set: boolean;
  bot_token_set: boolean;
  server_name?: string;
  server_id?: string;
  alert_webhook_url_set: boolean;
  channel_mappings: DiscordChannelMapping[];
  auto_sync_enabled: boolean;
  post_format: 'embed' | 'plain' | 'custom';
  include_image: boolean;
  include_price: boolean;
  embed_color?: string;
  admin_role_ids: string[];
  blog_auto_post: boolean;
  product_new_auto_post: boolean;
  product_update_auto_post: boolean;
  product_random_auto_post: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscordChannelMapping {
  id: number;
  category_id: number;
  category_name: string;
  discord_channel_id: string;
  discord_channel_name: string;
  enabled: boolean;
}

export type DiscordCommandName =
  | 'price' | 'enable' | 'disable' | 'feature'
  | 'sync' | 'syncall' | 'preview' | 'status'
  | 'pause' | 'resume' | 'errors' | 'draft'
  | 'ticket' | 'alerts';

export type DiscordCommandStatus = 'executed' | 'failed' | 'rejected' | 'pending_approval';

export interface DiscordCommandPermission {
  command: DiscordCommandName;
  enabled: boolean;
  requires_approval: boolean;
  description: string;
  usage: string;
  category: 'pricing' | 'product' | 'sync' | 'support' | 'system';
}

export interface DiscordCommandLog {
  id: number;
  command: DiscordCommandName;
  raw_input: string;
  discord_user_id: string;
  discord_username?: string;
  status: DiscordCommandStatus;
  product_id?: number;
  product_name?: string;
  result_message?: string;
  error_message?: string;
  old_value?: string;
  new_value?: string;
  approval_status?: PriceApprovalStatus;
  created_at: string;
}

export interface DiscordAlertConfig {
  new_ticket: boolean;
  ticket_high_priority: boolean;
  order_completed: boolean;
  order_failed: boolean;
  price_approval_needed: boolean;
  sync_failed: boolean;
  low_stock: boolean;
  automation_triggered: boolean;
}

export type ChannelPostStatus = 'sent' | 'failed' | 'pending' | 'skipped';

export interface ChannelPost {
  id: number;
  product_id: number;
  product_name: string;
  channel: SyncChannel;
  action: 'create' | 'update' | 'delete';
  status: ChannelPostStatus;
  message_id?: string;
  error_message?: string;
  posted_at?: string;
  created_at: string;
}

export interface ChannelPostPreview {
  product_id: number;
  product_name: string;
  channel: SyncChannel;
  preview_text: string;
  preview_image?: string;
  price: number;
  compare_price?: number;
  link: string;
}

/** Maps to: App\Models\PinterestConfig */
export interface PinterestConfig {
  id: number;
  config: {
    client_id?: string;
    client_secret_set?: boolean;
    access_token_set?: boolean;
    board_id?: string;
    auto_post_enabled: boolean;
  };
  boards: PinterestBoard[];
  status: 'active' | 'disconnected' | 'error';
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
}

/** Maps to: App\Models\ChannelPost for Pinterest */
export interface PinterestPostHistory {
  id: number;
  product_id?: number;
  product_name?: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  pin_id?: string;
  posted_at?: string;
  created_at: string;
}

/* ── Compliance Review ── */
/** Maps to: App\Models\ComplianceReview */
export type ComplianceReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ComplianceItemType = 'product' | 'blog';

export interface ComplianceReview {
  id: number;
  item_type: ComplianceItemType;
  item_id: number;
  item_title: string;
  author: string;
  status: ComplianceReviewStatus;
  reason?: string;
  moderation_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceReviewAction {
  action: 'approve' | 'reject' | 'flag';
  moderation_notes?: string;
  reason?: string;
}

export interface ComplianceStats {
  pending_review: number;
  flagged: number;
  approved: number;
  rejected: number;
}

/* ── Audit Logs ── */
/** Maps to: App\Models\AuditLog (via spatie/laravel-activitylog or custom) */
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'bulk_action';

export interface AuditLog {
  id: number;
  user_id: number;
  user?: User;
  action: AuditAction;
  resource_type: string;
  resource_id?: number;
  description: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/* ── Admin Settings ── */
/** Maps to: App\Models\Setting (key-value store) */
export interface AdminSettings {
  site_name: string;
  site_tagline?: string;
  support_email: string;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  wallet_enabled: boolean;
  referral_commission_rate: number;
}

/* ── Notification Preferences ── */
export interface NotificationPreferences {
  order_updates: boolean;
  promotions: boolean;
  security_alerts: boolean;
  newsletter: boolean;
}

/* ── Supplier Import ── */
export type SupplierStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface SupplierConnection {
  id: number;
  name: string;
  provider: string;
  status: SupplierStatus;
  last_synced_at?: string;
  products_available: number;
  api_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: number;
  external_id: string;
  name: string;
  description: string;
  supplier_price: number;
  supplier_currency: string;
  category_name?: string;
  subcategory_name?: string;
  image_url?: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'limited';
  attributes: Record<string, string>;
  duplicate_of?: number;
  duplicate_confidence?: number;
}

export interface ImportAdjustment {
  product_id: string;
  custom_name?: string;
  custom_description?: string;
  reseller_price: number;
  markup_type: 'fixed' | 'percentage';
  markup_value: number;
  category_id?: number;
  status?: string;
  compliance_status?: string;
  publish_now: boolean;
}

export interface SupplierImportJob {
  id: number;
  supplier_id: number;
  supplier_name: string;
  products_fetched: number;
  products_imported: number;
  products_skipped: number;
  duplicates_found: number;
  errors: number;
  status: 'completed' | 'failed' | 'running' | 'queued';
  error_details?: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface DuplicateMatch {
  supplier_product: SupplierProduct;
  existing_product_id: number;
  existing_product_name: string;
  confidence: number;
  match_type: 'exact_name' | 'similar_name' | 'sku_match';
}

/* ── Navigation ── */
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
  children?: NavItem[];
}
