/**
 * Support / Ticket API
 *
 * Laravel routes (suggested):
 *   GET    /api/tickets               → TicketController@index
 *   GET    /api/tickets/{id}          → TicketController@show
 *   POST   /api/tickets               → TicketController@store
 *   POST   /api/tickets/{id}/reply    → TicketController@reply
 *   POST   /api/tickets/{id}/note     → TicketController@addNote (staff internal)
 *   PATCH  /api/tickets/{id}/status   → TicketController@updateStatus
 *   PATCH  /api/tickets/{id}/assign   → TicketController@assign
 *   PATCH  /api/tickets/{id}/close    → TicketController@close
 */
import { client, USE_MOCK, mockDelay, mockPaginated } from './client';
import type { Ticket, TicketCreateData, TicketStatus, ApiResponse, PaginatedResponse, ListParams } from '@/types';

const MOCK_TICKETS: Ticket[] = [
  {
    id: 1, user_id: 2, user: { id: 2, name: 'Jane Customer', email: 'jane@example.com', role: 'customer', created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z' },
    subject: 'Order not delivered', category: 'order_issue', status: 'open', priority: 'high',
    order_id: 2, order_number: 'ORD-00002',
    messages: [
      { id: 1, ticket_id: 1, user_id: 2, body: 'My order ORD-00002 has not been delivered yet. It has been 3 days since payment.', is_internal: false, is_staff: false, created_at: '2025-03-11T10:00:00Z' },
    ],
    created_at: '2025-03-11T10:00:00Z', updated_at: '2025-03-11T10:00:00Z',
  },
  {
    id: 2, user_id: 3, user: { id: 3, name: 'Bob Buyer', email: 'bob@example.com', role: 'customer', created_at: '2025-02-15T00:00:00Z', updated_at: '2025-02-15T00:00:00Z' },
    subject: 'Refund request for VPN Premium', category: 'billing', status: 'answered', priority: 'medium',
    product_id: 3, product_name: 'VPN Premium 1yr',
    assigned_to: 1, assigned_user: { id: 1, name: 'Admin User', email: 'admin@upgradercx.com', role: 'admin', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    first_response_at: '2025-03-10T15:30:00Z',
    messages: [
      { id: 2, ticket_id: 2, user_id: 3, body: 'I would like a refund for VPN Premium. The product does not work as advertised.', is_internal: false, is_staff: false, created_at: '2025-03-10T14:00:00Z' },
      { id: 3, ticket_id: 2, user_id: 1, body: 'Hi Bob, I am sorry to hear that. Could you describe the issue you are experiencing?', is_internal: false, is_staff: true, created_at: '2025-03-10T15:30:00Z' },
      { id: 4, ticket_id: 2, user_id: 1, body: 'Check if the customer used a coupon code — if so, partial refund only per policy.', is_internal: true, is_staff: true, created_at: '2025-03-10T15:32:00Z' },
    ],
    created_at: '2025-03-10T14:00:00Z', updated_at: '2025-03-10T15:30:00Z',
  },
  {
    id: 3, user_id: 2,
    subject: 'Cannot activate Office 365 key', category: 'product_question', status: 'pending', priority: 'medium',
    product_id: 1, product_name: 'Office 365 Business',
    messages: [
      { id: 5, ticket_id: 3, user_id: 2, body: 'I purchased an Office 365 key but it says "already redeemed" when I try to activate it.', is_internal: false, is_staff: false, created_at: '2025-03-12T09:00:00Z' },
    ],
    created_at: '2025-03-12T09:00:00Z', updated_at: '2025-03-12T09:00:00Z',
  },
  {
    id: 4, user_id: 3,
    subject: 'How to change my email address?', category: 'account', status: 'resolved', priority: 'low',
    first_response_at: '2025-03-08T11:00:00Z',
    assigned_to: 1,
    messages: [
      { id: 6, ticket_id: 4, user_id: 3, body: 'I need to update my account email address.', is_internal: false, is_staff: false, created_at: '2025-03-08T10:00:00Z' },
      { id: 7, ticket_id: 4, user_id: 1, body: 'Go to Settings → Account → Email. You can update it there.', is_internal: false, is_staff: true, created_at: '2025-03-08T11:00:00Z' },
      { id: 8, ticket_id: 4, user_id: 3, body: 'Thank you, that worked!', is_internal: false, is_staff: false, created_at: '2025-03-08T11:30:00Z' },
    ],
    created_at: '2025-03-08T10:00:00Z', updated_at: '2025-03-08T11:30:00Z',
  },
  {
    id: 5, user_id: 2,
    subject: 'Website loading very slowly', category: 'technical', status: 'closed', priority: 'low',
    messages: [
      { id: 9, ticket_id: 5, user_id: 2, body: 'The website takes more than 10 seconds to load.', is_internal: false, is_staff: false, created_at: '2025-03-05T08:00:00Z' },
      { id: 10, ticket_id: 5, user_id: 1, body: 'We have resolved the server issue. Please try again.', is_internal: false, is_staff: true, created_at: '2025-03-05T10:00:00Z' },
    ],
    created_at: '2025-03-05T08:00:00Z', updated_at: '2025-03-05T10:00:00Z',
  },
];

export const supportApi = {
  async list(params?: ListParams): Promise<PaginatedResponse<Ticket>> {
    if (USE_MOCK) return mockDelay(mockPaginated(MOCK_TICKETS, params));
    const res = await client.get('/tickets', { params });
    return res.data;
  },
  async get(id: number): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0] });
    const res = await client.get(`/tickets/${id}`);
    return res.data;
  },
  async create(data: TicketCreateData): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) return mockDelay({
      data: {
        ...MOCK_TICKETS[0],
        ...data,
        id: Date.now(),
        status: 'open' as const,
        messages: [{ id: Date.now(), ticket_id: Date.now(), user_id: 2, body: data.message, is_internal: false, is_staff: false, created_at: new Date().toISOString() }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    const res = await client.post('/tickets', data);
    return res.data;
  },
  async reply(ticketId: number, body: string): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_TICKETS.find((t) => t.id === ticketId) || MOCK_TICKETS[0] });
    const res = await client.post(`/tickets/${ticketId}/reply`, { message: body });
    return res.data;
  },
  async addNote(ticketId: number, body: string): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) return mockDelay({ data: MOCK_TICKETS.find((t) => t.id === ticketId) || MOCK_TICKETS[0] });
    const res = await client.post(`/tickets/${ticketId}/note`, { message: body });
    return res.data;
  },
  async updateStatus(ticketId: number, status: TicketStatus): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId) || MOCK_TICKETS[0];
      return mockDelay({ data: { ...ticket, status } });
    }
    const res = await client.patch(`/tickets/${ticketId}/status`, { status });
    return res.data;
  },
  async assign(ticketId: number, userId: number): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId) || MOCK_TICKETS[0];
      return mockDelay({ data: { ...ticket, assigned_to: userId } });
    }
    const res = await client.patch(`/tickets/${ticketId}/assign`, { user_id: userId });
    return res.data;
  },
  async close(ticketId: number): Promise<ApiResponse<Ticket>> {
    if (USE_MOCK) return mockDelay({ data: { ...(MOCK_TICKETS.find((t) => t.id === ticketId) || MOCK_TICKETS[0]), status: 'closed' as const } });
    const res = await client.patch(`/tickets/${ticketId}/close`);
    return res.data;
  },

  // Admin specific methods
  async adminList(params?: ListParams): Promise<PaginatedResponse<Ticket>> {
    const res = await client.get('/admin/tickets', { params });
    return res.data;
  },
  async adminGet(id: number): Promise<ApiResponse<Ticket>> {
    const res = await client.get(`/admin/tickets/${id}`);
    return res.data;
  },
  async adminReply(ticketId: number, body: string): Promise<ApiResponse<Ticket>> {
    const res = await client.post(`/admin/tickets/${ticketId}/reply`, { message: body });
    return res.data;
  },
  async adminUpdateStatus(ticketId: number, status: TicketStatus): Promise<ApiResponse<Ticket>> {
    const res = await client.patch(`/admin/tickets/${ticketId}/status`, { status });
    return res.data;
  },
  async adminAssign(ticketId: number, userId: number): Promise<ApiResponse<Ticket>> {
    const res = await client.patch(`/admin/tickets/${ticketId}/assign`, { user_id: userId });
    return res.data;
  },
};
