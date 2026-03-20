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
    if (USE_MOCK) {
      let filtered = [...MOCK_PRODUCTS];
      if (params?.search) {
        const s = String(params.search).toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(s) || p.slug.includes(s));
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((p) => p.status === params.status);
      }
      if (params?.category_id) {
        filtered = filtered.filter((p) => p.category_id === Number(params.category_id));
      }
      if (params?.sort_by) {
        const dir = params.sort_dir === 'desc' ? -1 : 1;
        filtered.sort((a, b) => {
          const av = (a as any)[params.sort_by as string];
          const bv = (b as any)[params.sort_by as string];
          return av > bv ? dir : av < bv ? -dir : 0;
        });
      }
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/products', { params });
    return res.data;
  },

  async get(id: number): Promise<ApiResponse<Product>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0] });
    const res = await client.get(`/admin/products/${id}`);
    return res.data;
  },

  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0] });
    const res = await client.get(`/admin/products/slug/${slug}`);
    return res.data;
  },

  async create(data: ProductCreateData): Promise<ApiResponse<Product>> {
    if (USE_MOCK) {
      const newProduct: Product = {
        id: Date.now(),
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        short_description: data.short_description,
        price: data.price,
        compare_price: data.compare_price,
        discount_label: data.discount_label,
        category_id: data.category_id,
        tags: data.tags || [],
        status: data.status || 'draft',
        stock_status: data.stock_status || 'in_stock',
        image_url: data.image_url,
        telegram_enabled: data.telegram_enabled ?? false,
        discord_enabled: data.discord_enabled ?? false,
        random_post_eligible: data.random_post_eligible ?? false,
        compliance_status: data.compliance_status || 'pending_review',
        internal_notes: data.internal_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return mockDelay({ data: newProduct });
    }
    const res = await client.post('/admin/products', data);
    return res.data;
  },

  async update(id: number, data: ProductUpdateData): Promise<ApiResponse<Product>> {
    if (USE_MOCK) {
      const existing = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
      return mockDelay({ data: { ...existing, ...data, id, updated_at: new Date().toISOString() } as Product });
    }
    const res = await client.put(`/admin/products/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    if (USE_MOCK) return mockDelay(undefined);
    await client.delete(`/admin/products/${id}`);
  },

  async duplicate(id: number): Promise<ApiResponse<Product>> {
    if (USE_MOCK) {
      const source = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
      return mockDelay({ data: { ...source, id: Date.now(), name: `${source.name} (Copy)`, slug: `${source.slug}-copy`, status: 'draft' as const, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
    }
    const res = await client.post(`/admin/products/${id}/duplicate`);
    return res.data;
  },

  async bulkAction(data: ProductBulkActionData): Promise<ApiResponse<{ affected: number }>> {
    if (USE_MOCK) return mockDelay({ data: { affected: data.ids.length } });
    const res = await client.post('/admin/products/bulk', data);
    return res.data;
  },
};
