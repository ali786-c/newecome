import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supplierSyncApi } from '@/api/supplier-sync.api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, RefreshCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const SupplierBalanceWidget: React.FC = () => {
    const { data: balances, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['supplier-balances'],
        queryFn: () => supplierSyncApi.getBalances(),
        refetchInterval: 60000 * 5, // Refresh every 5 minutes
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Supplier Balances
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Supplier Wallets
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isError || !balances?.data ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-2 border p-2 rounded-md bg-destructive/5">
                            <AlertCircle className="h-3 w-3 text-destructive" />
                            Failed to load balances
                        </div>
                    ) : balances.data.length === 0 ? (
                        <div className="text-xs text-center text-muted-foreground py-2">
                            No active suppliers found.
                        </div>
                    ) : (
                        balances.data.map((s: any) => (
                            <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {s.name}
                                    </p>
                                    <p className="text-lg font-bold">
                                        {s.error ? (
                                            <span className="text-destructive text-sm font-normal">Error</span>
                                        ) : (
                                            `$${parseFloat(s.balance).toFixed(2)}`
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    {s.balance > 50 ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
                                    )}
                                    <span className="text-[10px] text-muted-foreground mt-1 lowercase">
                                        {s.type}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
