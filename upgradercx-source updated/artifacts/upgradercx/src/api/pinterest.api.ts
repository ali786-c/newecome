import { client, USE_MOCK, mockDelay } from './client';
import type { PinterestConfig, PinterestBoard, ApiResponse } from '@/types';

/* ── Mock Data ── */
const MOCK_CONFIG: PinterestConfig = {
  id: 1,
  config: {
    client_id: '123456789',
    client_secret_set: true,
    access_token_set: true,
    board_id: 'board123',
    auto_post_enabled: true,
  },
  boards: [
    { id: 'board123', name: 'Digital Products' },
    { id: 'board456', name: 'Software Deals' },
  ],
  status: 'active',
};

export const pinterestApi = {
  /**
   * Get the Pinterest configuration.
   */
  async getConfig(): Promise<ApiResponse<PinterestConfig>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CONFIG });
    const res = await client.get('/admin/pinterest/config');
    return res.data;
  },

  /**
   * Update the Pinterest configuration.
   */
  async updateConfig(data: any): Promise<ApiResponse<PinterestConfig>> {
    if (USE_MOCK) return mockDelay({ data: { ...MOCK_CONFIG, config: { ...MOCK_CONFIG.config, ...data } } });
    const res = await client.put('/admin/pinterest/config', data);
    return res.data;
  },

  /**
   * Get the Pinterest Authorization URL.
   */
  async getAuthUrl(): Promise<{ url: string }> {
    if (USE_MOCK) return mockDelay({ url: 'https://www.pinterest.com/oauth/mock' });
    const res = await client.get('/admin/pinterest/auth-url');
    return res.data;
  },

  /**
   * Get user boards from Pinterest.
   */
  async getBoards(): Promise<ApiResponse<PinterestBoard[]>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_CONFIG.boards });
    const res = await client.get('/admin/pinterest/boards');
    return res.data;
  },

  /**
   * Test the Pinterest connection.
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) return mockDelay({ success: true, message: 'Connection successful.' });
    const res = await client.post('/admin/pinterest/test');
    return res.data;
  },
};
