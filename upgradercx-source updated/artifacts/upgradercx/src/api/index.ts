// ==========================================
// Centralised API Barrel Export
// ==========================================
// Import any API service from '@/api' for clean imports.
// Each service file documents the expected Laravel routes.

export { authApi } from './auth.api';
export { productApi } from './product.api';
export { categoryApi } from './category.api';
export { pricingApi } from './pricing.api';
export { orderApi } from './order.api';
export { walletApi } from './wallet.api';
export { blogApi } from './blog.api';
export { automationApi } from './automation.api';
export { integrationApi } from './integration.api';
export { syncLogApi } from './sync-log.api';
export { customerApi } from './customer.api';
export { supportApi } from './support.api';
export { channelSyncApi } from './channel-sync.api';
export { telegramApi } from './telegram.api';
export { discordApi } from './discord.api';
export { complianceApi } from './compliance.api';
export { auditLogApi } from './audit-log.api';
export { notificationApi } from './notification.api';
export { referralApi } from './referral.api';
export { adminSettingsApi } from './admin-settings.api';
export { ticketWebhookApi } from './ticket-webhook.api';
export { pricingSyncApi } from './pricing-sync.api';

// Re-export client utilities for use across the app
export { client, fetchCsrfCookie, USE_MOCK, parseValidationErrors, getErrorMessage } from './client';
