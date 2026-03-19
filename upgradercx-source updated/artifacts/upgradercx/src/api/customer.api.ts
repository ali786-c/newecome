import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { User, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_CUSTOMERS: User[] = [
  { id: 2, name: 'Jane Customer', email: 'jane@example.com', role: 'customer', created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z' },
  { id: 3, name: 'Bob Buyer', email: 'bob@example.com', role: 'customer', created_at: '2025-02-15T00:00:00Z', updated_at: '2025-02-15T00:00:00Z' },
];

export const customerApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<User>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_CUSTOMERS, params));
    const res = await client.get('/customers', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<User>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CUSTOMERS.find((c) => c.id === id) || MOCK_CUSTOMERS[0] });
    const res = await client.get(`/customers/${id}`);
    return res.data;
  },
  async update(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CUSTOMERS[0], ...data, id } as User });
    const res = await client.put(`/customers/${id}`, data);
    return res.data;
  },
};
