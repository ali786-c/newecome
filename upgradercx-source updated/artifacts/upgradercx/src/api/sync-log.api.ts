import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { SyncLog, PaginatedResponse, ListParams } from '@/types';

const MOCK_LOGS: SyncLog[] = [
  { id: 1, integration_id: 3, action: 'sync_payments', status: 'success', details: 'Synced 24 payment records', records_processed: 24, created_at: '2025-03-10T08:00:00Z' },
  { id: 2, integration_id: 1, action: 'sync_notifications', status: 'failed', details: 'Connection timeout', records_processed: 0, created_at: '2025-03-09T12:00:00Z' },
];

export const syncLogApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<SyncLog>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_LOGS, params));
    const res = await client.get('/sync-logs', { params });
    return res.data;
  },
  async get(id: number): Promise<SyncLog> {
    if (USE_MOCK) return mockDelay(MOCK_LOGS.find((l) => l.id === id) || MOCK_LOGS[0]);
    const res = await client.get(`/sync-logs/${id}`);
    return res.data;
  },
};
