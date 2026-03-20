import React from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { SupplierBalanceWidget } from '@/components/dashboard/SupplierBalanceWidget';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupplierBalancePage() {
    return (
        <PageScaffold
            title="Supplier Balance"
            description="Monitor and manage your pre-paid balances across different providers."
        >
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <SupplierBalanceWidget />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Reloadly Connection
                            </CardTitle>
                            <CardDescription>Your automated fulfillment provider status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">API Environment</span>
                                    <span className="text-sm px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono">Sandbox</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Auto-Fulfillment</span>
                                    <span className="text-sm px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Enabled</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Auth Status</span>
                                    <span className="text-sm px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Authorized</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="https://app.reloadly.com" target="_blank" rel="noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Top up at Reloadly
                                    </a>
                                </Button>
                                <Button variant="secondary" className="w-full">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Test Sync
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Balance Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                We automatically check your supplier balances every 5 minutes. If a balance drops below $10.00,
                                an alert will be generated in your dashboard and a notification will be sent to the admin email.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageScaffold>
    );
}
