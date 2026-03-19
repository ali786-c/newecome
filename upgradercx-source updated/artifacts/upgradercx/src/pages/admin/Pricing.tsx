import { useState, useEffect } from 'react';
import { productApi } from '@/api/product.api';
import { channelSyncApi } from '@/api/channel-sync.api';
import { pricingSyncApi } from '@/api/pricing-sync.api';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/dashboard';
import type { Product, ChannelSyncStatus, SyncJob, PriceHistory, SyncChannel, PriceChangeSource, PriceApprovalStatus, PriceConflict, PricingSyncSettings } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search, RefreshCw, Send, MessageSquare, AlertTriangle, CheckCircle,
  Clock, Loader2, RotateCcw, ChevronLeft, ChevronRight,
  DollarSign, History, Percent, TrendingUp, TrendingDown,
  Settings, Shield, XCircle, ArrowRightLeft, FileText, ThumbsUp, ThumbsDown,
  Terminal, Globe, Bot, Zap,
} from 'lucide-react';

/* ── Helpers ── */
function timeAgo(iso?: string) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const JOB_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  completed: 'success', queued: 'neutral', processing: 'info', failed: 'error',
};

const sourceIcons: Record<PriceChangeSource, React.ReactNode> = {
  website_admin: <Globe className="h-3 w-3" />,
  telegram_command: <Send className="h-3 w-3" />,
  discord_command: <MessageSquare className="h-3 w-3" />,
  api: <Terminal className="h-3 w-3" />,
  batch: <Zap className="h-3 w-3" />,
  scheduled: <Clock className="h-3 w-3" />,
};

const sourceLabels: Record<PriceChangeSource, string> = {
  website_admin: 'Website Admin',
  telegram_command: 'Telegram Cmd',
  discord_command: 'Discord Cmd',
  api: 'API',
  batch: 'Batch',
  scheduled: 'Scheduled',
};

const approvalVariant: Record<PriceApprovalStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  auto_approved: 'secondary',
  pending_approval: 'outline',
  approved: 'default',
  rejected: 'destructive',
};

