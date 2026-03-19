import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { Order, OrderCreateData, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_ORDERS: Order[] = [
  { id: 1, user_id: 1, order_number: 'ORD-00001', status: 'completed', total: 29.99, items: [{ id: 1, order_id: 1, product_id: 1, quantity: 1, unit_price: 29.99, total: 29.99 }], payment_method: 'wallet', created_at: '2025-03-01T10:00:00Z', updated_at: '2025-03-01T10:05:00Z' },
  { id: 2, user_id: 1, order_number: 'ORD-00002', status: 'pending', total: 49.99, items: [{ id: 2, order_id: 2, product_id: 3, quantity: 1, unit_price: 49.99, total: 49.99 }], payment_method: 'wallet', created_at: '2025-03-10T14:00:00Z', updated_at: '2025-03-10T14:00:00Z' },
];

export const orderApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<Order>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_ORDERS, params));
    const res = await client.get('/orders', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<Order>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0] });
    const res = await client.get(`/orders/${id}`);
    return res.data;
  },
  async create(data: OrderCreateData): Promise<ApiResponse<Order>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_ORDERS[0], ...data, id: 99, order_number: 'ORD-99999' } as Order });
    const res = await client.post('/orders', data);
    return res.data;
  },
  async updateStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_ORDERS[0], id, status } as Order });
    const res = await client.patch(`/orders/${id}/status`, { status });
    return res.data;
  },
};
