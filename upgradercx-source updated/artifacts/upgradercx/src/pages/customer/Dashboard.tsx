import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiQuery } from '@/hooks/use-api-query';
import { orderApi } from '@/api/order.api';
import { walletApi } from '@/api/wallet.api';
import { supportApi } from '@/api/support.api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Wallet, LifeBuoy, TrendingUp, ArrowRight, Package,
  Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

const orderStatusBadge = (s: OrderStatus) => {
  const map: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    completed: 'default', pending: 'outline', processing: 'secondary', cancelled: 'destructive', refunded: 'destructive',
  };
  return <Badge variant={map[s]}>{s}</Badge>;
};

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: balanceRes } = useApiQuery(['my-balance'], () => walletApi.getBalance());
  const { data: ordersRes } = useApiQuery(['my-orders-recent'], () => orderApi.list({ per_page: 5 }));
  const { data: ticketsRes } = useApiQuery(['my-tickets-recent'], () => supportApi.list({ per_page: 3 }));

  const balance = balanceRes?.data;
  const orders = ordersRes?.data || [];
  const tickets = ticketsRes?.data || [];
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'pending').length;

  return (
    <PageScaffold title="Dashboard" description={`Welcome back, ${user?.name || 'there'}!`}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(balance?.balance || 0).toFixed(2)}</div>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link to="/wallet/top-up">Top up →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link to="/orders">View all →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
              <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTickets}</div>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link to="/tickets">View tickets →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Referral Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link to="/referrals">Earn more →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/products">
              <Package className="h-5 w-5" />
              <span>Browse Products</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/wallet/top-up">
              <Wallet className="h-5 w-5" />
              <span>Top Up Wallet</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link to="/tickets">
              <LifeBuoy className="h-5 w-5" />
              <span>Get Support</span>
            </Link>
          </Button>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/orders">View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">No orders yet</p>
                <Button variant="link" size="sm" asChild><Link to="/products">Browse products</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">${Number(order.total).toFixed(2)}</span>
                      {orderStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageScaffold>
  );
}
