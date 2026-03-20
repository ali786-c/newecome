/**
 * Compliance Review API
 *
 * Laravel routes (suggested):
 *   GET    /api/compliance/reviews       → ComplianceReviewController@index
 *   GET    /api/compliance/reviews/{id}  → ComplianceReviewController@show
 *   POST   /api/compliance/reviews/{id}/action → ComplianceReviewController@action
 *   GET    /api/compliance/stats         → ComplianceReviewController@stats
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type {
  ComplianceReview, ComplianceReviewAction, ComplianceStats,
  ApiResponse, PaginatedResponse, ListParams,
} from '@/types';

const MOCK_REVIEWS: ComplianceReview[] = [
  { id: 1, item_type: 'product', item_id: 1, item_title: 'Netflix Premium 1 Month', author: 'Admin', status: 'pending', submitted_at: '2025-03-12T00:00:00Z', created_at: '2025-03-12T00:00:00Z', updated_at: '2025-03-12T00:00:00Z' },
  { id: 2, item_type: 'product', item_id: 2, item_title: 'Spotify Family Plan', author: 'Admin', status: 'approved', moderation_notes: 'Verified supplier.', reviewed_by: 'Admin User', reviewed_at: '2025-03-10T00:00:00Z', submitted_at: '2025-03-09T00:00:00Z', created_at: '2025-03-09T00:00:00Z', updated_at: '2025-03-10T00:00:00Z' },
  { id: 3, item_type: 'blog', item_id: 6, item_title: 'VPN Comparison Guide', author: 'Content Team', status: 'flagged', reason: 'Contains unverified affiliate claims.', submitted_at: '2025-03-11T00:00:00Z', created_at: '2025-03-11T00:00:00Z', updated_at: '2025-03-11T00:00:00Z' },
  { id: 4, item_type: 'product', item_id: 8, item_title: 'Cracked Software Bundle', author: 'Admin', status: 'rejected', reason: 'Copyright violation.', moderation_notes: 'Violates AUP — pirated content.', reviewed_by: 'Admin User', reviewed_at: '2025-03-07T00:00:00Z', submitted_at: '2025-03-06T00:00:00Z', created_at: '2025-03-06T00:00:00Z', updated_at: '2025-03-07T00:00:00Z' },
  { id: 5, item_type: 'blog', item_id: 3, item_title: 'Best Deals March 2025', author: 'Content Team', status: 'flagged', reason: 'Misleading pricing claims.', submitted_at: '2025-03-09T00:00:00Z', created_at: '2025-03-09T00:00:00Z', updated_at: '2025-03-09T00:00:00Z' },
  { id: 6, item_type: 'product', item_id: 5, item_title: 'Adobe Creative Cloud', author: 'Admin', status: 'pending', submitted_at: '2025-03-14T00:00:00Z', created_at: '2025-03-14T00:00:00Z', updated_at: '2025-03-14T00:00:00Z' },
  { id: 7, item_type: 'blog', item_id: 1, item_title: 'Getting Started Guide', author: 'Content Team', status: 'approved', moderation_notes: 'Reviewed and cleared.', reviewed_by: 'Admin User', reviewed_at: '2025-03-08T00:00:00Z', submitted_at: '2025-03-07T00:00:00Z', created_at: '2025-03-07T00:00:00Z', updated_at: '2025-03-08T00:00:00Z' },
];

const MOCK_STATS: ComplianceStats = {
  pending_review: 2,
  flagged: 2,
  approved: 2,
  rejected: 1,
};

export const complianceApi = {
  /** GET /api/compliance/reviews */
  async list(params?: ListParams): Promise<PaginatedResponse<ComplianceReview>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_REVIEWS];
      if (params?.status) filtered = filtered.filter((r) => r.status === params.status);
      if (params?.item_type) filtered = filtered.filter((r) => r.item_type === params.item_type);
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter((r) => r.item_title.toLowerCase().includes(q));
      }
      return mockDelay(mockPaginated(filtered, params));
    }
    const res = await client.get('/admin/compliance/reviews', { params });
    return res.data;
  },

  /** GET /api/admin/compliance/reviews/{id} */
  async get(id: number): Promise<ApiResponse<ComplianceReview>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_REVIEWS.find((r) => r.id === id) || MOCK_REVIEWS[0] });
    const res = await client.get(`/admin/compliance/reviews/${id}`);
    return res.data;
  },

  /** POST /api/admin/compliance/reviews/{id}/action — approve, reject, or flag */
  async performAction(id: number, action: ComplianceReviewAction): Promise<ApiResponse<ComplianceReview>> {
    if (USE_MOCK) {
      const review = MOCK_REVIEWS.find((r) => r.id === id) || MOCK_REVIEWS[0];
      return mockDelay({
        data: {
          ...review,
          status: action.action === 'approve' ? 'approved' : action.action === 'reject' ? 'rejected' : 'flagged',
          moderation_notes: action.moderation_notes || review.moderation_notes,
          reason: action.reason || review.reason,
          reviewed_by: 'Admin User',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ComplianceReview,
      });
    }
    const res = await client.post(`/admin/compliance/reviews/${id}/action`, action);
    return res.data;
  },

  /** GET /api/admin/compliance/stats */
  async getStats(): Promise<ApiResponse<ComplianceStats>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_STATS });
    const res = await client.get('/admin/compliance/stats');
    return res.data;
  },
};
