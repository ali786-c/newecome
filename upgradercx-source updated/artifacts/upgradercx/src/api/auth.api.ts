import { client, USE_MOCK, mockDelay } from './client';
import type { User, LoginCredentials, RegisterData, ApiResponse, AuthTokens } from '@/types';

const MOCK_ADMIN: User = {
  id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin',
  email_verified_at: '2025-01-01T00:00:00Z', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
};

const MOCK_CUSTOMER: User = {
  id: 2, name: 'John Customer', email: 'user@example.com', role: 'customer',
  email_verified_at: '2025-01-01T00:00:00Z', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
};

const mockAuth = {
  login: (c: LoginCredentials) => {
    if (c.email === 'admin@example.com' && c.password === 'password')
      return mockDelay<ApiResponse<AuthTokens & { user: User }>>({ data: { access_token: 'mock-token-admin', token_type: 'Bearer', user: MOCK_ADMIN } });
    if (c.email === 'user@example.com' && c.password === 'password')
      return mockDelay<ApiResponse<AuthTokens & { user: User }>>({ data: { access_token: 'mock-token-customer', token_type: 'Bearer', user: MOCK_CUSTOMER } });
    throw { response: { data: { message: 'Invalid credentials' } } };
  },
  register: () => mockDelay<ApiResponse<{ user: User }>>({ data: { user: { ...MOCK_CUSTOMER, id: 3 } } }),
  logout: () => mockDelay<void>(undefined),
  getUser: () => {
    const token = localStorage.getItem('access_token');
    const user = token === 'mock-token-admin' ? MOCK_ADMIN : MOCK_CUSTOMER;
    return mockDelay<ApiResponse<User>>({ data: user });
  },
  forgotPassword: () => mockDelay<ApiResponse>({ data: {}, message: 'Reset link sent' }),
  resetPassword: () => mockDelay<ApiResponse>({ data: {}, message: 'Password has been reset' }),
};

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthTokens & { user: User }>> {
    if (USE_MOCK) return mockAuth.login(credentials);
    const res = await client.post('/auth/login', credentials);
    return res.data;
  },
  async register(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
    if (USE_MOCK) return mockAuth.register();
    const res = await client.post('/auth/register', data);
    return res.data;
  },
  async logout(): Promise<void> {
    if (USE_MOCK) return mockAuth.logout();
    await client.post('/auth/logout');
  },
  async getUser(): Promise<ApiResponse<User>> {
    if (USE_MOCK) return mockAuth.getUser();
    const res = await client.get('/auth/user');
    return res.data;
  },
  async forgotPassword(email: string): Promise<ApiResponse> {
    if (USE_MOCK) return mockAuth.forgotPassword();
    const res = await client.post('/auth/forgot-password', { email });
    return res.data;
  },
  async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Promise<ApiResponse> {
    if (USE_MOCK) return mockAuth.resetPassword();
    const res = await client.post('/auth/reset-password', data);
    return res.data;
  },
};
