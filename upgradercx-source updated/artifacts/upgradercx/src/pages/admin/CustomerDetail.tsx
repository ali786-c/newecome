import { useParams, Link } from 'react-router-dom';
import { useApiQuery } from '@/hooks/use-api-query';
import { customerApi } from '@/api/customer.api';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import {
    User,
    ShoppingBag,
    Wallet,
    ShieldCheck,
    Settings,
    Plus,
    Minus,
    ArrowLeft,
    Loader2,
    Lock,
    History
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminCustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const customerId = parseInt(id || '0');
    const { formatPrice } = useSettings();
    const queryClient = useQueryClient();

    const [password, setPassword] = useState('');
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustDescription, setAdjustDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const { data: customerRes, isLoading: isLoadingCustomer } = useApiQuery(
        ['admin-customer', customerId],
        () => customerApi.get(customerId)
    );

    const { data: ordersRes, isLoading: isLoadingOrders } = useApiQuery(
        ['admin-customer-orders', customerId],
        () => customerApi.orders(customerId)
    );

    const { data: walletRes, isLoading: isLoadingWallet } = useApiQuery(
        ['admin-customer-wallet', customerId],
        () => customerApi.wallet(customerId)
    );

    const customer = customerRes?.data;
    const orders = ordersRes?.data || [];
    const wallet = walletRes?.data;

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setIsUpdating(true);
        try {
            await customerApi.changePassword(customerId, password);
            toast.success('Password updated successfully');
            setPassword('');
        } catch (error) {
            toast.error('Failed to update password');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAdjustWallet = async (e: React.FormEvent, type: 'credit' | 'debit') => {
        e.preventDefault();
        const amount = parseFloat(adjustAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        setIsUpdating(true);
        try {
            const finalAmount = type === 'credit' ? amount : -amount;
            await customerApi.adjustWallet(customerId, {
                amount: finalAmount,
                description: adjustDescription || `Admin ${type === 'credit' ? 'Top-up' : 'Deduction'}`
            });
            toast.success('Wallet adjusted successfully');
            setAdjustAmount('');
            setAdjustDescription('');
            queryClient.invalidateQueries({ queryKey: ['admin-customer-wallet', customerId] });
            queryClient.invalidateQueries({ queryKey: ['admin-customer', customerId] });
        } catch (error) {
            toast.error('Failed to adjust wallet');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsUpdating(true);
        try {
            if (customer?.status === 'active') {
                await customerApi.update(customerId, { status: 'suspended' });
                toast.success('Customer suspended');
            } else {
                await customerApi.update(customerId, { status: 'active' });
                toast.success('Customer activated');
            }
            queryClient.invalidateQueries({ queryKey: ['admin-customer', customerId] });
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoadingCustomer) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
                <p className="text-muted-foreground">Customer not found</p>
                <Button asChild variant="outline">
                    <Link to="/admin/customers"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers</Link>
                </Button>
            </div>
        );
    }

    return (
        <PageScaffold
            title={customer.name}
            description={`Manage customer account for ${customer.email}`}
            actions={
                <Button asChild variant="outline" size="sm">
                    <Link to="/admin/customers"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Header Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Wallet Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPrice(customer.wallet_balance || 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{orders.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={customer.status === 'active' ? 'success' : 'destructive'} className="uppercase">
                                {customer.status}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Joined</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">{new Date(customer.created_at).toLocaleDateString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-background border w-full justify-start h-12 p-1 gap-2 overflow-x-auto overflow-y-hidden">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-4 h-9"><User className="h-4 w-4" /> Overview</TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center gap-2 px-4 h-9"><ShoppingBag className="h-4 w-4" /> Orders</TabsTrigger>
                        <TabsTrigger value="wallet" className="flex items-center gap-2 px-4 h-9"><Wallet className="h-4 w-4" /> Wallet</TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2 px-4 h-9"><ShieldCheck className="h-4 w-4" /> Security</TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2 px-4 h-9"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>General details about the customer's profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <p className="font-medium">{customer.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Email Address</Label>
                                        <p className="font-medium">{customer.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Role</Label>
                                        <p className="font-medium capitalize">{customer.role}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Email Verified</Label>
                                        <p className="font-medium">{customer.email_verified_at ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                                <CardDescription>Recent purchases made by this customer.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingOrders ? (
                                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No orders found</div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order: any) => (
                                            <div key={order.id} className="flex items-center justify-between border rounded-lg p-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold">Order #{order.id.toString().padStart(5, '0')}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'destructive'} className="uppercase text-[10px]">
                                                        {order.status}
                                                    </Badge>
                                                    <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link to={`/admin/orders/${order.id}`}>View</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="wallet">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Adjust Balance</CardTitle>
                                    <CardDescription>Manually add or subtract funds from the customer's wallet.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                value={adjustAmount}
                                                onChange={(e) => setAdjustAmount(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <Input
                                                id="description"
                                                placeholder="Reason for adjustment"
                                                value={adjustDescription}
                                                onChange={(e) => setAdjustDescription(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                type="button"
                                                className="flex-1"
                                                onClick={(e) => handleAdjustWallet(e, 'credit')}
                                                disabled={isUpdating}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Funds
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={(e) => handleAdjustWallet(e, 'debit')}
                                                disabled={isUpdating}
                                            >
                                                <Minus className="mr-2 h-4 w-4" /> Deduct Funds
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <CardDescription>Last few wallet activities.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingWallet ? (
                                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                                    ) : !wallet?.transactions || wallet.transactions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No transactions</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {wallet.transactions.slice(0, 5).map((txn: any) => (
                                                <div key={txn.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                                                    <div className="space-y-0.5">
                                                        <p className="font-medium text-xs truncate max-w-[150px]">{txn.description}</p>
                                                        <p className="text-[10px] text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                                                        {txn.amount > 0 ? '+' : ''}{formatPrice(txn.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Security</CardTitle>
                                <CardDescription>Change password or manage authentication settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Reset Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="new-password"
                                                type="password"
                                                placeholder="Enter new strong password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pr-10"
                                            />
                                            <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Minimum 8 characters. The user will be able to log in with this password immediately.</p>
                                    </div>
                                    <Button type="submit" disabled={isUpdating || !password}>
                                        Update Password
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Danger Zone</CardTitle>
                                <CardDescription>Manage account status and permanence.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between border rounded-lg p-4 border-destructive/20 bg-destructive/5">
                                    <div className="space-y-0.5">
                                        <p className="font-semibold text-destructive">Account Status</p>
                                        <p className="text-sm text-muted-foreground">
                                            {customer.status === 'active'
                                                ? 'Suspended accounts cannot log in or make purchases.'
                                                : 'Reactivating will restore the customer\'s access to the shop.'}
                                        </p>
                                    </div>
                                    <Button
                                        variant={customer.status === 'active' ? 'destructive' : 'default'}
                                        onClick={handleToggleStatus}
                                        disabled={isUpdating}
                                    >
                                        {customer.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PageScaffold>
    );
}
