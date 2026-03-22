import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  Product, ProductCreateData, ProductUpdateData, ProductBulkActionData,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

const CATEGORIES = ['Software Licenses', 'Account Upgrades', 'Digital Tools'];
const TAGS_POOL = ['premium', 'popular', 'new', 'sale', 'bundle', 'enterprise'];

const MOCK_PRODUCTS: Product[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: ['Office 365 Business', 'Adobe CC License', 'VPN Premium 1yr', 'Dev Tools Pro', 'Cloud Storage 1TB', 'SEO Toolkit', 'Email Marketing Suite', 'CRM Professional', 'Antivirus Premium', 'Backup Pro', 'SSL Certificate', 'Domain Privacy'][i % 12] + (i >= 12 ? ' v2' : ''),
  slug: `product-${i + 1}`,
  description: `Full description for product ${i + 1}. This is a comprehensive digital service offering.`,
  short_description: `Quick overview of product ${i + 1}`,
  price: parseFloat((9.99 + i * 5).toFixed(2)),
  compare_price: i % 3 === 0 ? parseFloat((14.99 + i * 5).toFixed(2)) : undefined,
  discount_label: i % 3 === 0 ? `${Math.round((1 - (9.99 + i * 5) / (14.99 + i * 5)) * 100)}% OFF` : undefined,
  category_id: (i % 3) + 1,
  category: { id: (i % 3) + 1, name: CATEGORIES[i % 3], slug: CATEGORIES[i % 3].toLowerCase().replace(/ /g, '-'), created_at: '', updated_at: '' },
  tags: [TAGS_POOL[i % 6], TAGS_POOL[(i + 2) % 6]],
  status: i % 5 === 4 ? 'draft' : i % 7 === 6 ? 'archived' : 'active',
  stock_status: i % 8 === 7 ? 'out_of_stock' : i % 6 === 5 ? 'limited' : 'in_stock',
  image_url: undefined,
  gallery: [],
  telegram_enabled: i % 2 === 0,
  discord_enabled: i % 3 === 0,
  random_post_eligible: i % 4 === 0,
  compliance_status: i % 10 === 9 ? 'flagged' : i % 8 === 7 ? 'pending_review' : 'approved',
  internal_notes: i % 3 === 0 ? 'Reviewed by admin. Ready for distribution.' : undefined,
  created_at: new Date(2025, 0, 1 + i).toISOString(),
  updated_at: new Date(2025, 2, 1 + i).toISOString(),
}));

export const productApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<Product>> {
    const res = await client.get('/products', { params });
    return res.data;
  },

  async get(id: number): Promise<ApiResponse<Product>> {
    const res = await client.get(`/products/${id}`);
    return res.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    const res = await client.get(`/products/slug/${slug}`);
    return res.data;
  },
  async create(data: ProductCreateData): Promise<ApiResponse<Product>> {
    const res = await client.post('/admin/products', data);
    return res.data;
  },
  async update(id: number, data: ProductUpdateData): Promise<ApiResponse<Product>> {
    const res = await client.put(`/admin/products/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await client.delete(`/admin/products/${id}`);
  },
  async duplicate(id: number): Promise<ApiResponse<Product>> {
    const res = await client.post(`/admin/products/${id}/duplicate`);
    return res.data;
  },
  async bulkAction(data: ProductBulkActionData): Promise<ApiResponse<{ affected: number }>> {
    const res = await client.post('/admin/products/bulk', data);
    return res.data;
  },
  async sendToDiscord(id: number): Promise<ApiResponse<any>> {
    const res = await client.post(`/admin/products/${id}/discord`);
    return res.data;
  },
};
