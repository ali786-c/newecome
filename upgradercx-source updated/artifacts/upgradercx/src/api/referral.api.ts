/**
 * Referral API
 *
 * Laravel routes (suggested):
 *   GET  /api/referrals       → ReferralController@index
 *   GET  /api/referrals/stats → ReferralController@stats
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { Referral, ReferralStats, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_REFERRALS: Referral[] = [
  { id: 1, referrer_id: 1, referred_id: 10, referred_user: { id: 10, name: 'Alice New', email: 'alice@example.com', role: 'customer', created_at: '2025-02-20T00:00:00Z', updated_at: '2025-02-20T00:00:00Z' }, commission: 5.00, status: 'credited', created_at: '2025-02-20T00:00:00Z' },
  { id: 2, referrer_id: 1, referred_id: 11, referred_user: { id: 11, name: 'Bob Referred', email: 'bob.r@example.com', role: 'customer', created_at: '2025-03-05T00:00:00Z', updated_at: '2025-03-05T00:00:00Z' }, commission: 5.00, status: 'pending', created_at: '2025-03-05T00:00:00Z' },
];

const MOCK_STATS: ReferralStats = {
  total_referrals: 2,
  total_earned: 5.00,
  commission_rate: 10,
  referral_code: 'UPGCX-ABC123',
  referral_url: 'https://upgradercx.com/register?ref=UPGCX-ABC123',
};

export const referralApi = {
  /** GET /api/referrals */
  async list(params?: ListParams): Promise<PaginatedResponse<Referral>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_REFERRALS, params));
    const res = await client.get('/referrals', { params });
    return res.data;
  },

  /** GET /api/referrals/stats */
  async getStats(): Promise<ApiResponse<ReferralStats>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_STATS });
    const res = await client.get('/referrals/stats');
    return res.data;
  },
};
