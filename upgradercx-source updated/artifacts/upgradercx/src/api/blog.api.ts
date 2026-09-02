import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { BlogPost, BlogPostCreateData, BlogPostUpdateData, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_POSTS: BlogPost[] = [
  {
    id: 1, title: 'Getting Started with UpgraderCX', slug: 'getting-started',
    excerpt: 'Learn how to set up your account and start buying digital products.',
    content: '<h2>Welcome</h2><p>UpgraderCX makes it easy to purchase digital products securely.</p><p>In this guide we cover account setup, wallet funding, and your first purchase.</p>',
    author_id: 1, status: 'published', compliance_status: 'approved',
    meta_title: 'Getting Started with UpgraderCX | Digital Products Platform',
    meta_description: 'Complete guide to setting up your UpgraderCX account and making your first purchase.',
    tags: ['guide', 'onboarding'],
    related_product_ids: [1, 2],
    published_at: '2025-03-10T00:00:00Z',
    created_at: '2025-03-08T00:00:00Z', updated_at: '2025-03-10T00:00:00Z',
  },
  {
    id: 2, title: 'Our Security Commitment', slug: 'security-update',
    excerpt: 'How we protect your data and transactions.',
    content: '<h2>Security First</h2><p>We take security seriously with end-to-end encryption and fraud detection.</p>',
    author_id: 1, status: 'published', compliance_status: 'approved',
    meta_title: 'Security at UpgraderCX | Your Data Protection',
    meta_description: 'Learn about our multi-layered security approach protecting your purchases.',
    tags: ['security', 'trust'],
    published_at: '2025-03-05T00:00:00Z',
    created_at: '2025-03-03T00:00:00Z', updated_at: '2025-03-05T00:00:00Z',
  },
  {
    id: 3, title: 'New Products Launch', slug: 'new-products',
    excerpt: 'Exciting new services available on the platform.',
    content: '<h2>Fresh Additions</h2><p>We have added 15 new products across three categories.</p>',
    author_id: 1, status: 'published', compliance_status: 'approved',
    tags: ['products', 'announcement'],
    related_category_id: 1,
    published_at: '2025-02-28T00:00:00Z',
    created_at: '2025-02-26T00:00:00Z', updated_at: '2025-02-28T00:00:00Z',
  },
  {
    id: 4, title: 'Spring Sale Announcement', slug: 'spring-sale',
    excerpt: 'Get up to 40% off on selected digital products.',
    content: '<h2>Spring Sale</h2><p>Our biggest sale of the year is here. Selected products are up to 40% off.</p>',
    author_id: 1, status: 'scheduled', compliance_status: 'approved',
    meta_title: 'Spring Sale - Up to 40% Off | UpgraderCX',
    meta_description: 'Save big on digital products during our spring sale event.',
    tags: ['sale', 'promotion'],
    scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    related_product_ids: [1, 3, 5],
    created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 5, title: 'Affiliate Program Details', slug: 'affiliate-program',
    excerpt: 'Join our affiliate program and earn commissions.',
    content: '<p>Draft content about the affiliate program...</p>',
    author_id: 1, status: 'draft', compliance_status: 'unchecked',
    tags: ['affiliates'],
    internal_notes: 'Needs legal review before publishing',
    created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 6, title: 'VPN Comparison Guide', slug: 'vpn-comparison',
    excerpt: 'Comparing VPN services we offer.',
    content: '<p>In-depth comparison of VPN products.</p>',
    author_id: 1, status: 'in_review', compliance_status: 'flagged',
    tags: ['vpn', 'guide'],
    related_product_ids: [3],
    reviewed_by: 'Admin User',
    reviewed_at: new Date(Date.now() - 43200000).toISOString(),
    internal_notes: 'Compliance flagged: verify affiliate claims are accurate',
    created_at: new Date(Date.now() - 259200000).toISOString(), updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const blogApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<BlogPost>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_POSTS];
      if (params?.status) filtered = filtered.filter((p) => p.status === params.status);
      if (params?.search) {
        const q = (params.search as string).toLowerCase();
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q));
      }
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/blog', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_POSTS.find((p) => p.id === id) || MOCK_POSTS[0] });
    const res = await client.get(`/blog/${id}`);
    return res.data;
  },
  async getBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_POSTS.find((p) => p.slug === slug) || MOCK_POSTS[0] });
    const res = await client.get(`/blog/${slug}`);
    return res.data;
  },
  async create(data: BlogPostCreateData): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], ...data, id: Date.now(), compliance_status: 'unchecked' as const, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as BlogPost });
    const res = await client.post('/blog', data);
    return res.data;
  },
  async update(id: number, data: BlogPostUpdateData): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], ...data, id, updated_at: new Date().toISOString() } as BlogPost });
    const res = await client.put(`/blog/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    if (USE_MOCK) return mockDelay(undefined);
    await client.delete(`/blog/${id}`);
  },
  async submitForReview(id: number): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id, status: 'in_review' as const } as BlogPost });
    const res = await client.post(`/blog/${id}/review`);
    return res.data;
  },
  async approve(id: number): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id, compliance_status: 'approved' as const } as BlogPost });
    const res = await client.post(`/blog/${id}/approve`);
    return res.data;
  },
  async schedule(id: number, scheduledAt: string): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id, status: 'scheduled' as const, scheduled_at: scheduledAt } as BlogPost });
    const res = await client.post(`/blog/${id}/schedule`, { scheduled_at: scheduledAt });
    return res.data;
  },
  async publish(id: number): Promise<ApiResponse<BlogPost>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_POSTS[0], id, status: 'published' as const, published_at: new Date().toISOString() } as BlogPost });
    const res = await client.post(`/blog/${id}/publish`);
    return res.data;
  },
};
