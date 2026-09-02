/**
 * Referral API
 *
 * Laravel routes (suggested):
 *   GET  /api/referrals       → ReferralController@index
 *   GET  /api/referrals/stats → ReferralController@stats
 */
import { client } from './client';
import type { Referral, ReferralStats, ApiResponse, PaginatedResponse, ListParams } from '@/types';

export const referralApi = {
  /** GET /api/referrals */
  async list(params?: ListParams): Promise<PaginatedResponse<Referral>> {
    const res = await client.get('/referrals', { params });
    return res.data;
  },

  /** GET /api/referrals/stats */
  async getStats(): Promise<ApiResponse<ReferralStats>> {
    const res = await client.get('/referrals/stats');
    return res.data;
  },
};