export default function AdminPricing() {
  const { toast } = useToast();

  useEffect(() => { document.title = 'Pricing & Sync — Admin — UpgraderCX'; }, []);

  /* ── Product pricing data ── */
  const [pricingSearch, setPricingSearch] = useState('');
  const [pricingPage, setPricingPage] = useState(1);
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useApiQuery(
    ['admin-pricing-products', pricingSearch, String(pricingPage)],
    () => productApi.list({ page: pricingPage, per_page: 10, search: pricingSearch || undefined }),
  );

  /* ── Inline editing state ── */
  const [editingCell, setEditingCell] = useState<{ id: number; field: 'price' | 'compare_price' } | null>(null);
  const [editValue, setEditValue] = useState('');

  /* ── Batch pricing state ── */
  const [selectedPricing, setSelectedPricing] = useState<Set<number>>(new Set());
  const [batchPercent, setBatchPercent] = useState('5');
  const [batchDirection, setBatchDirection] = useState<'increase' | 'decrease'>('increase');
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);

  const togglePricingSelect = (id: number) => {
    const next = new Set(selectedPricing);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedPricing(next);
  };
  const selectAllPricing = () => {
    if (selectedPricing.size === products.length) setSelectedPricing(new Set());
    else setSelectedPricing(new Set(products.map((p) => p.id)));
  };

  const batchPriceMutation = useApiMutation(
    async ({ ids, percent, direction }: { ids: number[]; percent: number; direction: 'increase' | 'decrease' }) => {
      const multiplier = direction === 'increase' ? 1 + percent / 100 : 1 - percent / 100;
      const updates = ids.map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;
        const newPrice = Math.max(0.01, parseFloat((product.price * multiplier).toFixed(2)));
        return productApi.update(id, { price: newPrice });
      }).filter(Boolean);
      return Promise.all(updates);
    },
    {
      onSuccess: () => {
        toast({ title: `Batch price ${batchDirection} applied to ${selectedPricing.size} products` });
        setSelectedPricing(new Set());
        setBatchConfirmOpen(false);
        refetchProducts();
      },
    },
  );

  const priceMutation = useApiMutation(
    ({ id, field, value }: { id: number; field: string; value: number }) =>
      productApi.update(id, { [field]: value }),
    {
      onSuccess: () => { toast({ title: 'Price updated — sync triggered' }); setEditingCell(null); refetchProducts(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to update price' }),
    },
  );

  const startEdit = (id: number, field: 'price' | 'compare_price', current: number) => {
    setEditingCell({ id, field });
    setEditValue(String(current));
  };
  const commitEdit = () => {
    if (!editingCell) return;
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) { toast({ variant: 'destructive', title: 'Invalid price' }); return; }
    priceMutation.mutate({ id: editingCell.id, field: editingCell.field, value: val });
  };

  /* ── Channel sync ── */
  const [syncChannel, setSyncChannel] = useState<'all' | SyncChannel>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'mismatched' | 'errors'>('all');
  const [syncPage, setSyncPage] = useState(1);
  const { data: syncData, isLoading: syncLoading, refetch: refetchSync } = useApiQuery(
    ['channel-sync-statuses', syncChannel, syncFilter, String(syncPage)],
    () => channelSyncApi.getProductStatuses({
      page: syncPage, per_page: 10,
      channel: syncChannel !== 'all' ? syncChannel : undefined,
      mismatched_only: syncFilter === 'mismatched' ? true : undefined,
      errors_only: syncFilter === 'errors' ? true : undefined,
    }),
  );

  /* ── Sync queue ── */
  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useApiQuery(
    ['sync-queue'], () => channelSyncApi.getQueue({ per_page: 20 }),
  );

  /* ── Sync settings ── */
  const { data: settingsRes, refetch: refetchSettings } = useApiQuery(
    ['pricing-sync-settings'], () => pricingSyncApi.getSettings(),
  );
  const settings = settingsRes?.data;

  /* ── Conflicts ── */
  const [showResolved, setShowResolved] = useState(false);
  const { data: conflictsRes, refetch: refetchConflicts } = useApiQuery(
    ['pricing-conflicts', String(showResolved)],
    () => pricingSyncApi.getConflicts({ resolved: showResolved ? undefined : false }),
  );
  const conflicts = conflictsRes?.data || [];

  /* ── Audit log ── */
  const [auditSourceFilter, setAuditSourceFilter] = useState<string>('all');
  const [auditApprovalFilter, setAuditApprovalFilter] = useState<string>('all');
  const { data: auditRes, isLoading: auditLoading, refetch: refetchAudit } = useApiQuery(
    ['pricing-audit-log', auditSourceFilter, auditApprovalFilter],
    () => pricingSyncApi.getAuditLog({
      source: auditSourceFilter !== 'all' ? auditSourceFilter : undefined,
      approval_status: auditApprovalFilter !== 'all' ? auditApprovalFilter : undefined,
      per_page: 20,
    }),
  );
  const auditEntries = auditRes?.data || [];

  /* ── Mutations ── */
  const syncProductMutation = useApiMutation(
    ({ productId, channel }: { productId: number; channel: SyncChannel }) =>
      channelSyncApi.syncProduct(productId, channel),
    { onSuccess: () => { toast({ title: 'Sync queued' }); refetchSync(); refetchQueue(); } },
  );
  const syncAllMutation = useApiMutation(
    (channel: SyncChannel) => channelSyncApi.syncAll(channel),
    { onSuccess: (_, ch) => { toast({ title: `Syncing all products to ${ch}` }); refetchQueue(); } },
  );
  const retryMutation = useApiMutation(
    (jobId: number) => channelSyncApi.retryJob(jobId),
    { onSuccess: () => { toast({ title: 'Retry queued' }); refetchQueue(); } },
  );
  const settingsMutation = useApiMutation(
    (data: Partial<PricingSyncSettings>) => pricingSyncApi.updateSettings(data),
    { onSuccess: () => { toast({ title: 'Sync settings updated' }); refetchSettings(); } },
  );
  const resolveConflictMutation = useApiMutation(
    ({ id, action }: { id: number; action: 'force_website' | 'accept_channel' | 'manual' }) =>
      pricingSyncApi.resolveConflict(id, action),
    { onSuccess: () => { toast({ title: 'Conflict resolved' }); refetchConflicts(); refetchSync(); } },
  );
  const approveMutation = useApiMutation(
    (id: number) => pricingSyncApi.approvePriceChange(id),
    { onSuccess: () => { toast({ title: 'Price change approved and sync triggered' }); refetchAudit(); } },
  );
  const rejectMutation = useApiMutation(
    (id: number) => pricingSyncApi.rejectPriceChange(id),
    { onSuccess: () => { toast({ title: 'Price change rejected — original price preserved' }); refetchAudit(); } },
  );

  /* ── Bulk sync ── */
  const [selectedSync, setSelectedSync] = useState<Set<number>>(new Set());
  const [bulkSyncConfirm, setBulkSyncConfirm] = useState<SyncChannel | null>(null);
  const toggleSyncSelect = (id: number) => {
    const next = new Set(selectedSync);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedSync(next);
  };
  const bulkSyncMutation = useApiMutation(
    ({ ids, channel }: { ids: number[]; channel: SyncChannel }) => channelSyncApi.bulkSync(ids, channel),
    { onSuccess: (_, vars) => { toast({ title: `${vars.ids.length} products queued for ${vars.channel} sync` }); setSelectedSync(new Set()); setBulkSyncConfirm(null); refetchQueue(); } },
  );

  const products = productsData?.data || [];
  const productsMeta = productsData?.meta;
  const syncStatuses = syncData?.data || [];
  const syncMeta = syncData?.meta;
  const queueJobs = queueData?.data || [];
  const pendingApprovals = auditEntries.filter((e) => e.approval_status === 'pending_approval').length;
  const unresolvedConflicts = conflicts.filter((c) => !c.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pricing & Sync Management</h1>
          <p className="text-sm text-muted-foreground">
            Website pricing is the source of truth. All channels sync from Laravel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingApprovals > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
              <Clock className="h-3 w-3 mr-1" />{pendingApprovals} pending approval
            </Badge>
          )}
          {unresolvedConflicts > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />{unresolvedConflicts} conflicts
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pricing"><DollarSign className="mr-1 h-3.5 w-3.5" /> Pricing</TabsTrigger>
          <TabsTrigger value="channels"><RefreshCw className="mr-1 h-3.5 w-3.5" /> Channel Sync</TabsTrigger>
          <TabsTrigger value="queue"><Clock className="mr-1 h-3.5 w-3.5" /> Queue</TabsTrigger>
          <TabsTrigger value="conflicts"><AlertTriangle className="mr-1 h-3.5 w-3.5" /> Conflicts{unresolvedConflicts > 0 ? ` (${unresolvedConflicts})` : ''}</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="mr-1 h-3.5 w-3.5" /> Audit Log</TabsTrigger>
          <TabsTrigger value="workflow"><ArrowRightLeft className="mr-1 h-3.5 w-3.5" /> Workflow</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-1 h-3.5 w-3.5" /> Settings</TabsTrigger>
        </TabsList>

        {/* ═══════════════ TAB: Pricing ═══════════════ */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-9" value={pricingSearch} onChange={(e) => { setPricingSearch(e.target.value); setPricingPage(1); }} />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {selectedPricing.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium text-foreground">{selectedPricing.size} selected</span>
              <Select value={batchDirection} onValueChange={(v) => setBatchDirection(v as 'increase' | 'decrease')}>
                <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase"><TrendingUp className="inline h-3 w-3 mr-1" />Increase</SelectItem>
                  <SelectItem value="decrease"><TrendingDown className="inline h-3 w-3 mr-1" />Decrease</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Input type="number" min="1" max="99" className="h-8 w-16" value={batchPercent} onChange={(e) => setBatchPercent(e.target.value)} />
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Button size="sm" onClick={() => setBatchConfirmOpen(true)}>Apply Batch Price Change</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedPricing(new Set())}>Clear</Button>
            </div>
          )}

          <AlertDialog open={batchConfirmOpen} onOpenChange={setBatchConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Batch Price Change</AlertDialogTitle>
                <AlertDialogDescription>
                  This will {batchDirection} the base price of {selectedPricing.size} product{selectedPricing.size !== 1 ? 's' : ''} by {batchPercent}%.
                  {settings?.auto_sync_on_price_change
                    ? ' Channel sync will be triggered automatically.'
                    : ' You will need to manually trigger channel sync after this change.'}
                  {settings?.require_approval_above_threshold && parseFloat(batchPercent) > (settings?.approval_threshold_percent || 20)
                    ? ` ⚠️ Changes above ${settings?.approval_threshold_percent}% require approval before going live.`
                    : ''}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => batchPriceMutation.mutate({ ids: Array.from(selectedPricing), percent: parseFloat(batchPercent) || 5, direction: batchDirection })}
                  disabled={batchPriceMutation.isPending}
                >
                  {batchPriceMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                  Confirm {batchDirection === 'increase' ? 'Increase' : 'Decrease'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={products.length > 0 && selectedPricing.size === products.length} onCheckedChange={selectAllPricing} /></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Compare Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Telegram</TableHead>
                    <TableHead>Discord</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No products found</TableCell></TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell><Checkbox checked={selectedPricing.has(product.id)} onCheckedChange={() => togglePricingSelect(product.id)} /></TableCell>
                        <TableCell>
                          <div><p className="font-medium text-foreground">{product.name}</p><p className="text-xs text-muted-foreground">{product.category?.name}</p></div>
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === product.id && editingCell.field === 'price' ? (
                            <div className="flex items-center gap-1">
                              <Input type="number" step="0.01" className="h-8 w-24" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }} autoFocus />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={commitEdit} disabled={priceMutation.isPending}><CheckCircle className="h-3.5 w-3.5" /></Button>
                            </div>
                          ) : (
                            <button className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer" onClick={() => startEdit(product.id, 'price', product.price)}>${product.price.toFixed(2)}</button>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingCell?.id === product.id && editingCell.field === 'compare_price' ? (
                            <div className="flex items-center gap-1">
                              <Input type="number" step="0.01" className="h-8 w-24" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }} autoFocus />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={commitEdit} disabled={priceMutation.isPending}><CheckCircle className="h-3.5 w-3.5" /></Button>
                            </div>
                          ) : (
                            <button className="text-muted-foreground hover:text-primary hover:underline cursor-pointer" onClick={() => startEdit(product.id, 'compare_price', product.compare_price || 0)}>
                              {product.compare_price ? `$${product.compare_price.toFixed(2)}` : '—'}
                            </button>
                          )}
                        </TableCell>
                        <TableCell>{product.discount_label ? <StatusBadge label={product.discount_label} variant="warning" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                        <TableCell><div className="flex items-center gap-1.5"><Send className={`h-3.5 w-3.5 ${product.telegram_enabled ? 'text-blue-500' : 'text-muted-foreground/30'}`} /><span className="text-xs">{product.telegram_enabled ? 'On' : 'Off'}</span></div></TableCell>
                        <TableCell><div className="flex items-center gap-1.5"><MessageSquare className={`h-3.5 w-3.5 ${product.discord_enabled ? 'text-indigo-500' : 'text-muted-foreground/30'}`} /><span className="text-xs">{product.discord_enabled ? 'On' : 'Off'}</span></div></TableCell>
                        <TableCell><StatusBadge label={product.status} variant={product.status === 'active' ? 'success' : product.status === 'draft' ? 'warning' : 'neutral'} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {productsMeta && productsMeta.last_page > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {productsMeta.current_page} of {productsMeta.last_page}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={productsMeta.current_page <= 1} onClick={() => setPricingPage((p) => p - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Prev</Button>
                <Button variant="outline" size="sm" disabled={productsMeta.current_page >= productsMeta.last_page} onClick={() => setPricingPage((p) => p + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ═══════════════ TAB: Channel Sync ═══════════════ */}
        <TabsContent value="channels" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={syncChannel} onValueChange={(v: any) => { setSyncChannel(v); setSyncPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Channels</SelectItem><SelectItem value="telegram">Telegram</SelectItem><SelectItem value="discord">Discord</SelectItem></SelectContent>
            </Select>
            <Select value={syncFilter} onValueChange={(v: any) => { setSyncFilter(v); setSyncPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="mismatched">Mismatched</SelectItem><SelectItem value="errors">Errors Only</SelectItem></SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetchSync()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => syncAllMutation.mutate('telegram')} disabled={syncAllMutation.isPending}><Send className="mr-1 h-3.5 w-3.5" /> Sync All → Telegram</Button>
              <Button size="sm" variant="outline" onClick={() => syncAllMutation.mutate('discord')} disabled={syncAllMutation.isPending}><MessageSquare className="mr-1 h-3.5 w-3.5" /> Sync All → Discord</Button>
            </div>
          </div>
          {selectedSync.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <span className="text-sm font-medium">{selectedSync.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => setBulkSyncConfirm('telegram')}><Send className="mr-1 h-3 w-3" /> Bulk → Telegram</Button>
              <Button size="sm" variant="outline" onClick={() => setBulkSyncConfirm('discord')}><MessageSquare className="mr-1 h-3 w-3" /> Bulk → Discord</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedSync(new Set())}>Clear</Button>
            </div>
          )}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox /></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Website Price</TableHead>
                    <TableHead>Synced Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>))
                  ) : syncStatuses.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No sync records found</TableCell></TableRow>
                  ) : (
                    syncStatuses.map((status, idx) => (
                      <TableRow key={`${status.product_id}-${status.channel}-${idx}`} className={status.mismatched ? 'bg-amber-500/5' : ''}>
                        <TableCell><Checkbox checked={selectedSync.has(status.product_id)} onCheckedChange={() => toggleSyncSelect(status.product_id)} /></TableCell>
                        <TableCell className="font-medium text-foreground">{status.product_name || `Product #${status.product_id}`}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {status.channel === 'telegram' ? <Send className="h-3.5 w-3.5 text-blue-500" /> : <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />}
                            <span className="text-sm capitalize">{status.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">${status.website_price.toFixed(2)}</TableCell>
                        <TableCell>
                          {status.synced_price != null ? (
                            <span className={status.mismatched ? 'font-medium text-destructive' : 'text-foreground'}>
                              ${status.synced_price.toFixed(2)}
                              {status.mismatched && <AlertTriangle className="ml-1 inline h-3 w-3 text-amber-500" />}
                            </span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {status.last_error ? <StatusBadge label="Error" variant="error" />
                            : status.mismatched ? <StatusBadge label="Mismatched" variant="warning" />
                            : status.synced ? <StatusBadge label="Synced" variant="success" />
                            : <StatusBadge label="Not synced" variant="neutral" />}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{timeAgo(status.last_synced_at)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => syncProductMutation.mutate({ productId: status.product_id, channel: status.channel })} disabled={syncProductMutation.isPending}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {syncStatuses.some((s) => s.last_error) && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" /> Sync Errors</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {syncStatuses.filter((s) => s.last_error).map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm">
                    <span>{s.product_name || `Product #${s.product_id}`} → {s.channel}: <span className="text-destructive">{s.last_error}</span></span>
                    <Button size="sm" variant="ghost" onClick={() => syncProductMutation.mutate({ productId: s.product_id, channel: s.channel })}><RotateCcw className="h-3 w-3 mr-1" /> Retry</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {syncMeta && syncMeta.last_page > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {syncMeta.current_page} of {syncMeta.last_page}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={syncMeta.current_page <= 1} onClick={() => setSyncPage((p) => p - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Prev</Button>
                <Button variant="outline" size="sm" disabled={syncMeta.current_page >= syncMeta.last_page} onClick={() => setSyncPage((p) => p + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ═══════════════ TAB: Sync Queue ═══════════════ */}
        <TabsContent value="queue" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{queueJobs.length} jobs in queue</p>
            <Button variant="outline" size="sm" onClick={() => refetchQueue()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead><TableHead>Product</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead><TableHead>Triggered</TableHead><TableHead>Time</TableHead><TableHead>Error</TableHead><TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>))
                  ) : queueJobs.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">Queue is empty — all syncs complete</TableCell></TableRow>
                  ) : (
                    queueJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">#{job.id}</TableCell>
                        <TableCell className="font-medium text-foreground">{job.product_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {job.channel === 'telegram' ? <Send className="h-3.5 w-3.5 text-blue-500" /> : <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />}
                            <span className="capitalize text-sm">{job.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge label={job.status} variant={JOB_STATUS_VARIANT[job.status]} pulse={job.status === 'processing'} /></TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {job.triggered_by === 'price_change' ? <DollarSign className="h-2.5 w-2.5 mr-0.5" /> : null}
                            {job.triggered_by}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{timeAgo(job.started_at || job.created_at)}</TableCell>
                        <TableCell>{job.error_message ? <span className="text-xs text-destructive">{job.error_message}</span> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{job.status === 'failed' && <Button size="sm" variant="ghost" onClick={() => retryMutation.mutate(job.id)}><RotateCcw className="h-3.5 w-3.5" /></Button>}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: Conflicts ═══════════════ */}
        <TabsContent value="conflicts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{unresolvedConflicts} unresolved price conflicts detected</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Show resolved</Label>
                <Switch checked={showResolved} onCheckedChange={setShowResolved} />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchConflicts()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
            </div>
          </div>

          {conflicts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CheckCircle className="h-12 w-12 text-primary/30" />
                <p className="text-sm text-muted-foreground mt-3">No price conflicts detected</p>
                <p className="text-xs text-muted-foreground">All channel prices match the website</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <Card key={conflict.id} className={conflict.resolved ? 'opacity-60' : conflict.drift_percent > 20 ? 'border-destructive/40' : 'border-amber-500/40'}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{conflict.product_name}</p>
                          <Badge variant={conflict.drift_percent > 20 ? 'destructive' : 'outline'} className="text-[10px]">
                            {conflict.drift_percent > 0 ? '+' : ''}{conflict.drift_percent.toFixed(1)}% drift
                          </Badge>
                          {conflict.resolved && <Badge variant="secondary" className="text-[10px]">Resolved</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            {conflict.channel === 'telegram' ? <Send className="h-3 w-3 text-blue-500" /> : <MessageSquare className="h-3 w-3 text-indigo-500" />}
                            <span className="capitalize">{conflict.channel}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Website:</span>{' '}
                            <span className="font-medium text-foreground">${conflict.website_price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Channel:</span>{' '}
                            <span className="font-medium text-destructive">${conflict.channel_price.toFixed(2)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Detected {timeAgo(conflict.detected_at)}</span>
                        </div>
                        {conflict.resolved && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Resolved by {conflict.resolved_by} · Action: {conflict.resolved_action} · {timeAgo(conflict.resolved_at)}
                          </p>
                        )}
                      </div>
                      {!conflict.resolved && (
                        <div className="flex flex-col gap-1.5">
                          <Button size="sm" onClick={() => resolveConflictMutation.mutate({ id: conflict.id, action: 'force_website' })} disabled={resolveConflictMutation.isPending}>
                            <Globe className="h-3 w-3 mr-1" /> Force Website Price
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => resolveConflictMutation.mutate({ id: conflict.id, action: 'accept_channel' })} disabled={resolveConflictMutation.isPending}>
                            <ArrowRightLeft className="h-3 w-3 mr-1" /> Accept Channel Price
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => resolveConflictMutation.mutate({ id: conflict.id, action: 'manual' })} disabled={resolveConflictMutation.isPending}>
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════ TAB: Audit Log ═══════════════ */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={auditSourceFilter} onValueChange={setAuditSourceFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website_admin">Website Admin</SelectItem>
                <SelectItem value="telegram_command">Telegram Cmd</SelectItem>
                <SelectItem value="discord_command">Discord Cmd</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="batch">Batch</SelectItem>
              </SelectContent>
            </Select>
            <Select value={auditApprovalFilter} onValueChange={setAuditApprovalFilter}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="Approval" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="auto_approved">Auto-Approved</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetchAudit()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Old → New</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Sync</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}>{Array.from({ length: 10 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>))
                  ) : auditEntries.length === 0 ? (
                    <TableRow><TableCell colSpan={10} className="py-12 text-center text-muted-foreground">No pricing audit entries</TableCell></TableRow>
                  ) : (
                    auditEntries.map((entry) => (
                      <TableRow key={entry.id} className={entry.approval_status === 'pending_approval' ? 'bg-amber-500/5' : entry.approval_status === 'rejected' ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-medium text-foreground">{entry.product_name}</TableCell>
                        <TableCell className="text-sm capitalize">{entry.field.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground line-through">${entry.old_value.toFixed(2)}</span>
                          <span className="mx-1 text-muted-foreground">→</span>
                          <span className="font-medium text-foreground">${entry.new_value.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={Math.abs(entry.change_percent) > 20 ? 'destructive' : 'outline'} className="text-[10px]">
                            {entry.change_percent > 0 ? '+' : ''}{entry.change_percent.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            {sourceIcons[entry.source]}
                            <span>{sourceLabels[entry.source]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{entry.changed_by}</TableCell>
                        <TableCell>
                          <Badge variant={approvalVariant[entry.approval_status]} className="text-[10px]">
                            {entry.approval_status.replace('_', ' ')}
                          </Badge>
                          {entry.approved_by && <p className="text-[9px] text-muted-foreground mt-0.5">by {entry.approved_by}</p>}
                        </TableCell>
                        <TableCell>
                          {entry.sync_triggered ? (
                            <Badge variant={entry.sync_outcome === 'success' ? 'default' : entry.sync_outcome === 'failed' ? 'destructive' : 'outline'} className="text-[10px]">
                              {entry.sync_outcome || 'pending'}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{timeAgo(entry.created_at)}</TableCell>
                        <TableCell>
                          {entry.approval_status === 'pending_approval' && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => approveMutation.mutate(entry.id)} disabled={approveMutation.isPending}>
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => rejectMutation.mutate(entry.id)} disabled={rejectMutation.isPending}>
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: Command Workflow ═══════════════ */}
        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing Command Workflow</CardTitle>
              <CardDescription>
                All pricing changes flow through the Laravel backend. The website database is the single source of truth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flow 1: Website Admin */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4" /> Website Admin Edit</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Admin edits price', '→ Laravel validates', '→ MySQL updated', '→ Website reflects immediately', '→ Sync jobs queued for TG + DC'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <div className="h-0.5 w-4 bg-primary" />}
                      <div className="rounded-md border bg-muted px-3 py-1.5 text-xs font-medium">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Flow 2: Telegram Command */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Send className="h-4 w-4 text-blue-500" /> Telegram Admin Command</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Admin sends /price command', '→ Bot calls Laravel API', '→ Laravel validates & saves', '→ Website updated', '→ Discord sync triggered'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <div className="h-0.5 w-4 bg-blue-500" />}
                      <div className="rounded-md border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-medium">{step}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground ml-6">Command format: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">/price [product_id] [new_price]</code></p>
              </div>

              <Separator />

              {/* Flow 3: Discord Command */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-indigo-500" /> Discord Admin Command</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Admin sends !price command', '→ Bot calls Laravel API', '→ Laravel validates & saves', '→ Website updated', '→ Telegram sync triggered'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <div className="h-0.5 w-4 bg-indigo-500" />}
                      <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium">{step}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground ml-6">Command format: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">!price [product_id] [new_price]</code></p>
              </div>

              <Separator />

              {/* Approval gate */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /> Approval Gate</h3>
                <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm text-foreground">
                    When a price change exceeds the configured threshold ({settings?.approval_threshold_percent || 20}%),
                    the change is held in <Badge variant="outline" className="text-[10px]">pending approval</Badge> status.
                  </p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                    <li>Website price is NOT updated until approved</li>
                    <li>Channel sync is NOT triggered until approved</li>
                    <li>Admin receives notification to approve or reject</li>
                    <li>On approval: price updates, sync triggers for all enabled channels</li>
                    <li>On rejection: original price preserved, no sync</li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Key rules */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Key Rules</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { icon: <Globe className="h-4 w-4" />, rule: 'Laravel/MySQL is the single source of truth' },
                    { icon: <Send className="h-4 w-4" />, rule: 'Telegram/Discord are notification targets, never separate pricing databases' },
                    { icon: <History className="h-4 w-4" />, rule: 'Every change is logged with who, where, and when' },
                    { icon: <AlertTriangle className="h-4 w-4" />, rule: 'Mismatches are detected automatically and flagged for resolution' },
                    { icon: <Shield className="h-4 w-4" />, rule: 'Large changes require admin approval before going live' },
                    { icon: <RefreshCw className="h-4 w-4" />, rule: 'Failed syncs can be retried without re-editing prices' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-md border p-3">
                      <div className="text-primary mt-0.5">{item.icon}</div>
                      <p className="text-xs text-foreground">{item.rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ TAB: Settings ═══════════════ */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Auto-sync settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Auto-Sync Settings</CardTitle>
                <CardDescription>Control automatic channel synchronization after price changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-sync on price change</Label>
                    <p className="text-xs text-muted-foreground">Automatically push price updates to enabled channels</p>
                  </div>
                  <Switch checked={settings?.auto_sync_on_price_change ?? true} onCheckedChange={(v) => settingsMutation.mutate({ auto_sync_on_price_change: v })} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Sync to channels</Label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 rounded-md border p-2.5">
                      <Send className="h-3.5 w-3.5 text-blue-500" />
                      <Label className="text-xs cursor-pointer">Telegram</Label>
                      <Switch checked={settings?.sync_channels?.includes('telegram') ?? true} onCheckedChange={(v) => {
                        const channels = v ? [...(settings?.sync_channels || []), 'telegram'] : (settings?.sync_channels || []).filter((c) => c !== 'telegram');
                        settingsMutation.mutate({ sync_channels: channels as SyncChannel[] });
                      }} />
                    </div>
                    <div className="flex items-center gap-2 rounded-md border p-2.5">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                      <Label className="text-xs cursor-pointer">Discord</Label>
                      <Switch checked={settings?.sync_channels?.includes('discord') ?? true} onCheckedChange={(v) => {
                        const channels = v ? [...(settings?.sync_channels || []), 'discord'] : (settings?.sync_channels || []).filter((c) => c !== 'discord');
                        settingsMutation.mutate({ sync_channels: channels as SyncChannel[] });
                      }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Approval Gate</CardTitle>
                <CardDescription>Require manual approval for large price changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require approval above threshold</Label>
                    <p className="text-xs text-muted-foreground">Hold changes that exceed the threshold for review</p>
                  </div>
                  <Switch checked={settings?.require_approval_above_threshold ?? true} onCheckedChange={(v) => settingsMutation.mutate({ require_approval_above_threshold: v })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Approval threshold (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="1" max="100" className="w-20 h-8" defaultValue={settings?.approval_threshold_percent ?? 20} onBlur={(e) => settingsMutation.mutate({ approval_threshold_percent: parseInt(e.target.value) || 20 })} />
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Changes above this % require approval</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max batch change (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="1" max="100" className="w-20 h-8" defaultValue={settings?.batch_change_max_percent ?? 50} onBlur={(e) => settingsMutation.mutate({ batch_change_max_percent: parseInt(e.target.value) || 50 })} />
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Hard limit on batch price changes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Command permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Channel Command Permissions</CardTitle>
                <CardDescription>Control which channels can update prices via bot commands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-500" />
                    <div>
                      <Label>Telegram /price command</Label>
                      <p className="text-xs text-muted-foreground">Allow price updates via Telegram bot</p>
                    </div>
                  </div>
                  <Switch checked={settings?.telegram_command_enabled ?? true} onCheckedChange={(v) => settingsMutation.mutate({ telegram_command_enabled: v })} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    <div>
                      <Label>Discord !price command</Label>
                      <p className="text-xs text-muted-foreground">Allow price updates via Discord bot</p>
                    </div>
                  </div>
                  <Switch checked={settings?.discord_command_enabled ?? true} onCheckedChange={(v) => settingsMutation.mutate({ discord_command_enabled: v })} />
                </div>
              </CardContent>
            </Card>

            {/* Mismatch detection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Mismatch Detection</CardTitle>
                <CardDescription>Automatically detect and alert on price drift between website and channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on mismatch</Label>
                    <p className="text-xs text-muted-foreground">Alert admin when channel prices drift from website</p>
                  </div>
                  <Switch checked={settings?.notify_on_mismatch ?? true} onCheckedChange={(v) => settingsMutation.mutate({ notify_on_mismatch: v })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Mismatch threshold (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min="1" max="100" className="w-20 h-8" defaultValue={settings?.mismatch_threshold_percent ?? 5} onBlur={(e) => settingsMutation.mutate({ mismatch_threshold_percent: parseInt(e.target.value) || 5 })} />
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Flag conflicts above this drift %</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk sync confirm dialog */}
      <AlertDialog open={!!bulkSyncConfirm} onOpenChange={() => setBulkSyncConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Sync</AlertDialogTitle>
            <AlertDialogDescription>
              This will queue {selectedSync.size} product{selectedSync.size !== 1 ? 's' : ''} for {bulkSyncConfirm} sync. Website prices are the source of truth.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkSyncConfirm && bulkSyncMutation.mutate({ ids: Array.from(selectedSync), channel: bulkSyncConfirm })} disabled={bulkSyncMutation.isPending}>
              {bulkSyncMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
              Confirm Sync
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
