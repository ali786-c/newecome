import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { orderApi } from '@/api/order.api';
import { supplierSyncApi } from '@/api/supplier-sync.api';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { OrderDetailView } from '@/components/admin/orders/OrderDetailView';
import { 
    ArrowLeft, 
    RefreshCw, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Download
} from 'lucide-react';
import { statusConfig } from '@/config/order-status';
import { exportToCsv } from '@/lib/csv-export';
import { useSettings } from '@/contexts/SettingsContext';

export default function AdminOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const orderId = parseInt(id || '0');
    const navigate = useNavigate();
    const { formatPrice } = useSettings();

    const { data: orderRes, isLoading, refetch } = useApiQuery(
        ['admin-order-detail', orderId],
        () => orderApi.adminGet(orderId),
        { enabled: !!orderId }
    );

    const order = orderRes?.data;

    const statusMutation = useApiMutation(
        (data: { id: number; status?: string; fulfillment_status?: string }) => {
            const { id, ...payload } = data;
            return orderApi.adminUpdateStatus(id, payload);
        },
        { 
            onSuccess: () => { 
                toast.success('Order status updated'); 
                refetch(); 
            },
            onError: () => toast.error('Failed to update status')
        }
    );

    const retryMutation = useApiMutation(
        (id: number) => supplierSyncApi.retryFulfillment(id),
        {
            onSuccess: () => {
                toast.success('Fulfillment retry triggered');
                refetch();
            },
            onError: (err: any) => {
                toast.error(err.message || 'Retry failed');
            }
        }
    );

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-lg font-medium">Order not found</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <PageScaffold
            title={`Order ${order.order_number}`}
            description={`Management view for order placed on ${new Date(order.created_at).toLocaleString()}`}
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        exportToCsv('order-' + order.order_number, [
                            { header: 'Order #', accessor: (o: any) => o.order_number },
                            { header: 'Customer', accessor: (o: any) => o.user?.name || `User #${o.user_id}` },
                            { header: 'Status', accessor: (o: any) => o.status },
                            { header: 'Total', accessor: (o: any) => formatPrice(o.total) },
                            { header: 'Date', accessor: (o: any) => new Date(o.created_at).toLocaleString() },
                        ], [order]);
                    }}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button onClick={() => navigate(-1)} variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Order Summary</CardTitle>
                                <Badge variant={statusConfig[order.status].variant} className="uppercase px-3 py-1">
                                    {statusConfig[order.status].label}
                                </Badge>
                            </div>
                            <CardDescription>Comprehensive breakdown of items and billing information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderDetailView order={order} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>Manually override order status or trigger fulfillment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.fulfillment_status === 'failed' && (
                                <Button 
                                    className="w-full justify-start text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 font-bold" 
                                    variant="outline"
                                    onClick={() => retryMutation.mutate(order.id)}
                                    disabled={retryMutation.isPending}
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                                    Retry Auto-Fulfillment
                                </Button>
                            )}

                            {order.status === 'pending' && (
                                <Button 
                                    className="w-full justify-start" 
                                    variant="outline"
                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'processing' })}
                                    disabled={statusMutation.isPending}
                                >
                                    <Loader2 className="mr-2 h-4 w-4" /> Mark as Processing
                                </Button>
                            )}

                            {(order.status === 'pending' || order.status === 'processing') && (
                                <Button 
                                    className="w-full justify-start text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100" 
                                    variant="outline"
                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'completed' })}
                                    disabled={statusMutation.isPending}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                                </Button>
                            )}

                            {order.status === 'completed' && (
                                <Button 
                                    className="w-full justify-start text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100" 
                                    variant="outline"
                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'refunded' })}
                                    disabled={statusMutation.isPending}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Process Refund
                                </Button>
                            )}

                            {order.status !== 'cancelled' && order.status !== 'refunded' && (
                                <Button 
                                    className="w-full justify-start text-destructive bg-destructive/5 hover:bg-destructive/10" 
                                    variant="outline"
                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'cancelled' })}
                                    disabled={statusMutation.isPending}
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {order.user?.name ? order.user.name[0].toUpperCase() : 'U'}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold">{order.user?.name || 'Guest User'}</p>
                                    <p className="text-xs text-muted-foreground underline">{order.user?.email}</p>
                                </div>
                            </div>
                            <Button asChild variant="secondary" size="sm" className="w-full">
                                <Link to={`/admin/customers/${order.user_id}`}>View Full Profile</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageScaffold>
    );
}
