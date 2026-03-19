/**
 * Notification API
 *
 * Laravel routes (suggested):
 *   GET    /api/notifications           → NotificationController@index
 *   POST   /api/notifications/{id}/read → NotificationController@markAsRead
 *   POST   /api/notifications/read-all  → NotificationController@markAllAsRead
 *   GET    /api/notifications/preferences → NotificationController@preferences
 *   PUT    /api/notifications/preferences → NotificationController@updatePreferences
 *
 * Uses Laravel's built-in DatabaseNotification system.
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { AppNotification, NotificationPreferences, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 1, type: 'order', title: 'Order Completed', body: 'Your order ORD-00001 has been delivered.', read_at: '2025-03-01T12:00:00Z', created_at: '2025-03-01T10:05:00Z' },
  { id: 2, type: 'wallet', title: 'Top-Up Successful', body: '$55.49 has been added to your wallet.', created_at: '2025-03-05T12:00:00Z' },
  { id: 3, type: 'security', title: 'New Login Detected', body: 'A new login from Chrome on Windows was detected.', created_at: '2025-03-10T09:00:00Z' },
  { id: 4, type: 'promo', title: 'Spring Sale is Live!', body: 'Get up to 40% off selected products.', created_at: '2025-03-12T08:00:00Z' },
];

const MOCK_PREFS: NotificationPreferences = {
  order_updates: true,
  promotions: true,
  security_alerts: true,
  newsletter: false,
};

export const notificationApi = {
  /** GET /api/notifications */
  async list(params?: ListParams): Promise<PaginatedResponse<AppNotification>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_NOTIFICATIONS, params));
    const res = await client.get('/notifications', { params });
    return res.data;
  },

  /** POST /api/notifications/{id}/read */
  async markAsRead(id: number): Promise<ApiResponse<AppNotification>> {
    if (USE_MOCK) {
      const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id) || MOCK_NOTIFICATIONS[0];
      return mockDelay({ data: { ...notif, read_at: new Date().toISOString() } });
    }
    const res = await client.post(`/notifications/${id}/read`);
    return res.data;
  },

  /** POST /api/notifications/read-all */
  async markAllAsRead(): Promise<ApiResponse<{ updated: number }>> {
    if (USE_MOCK) return mockDelay({ data: { updated: MOCK_NOTIFICATIONS.filter((n) => !n.read_at).length } });
    const res = await client.post('/notifications/read-all');
    return res.data;
  },

  /** GET /api/notifications/preferences */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_PREFS });
    const res = await client.get('/notifications/preferences');
    return res.data;
  },

  /** PUT /api/notifications/preferences */
  async updatePreferences(data: NotificationPreferences): Promise<ApiResponse<NotificationPreferences>> {
    if (USE_MOCK) return mockDelay({ data });
    const res = await client.put('/notifications/preferences', data);
    return res.data;
  },
};
