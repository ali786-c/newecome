import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { PricingRule, PricingRuleCreateData, PricingRuleUpdateData, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_RULES: PricingRule[] = [
  { id: 1, name: '10% Early Bird', type: 'discount', value: 10, active: true, starts_at: '2025-01-01', ends_at: '2025-12-31', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Bulk Tier', type: 'tier', value: 15, active: true, conditions: { min_quantity: 10 }, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

export const pricingApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<PricingRule>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_RULES, params));
    const res = await client.get('/pricing-rules', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<PricingRule>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_RULES.find((r) => r.id === id) || MOCK_RULES[0] });
    const res = await client.get(`/pricing-rules/${id}`);
    return res.data;
  },
  async create(data: PricingRuleCreateData): Promise<ApiResponse<PricingRule>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_RULES[0], ...data, id: 99 } });
    const res = await client.post('/pricing-rules', data);
    return res.data;
  },
  async update(id: number, data: PricingRuleUpdateData): Promise<ApiResponse<PricingRule>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_RULES[0], ...data, id } });
    const res = await client.put(`/pricing-rules/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    if (USE_MOCK) return mockDelay(undefined);
    await client.delete(`/pricing-rules/${id}`);
  },
};
