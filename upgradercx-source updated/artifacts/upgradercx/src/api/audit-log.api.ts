/**
 * Audit Log API
 *
 * Laravel routes (suggested):
 *   GET /api/audit-logs → AuditLogController@index
 *   GET /api/audit-logs/{id} → AuditLogController@show
 *
 * Consider using spatie/laravel-activitylog for automatic model logging.
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { AuditLog, PaginatedResponse, ListParams } from '@/types';

const MOCK_LOGS: AuditLog[] = [
  { id: 1, user_id: 1, action: 'create', resource_type: 'Product', resource_id: 24, description: 'Created product "SSL Certificate v2"', ip_address: '192.168.1.1', created_at: '2025-03-14T10:00:00Z' },
  { id: 2, user_id: 1, action: 'update', resource_type: 'Product', resource_id: 1, description: 'Updated pricing for "Office 365 Business"', old_values: { price: 24.99 }, new_values: { price: 22.99 }, ip_address: '192.168.1.1', created_at: '2025-03-13T14:30:00Z' },
  { id: 3, user_id: 1, action: 'login', resource_type: 'Auth', description: 'Admin login', ip_address: '192.168.1.1', user_agent: 'Chrome/120', created_at: '2025-03-13T09:00:00Z' },
  { id: 4, user_id: 1, action: 'delete', resource_type: 'BlogPost', resource_id: 10, description: 'Deleted blog post "Outdated Promo"', ip_address: '192.168.1.1', created_at: '2025-03-12T16:00:00Z' },
  { id: 5, user_id: 1, action: 'bulk_action', resource_type: 'Product', description: 'Archived 3 products', ip_address: '192.168.1.1', created_at: '2025-03-11T11:00:00Z' },
];

export const auditLogApi = {
  /** GET /api/audit-logs */
  async list(params?: ListParams): Promise<PaginatedResponse<AuditLog>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_LOGS];
      if (params?.action) filtered = filtered.filter((l) => l.action === params.action);
      if (params?.resource_type) filtered = filtered.filter((l) => l.resource_type === params.resource_type);
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter((l) => l.description.toLowerCase().includes(q));
      }
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/audit-logs', { params });
    return res.data;
  },

  /** GET /api/audit-logs/{id} */
  async get(id: number): Promise<AuditLog> {
    if (USE_MOCK) return mockDelay(MOCK_LOGS.find((l) => l.id === id) || MOCK_LOGS[0]);
    const res = await client.get(`/audit-logs/${id}`);
    return res.data;
  },
};
