/**
 * Ticket Webhook / Notification Dispatch API
 *
 * Laravel routes (suggested):
 *   GET    /api/admin/webhooks/ticket-config   → WebhookController@ticketConfig
 *   PUT    /api/admin/webhooks/ticket-config   → WebhookController@updateTicketConfig
 *   POST   /api/admin/webhooks/ticket-test     → WebhookController@testTicketNotification
 *   GET    /api/admin/webhooks/dispatch-log     → WebhookController@dispatchLog
 *   POST   /api/admin/webhooks/ticket-discord-url → WebhookController@setDiscordUrl
 *
 * These endpoints configure automatic notifications when tickets are created/updated.
 * The Laravel backend dispatches webhooks to Discord/Telegram on ticket events.
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { ApiResponse, PaginatedResponse, ListParams } from '@/types';

/* ── Types ── */
export interface TicketWebhookConfig {
  id: number;
  telegram_enabled: boolean;
  telegram_chat_id?: string;
  discord_enabled: boolean;
  discord_webhook_url_set: boolean;
  notify_on_create: boolean;
  notify_on_reply: boolean;
  notify_on_staff_reply: boolean;
  notify_on_status_change: boolean;
  notify_on_close: boolean;
  notify_high_priority_only: boolean;
  include_message_preview: boolean;
  created_at: string;
  updated_at: string;
}

export type TicketWebhookEvent =
  | 'ticket.created'
  | 'ticket.replied'
  | 'ticket.staff_replied'
  | 'ticket.status_changed'
  | 'ticket.closed'
  | 'ticket.escalated';

export interface WebhookDispatchLog {
  id: number;
  event: TicketWebhookEvent;
  channel: 'telegram' | 'discord';
  ticket_id: number;
  ticket_subject: string;
  status: 'sent' | 'failed';
  error_message?: string;
  created_at: string;
}

/* ── Mock Data ── */
const MOCK_CONFIG: TicketWebhookConfig = {
  id: 1,
  telegram_enabled: true,
  telegram_chat_id: '-1001234567890',
  discord_enabled: true,
  discord_webhook_url_set: true,
  notify_on_create: true,
  notify_on_reply: true,
  notify_on_staff_reply: true,
  notify_on_status_change: true,
  notify_on_close: false,
  notify_high_priority_only: false,
  include_message_preview: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

const MOCK_DISPATCH_LOG: WebhookDispatchLog[] = [
  { id: 1, event: 'ticket.created', channel: 'telegram', ticket_id: 1, ticket_subject: 'Order not delivered', status: 'sent', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, event: 'ticket.created', channel: 'discord', ticket_id: 1, ticket_subject: 'Order not delivered', status: 'sent', created_at: new Date(Date.now() - 3595000).toISOString() },
  { id: 3, event: 'ticket.replied', channel: 'telegram', ticket_id: 1, ticket_subject: 'Order not delivered', status: 'failed', error_message: 'Bot token expired', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 4, event: 'ticket.created', channel: 'discord', ticket_id: 2, ticket_subject: 'Refund request for VPN Premium', status: 'sent', created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 5, event: 'ticket.staff_replied', channel: 'telegram', ticket_id: 2, ticket_subject: 'Refund request for VPN Premium', status: 'sent', created_at: new Date(Date.now() - 850000).toISOString() },
  { id: 6, event: 'ticket.status_changed', channel: 'discord', ticket_id: 2, ticket_subject: 'Refund request for VPN Premium', status: 'sent', created_at: new Date(Date.now() - 800000).toISOString() },
  { id: 7, event: 'ticket.escalated', channel: 'telegram', ticket_id: 3, ticket_subject: 'Cannot activate Office 365 key', status: 'sent', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 8, event: 'ticket.closed', channel: 'discord', ticket_id: 5, ticket_subject: 'Website loading very slowly', status: 'sent', created_at: new Date(Date.now() - 120000).toISOString() },
];

export const ticketWebhookApi = {
  async getConfig(): Promise<ApiResponse<TicketWebhookConfig>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CONFIG });
    const res = await client.get('/admin/webhooks/ticket-config');
    return res.data;
  },

  async updateConfig(data: Partial<TicketWebhookConfig>): Promise<ApiResponse<TicketWebhookConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, ...data, updated_at: new Date().toISOString() } });
    const res = await client.put('/admin/webhooks/ticket-config', data);
    return res.data;
  },

  async testNotification(channel: 'telegram' | 'discord'): Promise<ApiResponse<{ success: boolean; message: string }>> {
    if (USE_MOCK) return mockDelay({ data: { success: true, message: `Test notification sent to ${channel}` } });
    const res = await client.post('/admin/webhooks/ticket-test', { channel });
    return res.data;
  },

  async getDispatchLog(params?: ListParams): Promise<PaginatedResponse<WebhookDispatchLog>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_DISPATCH_LOG, params));
    const res = await client.get('/admin/webhooks/dispatch-log', { params });
    return res.data;
  },

  async setDiscordWebhook(url: string): Promise<ApiResponse<TicketWebhookConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, discord_webhook_url_set: true } });
    const res = await client.post('/admin/webhooks/ticket-discord-url', { webhook_url: url });
    return res.data;
  },
};
