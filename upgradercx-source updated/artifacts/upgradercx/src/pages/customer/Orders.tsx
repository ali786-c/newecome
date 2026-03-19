import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApiQuery } from '@/hooks/use-api-query';
import { useToast } from '@/hooks/use-toast';
import { orderApi } from '@/api/order.api';
import { Search, ShoppingCart, Package, Copy, Key, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const MOCK_DELIVERED: Record<string, { type: string; email?: string; password?: string; licenseKey?: string; deliveryLink?: string; expiresAt?: string }> = {
  'ORD-00145': { type: 'email_password', email: 'seat3@netflix-family.com', password: 'Str0ng#P@ss99', expiresAt: new Date(Date.now() + 86400000 * 80).toISOString() },
  'ORD-00138': { type: 'license_key', licenseKey: 'NORD-A1B2-C3D4-E5F6-7890' },
  'ORD-00122': { type: 'email_password', email: 'spotprem@family.com', password: 'Sp0t#Secure77', expiresAt: new Date(Date.now() + 86400000 * 120).toISOString() },
};

const statusBadge = (s: OrderStatus) => {
  const map: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    completed: 'default', pending: 'outline', processing: 'secondary', cancelled: 'destructive', refunded: 'destructive',
  };
  return <Badge variant={map[s]}>{s}</Badge>;
};

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPass, setShowPass] = useState(false);
  const { toast } = useToast();

  const params: Record<string, unknown> = {};
  if (search) params.search = search;
  if (statusFilter !== 'all') params.status = statusFilter;

  const { data: ordersRes, isLoading } = useApiQuery(
    ['my-orders', search, statusFilter], () => orderApi.list(params)
  );
  const orders = ordersRes?.data || [];

  return (
    <PageScaffold title="Orders" description="Your order history and current orders.">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <p className="text-muted-foreground mt-2">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : orders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell className="text-right font-medium">${Number(order.total).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Detail */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {statusBadge(selectedOrder.status)}
                <span className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Product #{item.product_id}</span>
                      <Badge variant="outline" className="text-[10px]">×{item.quantity}</Badge>
                    </div>
                    <span className="font-medium text-sm">${Number(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">${Number(selectedOrder.total).toFixed(2)}</span>
              </div>
              {selectedOrder.payment_method && (
                <p className="text-xs text-muted-foreground">Payment: {selectedOrder.payment_method}</p>
              )}

              {/* Delivered credentials */}
              {selectedOrder.status === 'completed' && (() => {
                const delivered = MOCK_DELIVERED[selectedOrder.order_number];
                if (!delivered) return (
                  <div className="rounded-md border border-muted bg-muted/30 p-3 text-xs text-muted-foreground">
                    Delivery details will appear here once the order is fulfilled.
                  </div>
                );
                return (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Key className="h-3.5 w-3.5 text-primary" />Your Delivered Credentials</p>
                    {delivered.type === 'email_password' && <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono text-foreground">{delivered.email}</code>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(delivered.email!); toast({ title: 'Copied!' }); }}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Password</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono text-foreground">{showPass ? delivered.password : '••••••••'}</code>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(delivered.password!); toast({ title: 'Copied!' }); }}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </>}
                    {delivered.type === 'license_key' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">License Key</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">{delivered.licenseKey}</code>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(delivered.licenseKey!); toast({ title: 'Copied!' }); }}><Copy className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    )}
                    {delivered.expiresAt && (
                      <p className="text-[10px] text-muted-foreground">Seat expires: {new Date(delivered.expiresAt).toLocaleDateString()}</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-1" asChild>
                      <Link to="/tickets"><RefreshCw className="h-3.5 w-3.5" />Request Replacement Seat</Link>
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageScaffold>
  );
}
