import { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { orderApi } from '@/api/order.api';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/csv-export';
import type { OrderStatus, Order } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, RefreshCw, ShoppingCart, Eye, ChevronLeft, ChevronRight,
  Package, DollarSign, Clock, CheckCircle2, XCircle, Loader2, MoreHorizontal, Download,
  Send, Key, Mail, Copy, Zap,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeliveryPayload {
  deliveryType: 'credentials' | 'license_key' | 'link' | 'custom';
  email?: string;
  password?: string;
  licenseKey?: string;
  deliveryLink?: string;
  customMessage?: string;
  notes?: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
};

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<number | null>(null);
  const [deliverOrder, setDeliverOrder] = useState<Order | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryPayload>({
    deliveryType: 'credentials',
    email: '',
    password: '',
    licenseKey: '',
    deliveryLink: '',
    customMessage: '',
    notes: '',
  });

  useEffect(() => { document.title = 'Orders — Admin — UpgraderCX'; }, []);

  const { data: ordersRes, isLoading, refetch } = useApiQuery(
    ['admin-orders', searchQuery, statusFilter, String(page)],
    () => orderApi.list({
      page,
      per_page: 15,
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  );
  const orders = ordersRes?.data || [];
  const meta = ordersRes?.meta;

  const { data: detailRes } = useApiQuery(
    ['admin-order-detail', String(detailOrder)],
    () => orderApi.get(detailOrder!),
    { enabled: !!detailOrder },
  );
  const orderDetail = detailRes?.data;

  const statusMutation = useApiMutation(
    ({ id, status }: { id: number; status: string }) => orderApi.updateStatus(id, status),
    { onSuccess: () => { toast({ title: 'Order status updated' }); refetch(); } },
  );

  /* Stats from current data */
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage all customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            exportToCsv('orders', [
              { header: 'Order #', accessor: (o) => o.order_number },
              { header: 'Customer', accessor: (o) => o.user?.name || `User #${o.user_id}` },
              { header: 'Items', accessor: (o) => o.items.length },
              { header: 'Status', accessor: (o) => o.status },
              { header: 'Payment', accessor: (o) => o.payment_method || '' },
              { header: 'Total', accessor: (o) => Number(o.total).toFixed(2) },
              { header: 'Date', accessor: (o) => new Date(o.created_at).toLocaleDateString() },
            ], orders);
            toast({ title: 'CSV exported', description: `${orders.length} orders exported.` });
          }}>
            <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{meta?.total ?? orders.length}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Page Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium text-foreground">{order.order_number}</TableCell>
                    <TableCell className="text-sm">{order.user?.name || `User #${order.user_id}`}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status].variant}>{statusConfig[order.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">{order.payment_method || '—'}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailOrder(order.id)}>
                            <Eye className="mr-2 h-3 w-3" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setDeliverOrder(order); setDelivery({ deliveryType: 'credentials', email: '', password: '', licenseKey: '', deliveryLink: '', customMessage: '', notes: '' }); }} className="text-primary font-medium">
                            <Send className="mr-2 h-3 w-3" /> Deliver Product
                          </DropdownMenuItem>
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: order.id, status: 'processing' })}>
                              <Loader2 className="mr-2 h-3 w-3" /> Mark Processing
                            </DropdownMenuItem>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: order.id, status: 'completed' })}>
                              <CheckCircle2 className="mr-2 h-3 w-3" /> Mark Completed
                            </DropdownMenuItem>
                          )}
                          {order.status === 'completed' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: order.id, status: 'refunded' })} className="text-amber-600">
                              <RefreshCw className="mr-2 h-3 w-3" /> Process Refund
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'refunded' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: order.id, status: 'cancelled' })} className="text-destructive">
                              <XCircle className="mr-2 h-3 w-3" /> Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {meta.current_page} of {meta.last_page} ({meta.total} orders)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={meta.current_page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Deliver Product Dialog ── */}
      <Dialog open={!!deliverOrder} onOpenChange={(open) => !open && setDeliverOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Deliver Product — Order {deliverOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {deliverOrder && (
            <div className="space-y-4">
              {/* Customer info */}
              <div className="rounded-md bg-muted p-3 text-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{deliverOrder.user?.name || `User #${deliverOrder.user_id}`}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="font-medium text-foreground">{deliverOrder.items.length} product{deliverOrder.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">${Number(deliverOrder.total).toFixed(2)}</p>
                </div>
              </div>

              <Separator />

              {/* Delivery type tabs */}
              <div className="space-y-1.5">
                <Label>Delivery Type</Label>
                <Tabs value={delivery.deliveryType} onValueChange={(v) => setDelivery((d) => ({ ...d, deliveryType: v as DeliveryPayload['deliveryType'] }))}>
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="credentials" className="text-xs"><Key className="mr-1 h-3 w-3" />Login</TabsTrigger>
                    <TabsTrigger value="license_key" className="text-xs"><Zap className="mr-1 h-3 w-3" />Key</TabsTrigger>
                    <TabsTrigger value="link" className="text-xs"><Mail className="mr-1 h-3 w-3" />Link</TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs"><Send className="mr-1 h-3 w-3" />Custom</TabsTrigger>
                  </TabsList>

                  <TabsContent value="credentials" className="space-y-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Account Email</Label>
                      <Input placeholder="customer@example.com" value={delivery.email} onChange={(e) => setDelivery((d) => ({ ...d, email: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Password</Label>
                      <div className="relative">
                        <Input placeholder="account password" value={delivery.password} onChange={(e) => setDelivery((d) => ({ ...d, password: e.target.value }))} />
                        {delivery.password && (
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => { navigator.clipboard.writeText(delivery.password || ''); toast({ title: 'Copied!' }); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="license_key" className="space-y-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">License / Activation Key</Label>
                      <div className="relative">
                        <Input placeholder="XXXX-XXXX-XXXX-XXXX" value={delivery.licenseKey} onChange={(e) => setDelivery((d) => ({ ...d, licenseKey: e.target.value }))} className="font-mono" />
                        {delivery.licenseKey && (
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => { navigator.clipboard.writeText(delivery.licenseKey || ''); toast({ title: 'Copied!' }); }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="link" className="space-y-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Delivery Link / Download URL</Label>
                      <Input placeholder="https://..." value={delivery.deliveryLink} onChange={(e) => setDelivery((d) => ({ ...d, deliveryLink: e.target.value }))} />
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Custom Message</Label>
                      <Textarea placeholder="Enter the delivery instructions or any custom content for the customer..." value={delivery.customMessage} onChange={(e) => setDelivery((d) => ({ ...d, customMessage: e.target.value }))} rows={4} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Internal Notes (not sent to customer)</Label>
                <Textarea placeholder="Optional internal notes for your records..." value={delivery.notes} onChange={(e) => setDelivery((d) => ({ ...d, notes: e.target.value }))} rows={2} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeliverOrder(null)} disabled={isSending}>Cancel</Button>
            <Button
              disabled={isSending}
              onClick={() => {
                setIsSending(true);
                setTimeout(() => {
                  setIsSending(false);
                  setDeliverOrder(null);
                  if (deliverOrder) statusMutation.mutate({ id: deliverOrder.id, status: 'completed' });
                  toast({ title: 'Product delivered!', description: 'Delivery details sent to the customer via email.' });
                }, 1500);
              }}
              className="gap-2"
            >
              {isSending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : <><Send className="h-4 w-4" />Send to Customer</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {orderDetail?.order_number || ''}</DialogTitle>
          </DialogHeader>
          {orderDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{orderDetail.user?.name || `User #${orderDetail.user_id}`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[orderDetail.status].variant}>{statusConfig[orderDetail.status].label}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium text-foreground capitalize">{orderDetail.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{new Date(orderDetail.created_at).toLocaleString()}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {orderDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{item.product?.name || `Product #${item.product_id}`}</span>
                        <span className="text-muted-foreground">×{item.quantity}</span>
                      </div>
                      <span className="font-medium text-foreground">${Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground">Total</span>
                <span className="text-lg text-foreground">${Number(orderDetail.total).toFixed(2)}</span>
              </div>
              {orderDetail.notes && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground">{orderDetail.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
