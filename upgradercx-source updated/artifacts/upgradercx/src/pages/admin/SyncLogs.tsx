import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { channelSyncApi } from '@/api/channel-sync.api';
import { useToast } from '@/hooks/use-toast';
import type { SyncJobStatus, NotificationDeliveryStatus, SyncChannel } from '@/types';
import {
  RefreshCw, Loader2, CheckCircle, XCircle, Clock, AlertTriangle,
  Activity, Zap, Send, MessageSquare, BarChart3, Bell,
  Shield, ArrowRight, Package, LifeBuoy, DollarSign, TrendingDown,
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

const jobStatusVariant: Record<SyncJobStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default', failed: 'destructive', queued: 'outline', processing: 'secondary',
};
const jobStatusIcon: Record<SyncJobStatus, React.ReactNode> = {
  completed: <CheckCircle className="h-3 w-3" />, failed: <XCircle className="h-3 w-3" />,
  queued: <Clock className="h-3 w-3" />, processing: <Loader2 className="h-3 w-3 animate-spin" />,
};

const notifStatusVariant: Record<NotificationDeliveryStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  sent: 'default', failed: 'destructive', skipped: 'secondary', pending: 'outline',
};

const channelIcon: Record<SyncChannel, React.ReactNode> = {
  telegram: <Send className="h-3.5 w-3.5" />, discord: <MessageSquare className="h-3.5 w-3.5" />,
};

const eventTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  ticket_created: { label: 'Ticket Created', icon: <LifeBuoy className="h-3 w-3" /> },
  ticket_replied: { label: 'Ticket Replied', icon: <LifeBuoy className="h-3 w-3" /> },
  ticket_status_changed: { label: 'Ticket Status', icon: <LifeBuoy className="h-3 w-3" /> },
  order_completed: { label: 'Order OK', icon: <CheckCircle className="h-3 w-3" /> },
  order_failed: { label: 'Order Failed', icon: <XCircle className="h-3 w-3" /> },
  price_approval_needed: { label: 'Price Approval', icon: <DollarSign className="h-3 w-3" /> },
  price_approved: { label: 'Price Approved', icon: <DollarSign className="h-3 w-3" /> },
  price_rejected: { label: 'Price Rejected', icon: <DollarSign className="h-3 w-3" /> },
  sync_failed: { label: 'Sync Failed', icon: <AlertTriangle className="h-3 w-3" /> },
  low_stock: { label: 'Low Stock', icon: <TrendingDown className="h-3 w-3" /> },
  automation_triggered: { label: 'Automation', icon: <Zap className="h-3 w-3" /> },
};

