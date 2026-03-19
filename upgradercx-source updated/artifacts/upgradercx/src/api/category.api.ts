import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { Category, CategoryCreateData, CategoryUpdateData, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Software Licenses', slug: 'software-licenses', description: 'Premium software keys and subscriptions.', products_count: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 2, name: 'Account Upgrades', slug: 'account-upgrades', description: 'Service and account upgrade packages.', products_count: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  { id: 3, name: 'Digital Tools', slug: 'digital-tools', description: 'Productivity and development tools.', products_count: 4, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
];

export const categoryApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<Category>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_CATEGORIES, params));
    const res = await client.get('/categories', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<Category>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CATEGORIES.find((c) => c.id === id) || MOCK_CATEGORIES[0] });
    const res = await client.get(`/categories/${id}`);
    return res.data;
  },
  async getBySlug(slug: string): Promise<ApiResponse<Category>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CATEGORIES.find((c) => c.slug === slug) || MOCK_CATEGORIES[0] });
    const res = await client.get(`/categories/slug/${slug}`);
    return res.data;
  },
  async create(data: CategoryCreateData): Promise<ApiResponse<Category>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CATEGORIES[0], ...data, id: 99 } });
    const res = await client.post('/categories', data);
    return res.data;
  },
  async update(id: number, data: CategoryUpdateData): Promise<ApiResponse<Category>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CATEGORIES[0], ...data, id } });
    const res = await client.put(`/categories/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    if (USE_MOCK) return mockDelay(undefined);
    await client.delete(`/categories/${id}`);
  },
};
