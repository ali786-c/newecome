import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { WalletBalance, WalletTransaction, TopUpData, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_BALANCE: WalletBalance = { balance: 125.50, currency: 'USD' };
const MOCK_TXN: WalletTransaction[] = [
  { id: 1, type: 'credit', amount: 100, description: 'Top-up via Stripe', reference: 'TXN-001', created_at: '2025-03-01T10:00:00Z' },
  { id: 2, type: 'debit', amount: 29.99, description: 'Order ORD-00001', reference: 'ORD-00001', created_at: '2025-03-01T10:05:00Z' },
  { id: 3, type: 'credit', amount: 55.49, description: 'Top-up via PayPal', reference: 'TXN-002', created_at: '2025-03-05T12:00:00Z' },
];

export const walletApi = {
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_BALANCE });
    const res = await client.get('/wallet/balance');
    return res.data;
  },
  async getTransactions(params?: ListParams): Promise<PaginatedResponse<WalletTransaction>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_TXN, params));
    const res = await client.get('/wallet/transactions', { params });
    return res.data;
  },
  async topUp(data: TopUpData): Promise<ApiResponse<WalletTransaction>> {
    if (USE_MOCK) return mockDelay({ data: { id: 99, type: 'credit' as const, amount: data.amount, description: `Top-up via ${data.payment_method}`, created_at: new Date().toISOString() } });
    const res = await client.post('/wallet/top-up', data);
    return res.data;
  },
};
