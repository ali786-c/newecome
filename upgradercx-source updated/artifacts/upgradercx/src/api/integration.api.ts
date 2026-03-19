import { client, USE_MOCK, mockDelay } from './client';
import type { Integration, ApiResponse } from '@/types';

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 1, name: 'Telegram', provider: 'telegram', status: 'disconnected', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Discord', provider: 'discord', status: 'disconnected', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Stripe', provider: 'stripe', status: 'disconnected', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

export const integrationApi = {
  async list(): Promise<ApiResponse<Integration[]>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_INTEGRATIONS });
    const res = await client.get('/integrations');
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<Integration>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_INTEGRATIONS.find((i) => i.id === id) || MOCK_INTEGRATIONS[0] });
    const res = await client.get(`/integrations/${id}`);
    return res.data;
  },
  async connect(id: number, config?: Record<string, unknown>): Promise<ApiResponse<Integration>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_INTEGRATIONS[0], id, status: 'connected' as const } });
    const res = await client.post(`/integrations/${id}/connect`, config);
    return res.data;
  },
  async disconnect(id: number): Promise<ApiResponse<Integration>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_INTEGRATIONS[0], id, status: 'disconnected' as const } });
    const res = await client.post(`/integrations/${id}/disconnect`);
    return res.data;
  },
};