export default function SyncLogs() {
  const { toast } = useToast();
  const [queueStatusFilter, setQueueStatusFilter] = useState<string>('all');
  const [queueChannelFilter, setQueueChannelFilter] = useState<string>('all');
  const [notifChannelFilter, setNotifChannelFilter] = useState<string>('all');
  const [notifEventFilter, setNotifEventFilter] = useState<string>('all');
  const [notifStatusFilter, setNotifStatusFilter] = useState<string>('all');
  const [productIdLookup, setProductIdLookup] = useState('');
  const [lookupProductId, setLookupProductId] = useState<number | null>(null);

  useEffect(() => { document.title = 'Sync Dashboard — Admin — UpgraderCX'; }, []);

  /* ── Queries ── */
  const { data: dashRes, refetch: refetchDash } = useApiQuery(
    ['sync-dashboard'], () => channelSyncApi.getDashboardStats(),
  );
  const stats = dashRes?.data;

  const { data: queueRes, isLoading: queueLoading, refetch: refetchQueue } = useApiQuery(
    ['sync-queue', queueStatusFilter, queueChannelFilter],
    () => channelSyncApi.getQueue({
      status: queueStatusFilter !== 'all' ? queueStatusFilter : undefined,
      channel: queueChannelFilter !== 'all' ? queueChannelFilter : undefined,
      per_page: 20,
    }),
  );

  const { data: failedRes, isLoading: failedLoading, refetch: refetchFailed } = useApiQuery(
    ['sync-failed'], () => channelSyncApi.getFailedJobs({ per_page: 20 }),
  );

  const { data: notifRes, isLoading: notifLoading, refetch: refetchNotifs } = useApiQuery(
    ['sync-notifications', notifChannelFilter, notifEventFilter, notifStatusFilter],
    () => channelSyncApi.getNotificationLog({
      channel: notifChannelFilter !== 'all' ? notifChannelFilter : undefined,
      event_type: notifEventFilter !== 'all' ? notifEventFilter : undefined,
      status: notifStatusFilter !== 'all' ? notifStatusFilter : undefined,
      per_page: 20,
    }),
  );

  const { data: productHistRes, isLoading: productHistLoading } = useApiQuery(
    ['sync-product-history', lookupProductId],
    () => lookupProductId ? channelSyncApi.getProductSyncHistory(lookupProductId) : Promise.resolve({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 }, links: { first: '', last: '', prev: null, next: null } }),
    { enabled: !!lookupProductId },
  );

  const { data: conflictsRes, isLoading: conflictsLoading, refetch: refetchConflicts } = useApiQuery(
    ['sync-conflicts'], () => channelSyncApi.getConflicts({ resolved: 'false' }),
  );

  /* ── Mutations ── */
  const retryMutation = useApiMutation((jobId: number) => channelSyncApi.retryJob(jobId), {
    onSuccess: () => { toast({ title: 'Retry queued' }); refetchQueue(); refetchFailed(); },
  });
  const syncAllMutation = useApiMutation((channel: SyncChannel) => channelSyncApi.syncAll(channel), {
    onSuccess: (res) => { toast({ title: `${res.data.queued} jobs queued` }); refetchQueue(); refetchDash(); },
  });
  const resolveMutation = useApiMutation(
    ({ id, action }: { id: number; action: 'force_website' | 'accept_channel' }) =>
      channelSyncApi.resolveConflict(id, action),
    { onSuccess: () => { toast({ title: 'Conflict resolved' }); refetchConflicts(); } },
  );

  const failedJobs = failedRes?.data || [];
  const notifications = notifRes?.data || [];
  const conflicts = conflictsRes?.data || [];
  const unresolvedConflicts = conflicts.filter((c) => !c.resolved).length;

  return (
    <PageScaffold
      title="Sync Dashboard"
      description="Cross-channel synchronization status, job queue, and notification history."
      actions={
        <div className="flex items-center gap-2">
          {unresolvedConflicts > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-3 w-3 mr-1" />{unresolvedConflicts} conflicts
            </Badge>
          )}
          {(stats?.failed_24h ?? 0) > 0 && (
            <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{stats?.failed_24h} failed (24h)</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => { refetchDash(); refetchQueue(); }}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview"><BarChart3 className="mr-1 h-3.5 w-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="queue"><Activity className="mr-1 h-3.5 w-3.5" /> Queue</TabsTrigger>
            <TabsTrigger value="failed"><XCircle className="mr-1 h-3.5 w-3.5" /> Failed</TabsTrigger>
            <TabsTrigger value="product"><Package className="mr-1 h-3.5 w-3.5" /> Product</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-1 h-3.5 w-3.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="health"><Shield className="mr-1 h-3.5 w-3.5" /> Health</TabsTrigger>
            <TabsTrigger value="conflicts"><AlertTriangle className="mr-1 h-3.5 w-3.5" /> Conflicts</TabsTrigger>
          </TabsList>

          {/* ═══════════════ TAB: Overview ═══════════════ */}
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: 'Jobs (24h)', value: stats?.total_jobs_24h ?? 0, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
                { label: 'Completed', value: stats?.completed_24h ?? 0, icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
                { label: 'Failed', value: stats?.failed_24h ?? 0, icon: <XCircle className="h-4 w-4 text-destructive" /> },
                { label: 'Success Rate', value: `${stats?.success_rate_percent ?? 0}%`, icon: <TrendingDown className="h-4 w-4 text-muted-foreground" /> },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      </div>
                      {s.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Queue Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Queued Now</p>
                      <p className="text-2xl font-bold text-foreground">{stats?.queued_now ?? 0}</p>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Now</p>
                      <p className="text-2xl font-bold text-foreground">{stats?.processing_now ?? 0}</p>
                    </div>
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Duration</p>
                      <p className="text-2xl font-bold text-foreground">{stats?.avg_duration_ms ? `${(stats.avg_duration_ms / 1000).toFixed(1)}s` : '—'}</p>
                    </div>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sync All Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manual Sync Actions</CardTitle>
                <CardDescription>Trigger a full re-sync of all products to a channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" disabled={syncAllMutation.isPending} onClick={() => syncAllMutation.mutate('telegram')}>
                    <Send className="h-3.5 w-3.5 mr-1" />Sync All → Telegram
                  </Button>
                  <Button variant="outline" size="sm" disabled={syncAllMutation.isPending} onClick={() => syncAllMutation.mutate('discord')}>
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />Sync All → Discord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Queue ═══════════════ */}
          <TabsContent value="queue" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={queueStatusFilter} onValueChange={setQueueStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={queueChannelFilter} onValueChange={setQueueChannelFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchQueue()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Triggered By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 9 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : (queueRes?.data || []).length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="py-12 text-center text-muted-foreground">No jobs in queue</TableCell></TableRow>
                    ) : (
                      (queueRes?.data || []).map((job) => (
                        <TableRow key={job.id} className={job.status === 'failed' ? 'bg-destructive/5' : ''}>
                          <TableCell className="text-xs text-muted-foreground">#{job.id}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <span className="font-medium text-foreground">{job.product_name}</span>
                              <p className="text-[10px] text-muted-foreground">ID: {job.product_id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] gap-1">{channelIcon[job.channel]}{job.channel}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground capitalize">{job.triggered_by.replace('_', ' ')}</TableCell>
                          <TableCell>
                            <Badge variant={jobStatusVariant[job.status]} className="text-[10px] gap-1">
                              {jobStatusIcon[job.status]}{job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {job.retry_count}/{job.max_retries}
                            {job.next_retry_at && <p className="text-[10px] text-muted-foreground">next: {timeAgo(job.next_retry_at)}</p>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {job.duration_ms ? `${(job.duration_ms / 1000).toFixed(1)}s` : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo(job.created_at)}</TableCell>
                          <TableCell>
                            {job.status === 'failed' && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => retryMutation.mutate(job.id)} disabled={retryMutation.isPending}>
                                <RefreshCw className="h-3 w-3" />
                              </Button>
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

          {/* ═══════════════ TAB: Failed Jobs ═══════════════ */}
          <TabsContent value="failed" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{failedJobs.length} failed job{failedJobs.length !== 1 ? 's' : ''}</p>
              <Button variant="outline" size="sm" onClick={() => refetchFailed()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Next Retry</TableHead>
                      <TableHead>Failed At</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : failedJobs.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No failed jobs 🎉</TableCell></TableRow>
                    ) : (
                      failedJobs.map((job) => (
                        <TableRow key={job.id} className="bg-destructive/5">
                          <TableCell className="text-xs text-muted-foreground">#{job.id}</TableCell>
                          <TableCell className="text-xs font-medium text-foreground">{job.product_name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] gap-1">{channelIcon[job.channel]}{job.channel}</Badge></TableCell>
                          <TableCell className="text-xs text-destructive max-w-[250px] truncate">{job.error_message}</TableCell>
                          <TableCell className="text-xs">{job.retry_count}/{job.max_retries}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{job.next_retry_at ? timeAgo(job.next_retry_at) : job.retry_count >= job.max_retries ? <Badge variant="destructive" className="text-[9px]">Exhausted</Badge> : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo(job.started_at || job.created_at)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => retryMutation.mutate(job.id)} disabled={retryMutation.isPending}>
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Per-Product Sync ═══════════════ */}
          <TabsContent value="product" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Sync History</CardTitle>
                <CardDescription>Look up all sync events for a specific product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-end">
                  <div className="space-y-1 flex-1 max-w-xs">
                    <Label>Product ID</Label>
                    <Input type="number" placeholder="Enter product ID" value={productIdLookup} onChange={(e) => setProductIdLookup(e.target.value)} />
                  </div>
                  <Button size="sm" onClick={() => setLookupProductId(Number(productIdLookup))} disabled={!productIdLookup}>
                    <ArrowRight className="h-3.5 w-3.5 mr-1" />Look Up
                  </Button>
                </div>
              </CardContent>
            </Card>

            {lookupProductId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sync History for Product #{lookupProductId}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Triggered By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Retries</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productHistLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                        ))
                      ) : (productHistRes?.data || []).length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No sync history for this product</TableCell></TableRow>
                      ) : (
                        (productHistRes?.data || []).map((job) => (
                          <TableRow key={job.id} className={job.status === 'failed' ? 'bg-destructive/5' : ''}>
                            <TableCell className="text-xs text-muted-foreground">#{job.id}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px] gap-1">{channelIcon[job.channel]}{job.channel}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground capitalize">{job.triggered_by.replace('_', ' ')}</TableCell>
                            <TableCell><Badge variant={jobStatusVariant[job.status]} className="text-[10px] gap-1">{jobStatusIcon[job.status]}{job.status}</Badge></TableCell>
                            <TableCell className="text-xs">{job.retry_count}/{job.max_retries}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{job.duration_ms ? `${(job.duration_ms / 1000).toFixed(1)}s` : '—'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{timeAgo(job.created_at)}</TableCell>
                            <TableCell>
                              {job.status === 'failed' && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => retryMutation.mutate(job.id)}>
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════ TAB: Notifications ═══════════════ */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={notifChannelFilter} onValueChange={setNotifChannelFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
              <Select value={notifEventFilter} onValueChange={setNotifEventFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Event" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="ticket_created">Ticket Created</SelectItem>
                  <SelectItem value="ticket_replied">Ticket Replied</SelectItem>
                  <SelectItem value="order_completed">Order Completed</SelectItem>
                  <SelectItem value="order_failed">Order Failed</SelectItem>
                  <SelectItem value="price_approval_needed">Price Approval</SelectItem>
                  <SelectItem value="sync_failed">Sync Failed</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={notifStatusFilter} onValueChange={setNotifStatusFilter}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchNotifs()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 7 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : notifications.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No notifications logged</TableCell></TableRow>
                    ) : (
                      notifications.map((n) => {
                        const evt = eventTypeLabels[n.event_type] || { label: n.event_type, icon: <Bell className="h-3 w-3" /> };
                        return (
                          <TableRow key={n.id} className={n.status === 'failed' ? 'bg-destructive/5' : ''}>
                            <TableCell className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] gap-1">{evt.icon}{evt.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] gap-1">{channelIcon[n.channel]}{n.channel}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {n.reference_label ? (
                                <span className="font-medium text-foreground">{n.reference_label}</span>
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={notifStatusVariant[n.status]} className="text-[10px]">{n.status}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{n.payload_preview || '—'}</TableCell>
                            <TableCell className="text-xs text-destructive max-w-[150px] truncate">{n.error_message || ''}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Channel Health ═══════════════ */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(stats?.channels || []).map((ch) => {
                const healthColor = ch.status === 'healthy' ? 'text-emerald-500' : ch.status === 'degraded' ? 'text-amber-500' : 'text-destructive';
                const healthBg = ch.status === 'healthy' ? 'border-emerald-500/20 bg-emerald-500/5' : ch.status === 'degraded' ? 'border-amber-500/20 bg-amber-500/5' : 'border-destructive/20 bg-destructive/5';
                return (
                  <Card key={ch.channel} className={healthBg}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {channelIcon[ch.channel]}
                          <span className="capitalize">{ch.channel}</span>
                        </CardTitle>
                        <Badge variant="outline" className={`${healthColor} text-xs`}>
                          {ch.status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {ch.status === 'degraded' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {ch.status === 'down' && <XCircle className="h-3 w-3 mr-1" />}
                          {ch.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Synced (24h)</p>
                          <p className="text-lg font-bold text-foreground">{ch.total_synced_24h}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Error Rate (24h)</p>
                          <p className={`text-lg font-bold ${ch.error_rate_24h > 5 ? 'text-destructive' : 'text-foreground'}`}>{ch.error_rate_24h}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Success</p>
                          <p className="text-sm text-foreground">{timeAgo(ch.last_success_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="text-sm text-foreground">{ch.pending_count}</p>
                        </div>
                        {ch.last_failure_at && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Last Failure</p>
                            <p className="text-sm text-destructive">{timeAgo(ch.last_failure_at)}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" disabled={syncAllMutation.isPending} onClick={() => syncAllMutation.mutate(ch.channel)}>
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />Force Re-sync All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Conflicts ═══════════════ */}
          <TabsContent value="conflicts" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{unresolvedConflicts} unresolved conflict{unresolvedConflicts !== 1 ? 's' : ''}</p>
              <Button variant="outline" size="sm" onClick={() => refetchConflicts()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Website Price</TableHead>
                      <TableHead>Channel Price</TableHead>
                      <TableHead>Drift</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflictsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : conflicts.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No price conflicts detected 🎉</TableCell></TableRow>
                    ) : (
                      conflicts.map((c) => (
                        <TableRow key={c.id} className={!c.resolved ? 'bg-amber-500/5' : ''}>
                          <TableCell>
                            <div className="text-xs">
                              <span className="font-medium text-foreground">{c.product_name}</span>
                              <p className="text-[10px] text-muted-foreground">#{c.product_id}</p>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] gap-1">{channelIcon[c.channel]}{c.channel}</Badge></TableCell>
                          <TableCell className="text-xs font-medium text-foreground">${Number(c.website_price).toFixed(2)}</TableCell>
                          <TableCell className="text-xs font-medium text-destructive">${Number(c.channel_price).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={Math.abs(c.drift_percent) > 10 ? 'destructive' : 'outline'} className="text-[10px]">
                              {c.drift_percent > 0 ? '+' : ''}{Number(c.drift_percent).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo(c.detected_at)}</TableCell>
                          <TableCell>
                            {c.resolved ? (
                              <Badge variant="secondary" className="text-[10px]">
                                <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                                {c.resolved_action?.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-600">Unresolved</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!c.resolved && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="text-[10px] h-7 px-2" onClick={() => resolveMutation.mutate({ id: c.id, action: 'force_website' })} disabled={resolveMutation.isPending}>
                                  Force Website
                                </Button>
                                <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2" onClick={() => resolveMutation.mutate({ id: c.id, action: 'accept_channel' })} disabled={resolveMutation.isPending}>
                                  Accept Channel
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
        </Tabs>
      </div>
    </PageScaffold>
  );
}
