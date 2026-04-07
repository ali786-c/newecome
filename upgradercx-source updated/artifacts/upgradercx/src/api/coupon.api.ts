import { client } from './client';
import type { ApiResponse, ListParams, Coupon, CouponCreateData, BulkGenerateData } from '@/types';

export const couponApi = {
  // Admin methods
  async list(params?: ListParams): Promise<ApiResponse<Coupon[]>> {
    const res = await client.get('/admin/coupons', { params });
    return res.data;
  },
  async create(data: CouponCreateData): Promise<ApiResponse<Coupon>> {
    const res = await client.post('/admin/coupons', data);
    return res.data;
  },
  async bulkGenerate(data: BulkGenerateData): Promise<ApiResponse<Coupon[]>> {
    const res = await client.post('/admin/coupons/bulk', data);
    return res.data;
  },
  async updateStatus(id: number, status: 'active' | 'disabled'): Promise<ApiResponse<Coupon>> {
    const res = await client.patch(`/admin/coupons/${id}/status`, { status });
    return res.data;
  },
  async delete(id: number): Promise<ApiResponse<void>> {
    const res = await client.delete(`/admin/coupons/${id}`);
    return res.data;
  },

  // Public methods
  async validate(code: string, total: number): Promise<ApiResponse<{ valid: boolean; message?: string; coupon?: Coupon; discount?: number }>> {
    const res = await client.post('/coupons/validate', { code, total });
    return res.data;
  }
};
