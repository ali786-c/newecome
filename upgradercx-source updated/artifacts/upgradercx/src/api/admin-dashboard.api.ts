import { client, USE_MOCK, mockDelay } from './client';
import type { ApiResponse } from '@/types';

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalOrders: number;
  ordersToday: number;
  revenue: string;
  totalCustomers: number;
  newCustomersWeek: number;
  openTickets: number;
  pendingImports: number;
  syncSuccessRate: number;
  failedJobs24h: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: any[];
  openTickets: any[];
  alerts: any[];
  channelHealth: any[];
  recentPriceChanges: any[];
  automationModules: any[];
}

export const adminDashboardApi = {
  async get(): Promise<ApiResponse<DashboardData>> {
    if (USE_MOCK) {
       return mockDelay({
         data: {
           stats: {
             totalProducts: 24, activeProducts: 18, inactiveProducts: 6, totalOrders: 156, ordersToday: 12, revenue: '$4,280', totalCustomers: 89, newCustomersWeek: 7, openTickets: 3, pendingImports: 2, syncSuccessRate: 96, failedJobs24h: 1
           },
           recentOrders: [],
           openTickets: [],
           alerts: [],
           channelHealth: [],
           recentPriceChanges: [],
           automationModules: []
         }
       });
    }
    const res = await client.get('/admin/dashboard');
    return res.data;
  }
};
