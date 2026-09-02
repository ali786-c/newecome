import { client } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types';

export interface Review {
  id: number;
  product_id: number;
  user_id?: number;
  author_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ReviewCreateData {
  product_id: number;
  author_name: string;
  rating: number;
  comment: string;
}

export interface ReviewUpdateData {
  author_name?: string;
  rating?: number;
  comment?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export const reviewApi = {
  /**
   * List approved reviews for a product
   */
  async list(params: { product_slug?: string; product_id?: number; page?: number; per_page?: number }): Promise<PaginatedResponse<Review>> {
    const res = await client.get('/reviews', { params });
    return res.data;
  },

  /**
   * Submit a new review
   */
  async create(data: ReviewCreateData): Promise<ApiResponse<Review>> {
    const res = await client.post('/reviews', data);
    return res.data;
  },

  /**
   * Admin: List all reviews
   */
  async adminList(params?: { status?: string; product_id?: number; page?: number; per_page?: number }): Promise<PaginatedResponse<Review>> {
    const res = await client.get('/admin/reviews', { params });
    return res.data;
  },

  /**
   * Admin: Update/Approve/Reject review
   */
  async update(id: number, data: ReviewUpdateData): Promise<ApiResponse<Review>> {
    const res = await client.patch(`/admin/reviews/${id}`, data);
    return res.data;
  },

  /**
   * Admin: Delete review
   */
  async delete(id: number): Promise<void> {
    await client.delete(`/admin/reviews/${id}`);
  },
};
