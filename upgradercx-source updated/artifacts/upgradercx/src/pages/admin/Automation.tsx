import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { automationApi } from '@/api/automation.api';
import { useToast } from '@/hooks/use-toast';
import type { AutomationJobStatus, AutomationJobType, ImportReviewStatus, SyncChannel } from '@/types';
import {
  Bot, Clock, CheckCircle2, XCircle, SkipForward, Loader2,
  Play, Pause, Zap, Activity, AlertTriangle, RefreshCw,
  Timer, Send, MessageSquare, Star, Package, ShieldCheck,
  FileUp, DollarSign, TrendingUp, Eye, Check, X, History,
  Key, PackagePlus, Bell, Truck, RotateCcw,
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

const jobStatusConfig: Record<AutomationJobStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  completed: { label: 'Completed', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  skipped: { label: 'Skipped', variant: 'secondary', icon: <SkipForward className="h-3 w-3" /> },
  running: { label: 'Running', variant: 'outline', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  queued: { label: 'Queued', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
};

const jobTypeLabels: Record<AutomationJobType, string> = {
  random_post: 'Random Post',
  featured_rotation: 'Featured Rotation',
  stock_suppression: 'Stock Suppression',
  import_review: 'Import Review',
  recently_updated: 'Recently Updated',
  supplier_discovery: 'Supplier Auto-Discovery',
  auto_fulfillment: 'Auto-Fulfillment',
  renewal_reminder: 'Renewal Reminder',
};

const importStatusVariant: Record<ImportReviewStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline', approved: 'default', rejected: 'destructive', draft: 'secondary',
};

const moduleIcons: Record<string, React.ReactNode> = {
  random_post: <Bot className="h-4 w-4" />,
  featured_rotation: <Star className="h-4 w-4" />,
  stock_suppression: <Package className="h-4 w-4" />,
  import_review: <FileUp className="h-4 w-4" />,
  recently_updated: <RefreshCw className="h-4 w-4" />,
  reseller_markup: <DollarSign className="h-4 w-4" />,
  supplier_discovery: <PackagePlus className="h-4 w-4" />,
  auto_fulfillment: <Truck className="h-4 w-4" />,
  renewal_reminder: <Bell className="h-4 w-4" />,
};

export default function Automation() {
  const { toast } = useToast();
  const [jobChannelFilter, setJobChannelFilter] = useState<string>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [importStatusFilter, setImportStatusFilter] = useState<string>('all');

  useEffect(() => { document.title = 'Automation — Admin — UpgraderCX'; }, []);

  /* ── Queries ── */
  const { data: healthRes, refetch: refetchHealth } = useApiQuery(['automation-health'], () => automationApi.getHealth());
  const health = healthRes?.data;

  const { data: modulesRes, refetch: refetchModules } = useApiQuery(['automation-modules'], () => automationApi.getModules());
  const modules = modulesRes?.data || [];

  const { data: configRes, refetch: refetchConfig } = useApiQuery(['random-post-config'], () => automationApi.getRandomPostConfig());
  const config = configRes?.data;

  const { data: featuredRes, refetch: refetchFeatured } = useApiQuery(['featured-config'], () => automationApi.getFeaturedConfig());
  const featuredConfig = featuredRes?.data;

  const { data: stockRes, refetch: refetchStock } = useApiQuery(['stock-config'], () => automationApi.getStockConfig());
  const stockConfig = stockRes?.data;

  const jobParams: Record<string, unknown> = {};
  if (jobChannelFilter !== 'all') jobParams.channel = jobChannelFilter;
  if (jobStatusFilter !== 'all') jobParams.status = jobStatusFilter;
  if (jobTypeFilter !== 'all') jobParams.type = jobTypeFilter;

  const { data: jobsRes, isLoading: jobsLoading, refetch: refetchJobs } = useApiQuery(
    ['automation-jobs', jobChannelFilter, jobStatusFilter, jobTypeFilter],
    () => automationApi.getJobs(jobParams),
  );

  const { data: importRes, isLoading: importLoading, refetch: refetchImport } = useApiQuery(
    ['import-queue', importStatusFilter],
    () => automationApi.getImportQueue({ status: importStatusFilter !== 'all' ? importStatusFilter : undefined }),
  );

  const { data: markupRes, isLoading: markupLoading } = useApiQuery(['reseller-markup'], () => automationApi.getMarkupPreview());

  /* ── Mutations ── */
  const configMutation = useApiMutation(
    (data: Record<string, unknown>) => automationApi.updateRandomPostConfig(data),
    { onSuccess: () => { toast({ title: 'Config updated' }); refetchConfig(); } },
  );
  const pauseMutation = useApiMutation(
    (paused: boolean) => automationApi.togglePause(paused),
    { onSuccess: (res) => { toast({ title: res.data.is_paused ? 'Automation paused' : 'Automation resumed' }); refetchHealth(); refetchConfig(); } },
  );
  const testRunMutation = useApiMutation(
    (channel: SyncChannel) => automationApi.testRun(channel),
    { onSuccess: (res) => toast({ title: res.data.would_post ? `Would post: ${res.data.product_name}` : `Skipped: ${res.data.skip_reason}` }) },
  );
  const retryMutation = useApiMutation(
    (jobId: number) => automationApi.retryJob(jobId),
    { onSuccess: () => { toast({ title: 'Job requeued' }); refetchJobs(); } },
  );
  const moduleMutation = useApiMutation(
    ({ id, enabled }: { id: string; enabled: boolean }) => automationApi.toggleModule(id, enabled),
    { onSuccess: () => { toast({ title: 'Module updated' }); refetchModules(); } },
  );
  const featuredMutation = useApiMutation(
    (data: Record<string, unknown>) => automationApi.updateFeaturedConfig(data),
    { onSuccess: () => { toast({ title: 'Featured config updated' }); refetchFeatured(); } },
  );
  const triggerRotationMutation = useApiMutation(
    () => automationApi.triggerFeaturedRotation(),
    { onSuccess: (res) => { toast({ title: `Rotated ${res.data.rotated} products` }); refetchJobs(); } },
  );
  const stockMutation = useApiMutation(
    (data: Record<string, unknown>) => automationApi.updateStockConfig(data),
    { onSuccess: () => { toast({ title: 'Stock config updated' }); refetchStock(); } },
  );
  const approveMutation = useApiMutation(
    (id: number) => automationApi.approveImport(id),
    { onSuccess: () => { toast({ title: 'Import approved' }); refetchImport(); } },
  );
  const rejectMutation = useApiMutation(
    (id: number) => automationApi.rejectImport(id),
    { onSuccess: () => { toast({ title: 'Import rejected' }); refetchImport(); } },
  );

  const failedJobs = jobsRes?.data?.filter((j) => j.status === 'failed') || [];
  const pendingImports = (importRes?.data || []).filter((i) => i.status === 'pending').length;

  return (
    <PageScaffold
      title="Automation"
      description="Manage all automated workflows, schedules, and approval queues."
      actions={
        <div className="flex items-center gap-2">
          {pendingImports > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
              <FileUp className="h-3 w-3 mr-1" />{pendingImports} imports pending
            </Badge>
          )}
          <Button
            variant={health?.is_paused ? 'default' : 'outline'}
            size="sm"
            onClick={() => pauseMutation.mutate(!health?.is_paused)}
            disabled={pauseMutation.isPending}
          >
            {health?.is_paused ? <Play className="h-3.5 w-3.5 mr-1" /> : <Pause className="h-3.5 w-3.5 mr-1" />}
            {health?.is_paused ? 'Resume' : 'Pause All'}
          </Button>
          {health?.is_paused && <Badge variant="destructive">Paused</Badge>}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Health Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Success Rate', value: `${health?.success_rate ?? 0}%`, icon: <Activity className="h-4 w-4 text-muted-foreground" /> },
            { label: 'Posts (24h)', value: `${health?.successful_24h ?? 0} / ${health?.total_jobs_24h ?? 0}`, icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> },
            { label: 'Failed (24h)', value: health?.failed_24h ?? 0, icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" /> },
            { label: 'Next Scheduled', value: health?.next_scheduled_at ? timeAgo(health.next_scheduled_at) : 'None', icon: <Timer className="h-4 w-4 text-muted-foreground" /> },
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

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="modules"><Zap className="mr-1 h-3.5 w-3.5" /> Modules</TabsTrigger>
            <TabsTrigger value="random"><Bot className="mr-1 h-3.5 w-3.5" /> Random Post</TabsTrigger>
            <TabsTrigger value="featured"><Star className="mr-1 h-3.5 w-3.5" /> Featured</TabsTrigger>
            <TabsTrigger value="stock"><Package className="mr-1 h-3.5 w-3.5" /> Stock</TabsTrigger>
            <TabsTrigger value="import"><FileUp className="mr-1 h-3.5 w-3.5" /> Import Queue</TabsTrigger>
            <TabsTrigger value="reseller"><DollarSign className="mr-1 h-3.5 w-3.5" /> Reseller</TabsTrigger>
            <TabsTrigger value="history"><History className="mr-1 h-3.5 w-3.5" /> Job Log</TabsTrigger>
          </TabsList>

          {/* ═══════════════ TAB: Modules Overview ═══════════════ */}
          <TabsContent value="modules" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((mod) => (
                <Card key={mod.id} className={!mod.enabled ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {moduleIcons[mod.id]}
                        {mod.name}
                      </CardTitle>
                      <Switch
                        checked={mod.enabled}
                        onCheckedChange={(v) => moduleMutation.mutate({ id: mod.id, enabled: v })}
                      />
                    </div>
                    <CardDescription className="text-xs">{mod.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Last Run</p>
                        <p className="font-medium text-foreground">{timeAgo(mod.last_run_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Jobs (24h)</p>
                        <p className="font-medium text-foreground">{mod.jobs_24h}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Failures</p>
                        <p className={`font-medium ${mod.failures_24h > 0 ? 'text-destructive' : 'text-foreground'}`}>{mod.failures_24h}</p>
                      </div>
                    </div>
                    {mod.next_run_at && (
                      <p className="text-[10px] text-muted-foreground mt-2">Next: {new Date(mod.next_run_at).toLocaleString()}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Random Post ═══════════════ */}
          <TabsContent value="random" className="space-y-4">
            {/* Test Run bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => testRunMutation.mutate('telegram')} disabled={testRunMutation.isPending}>
                <Send className="h-3.5 w-3.5 mr-1" />Test Telegram
              </Button>
              <Button variant="outline" size="sm" onClick={() => testRunMutation.mutate('discord')} disabled={testRunMutation.isPending}>
                <MessageSquare className="h-3.5 w-3.5 mr-1" />Test Discord
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label>Enabled</Label><Switch checked={config?.enabled ?? false} onCheckedChange={(v) => configMutation.mutate({ enabled: v })} /></div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={config?.frequency || 'once_daily'} onValueChange={(v) => configMutation.mutate({ frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="every_6h">Every 6 Hours</SelectItem>
                        <SelectItem value="once_daily">Once Daily</SelectItem>
                        <SelectItem value="twice_daily">Twice Daily</SelectItem>
                        <SelectItem value="three_daily">Three Times Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Slot 1</Label>
                    <Input type="time" defaultValue={config?.time_slots?.[0] || '09:00'} onBlur={(e) => {
                      const slots = [...(config?.time_slots || ['09:00', '18:00'])]; slots[0] = e.target.value;
                      configMutation.mutate({ time_slots: slots });
                    }} />
                  </div>
                  {(config?.frequency === 'twice_daily' || config?.frequency === 'three_daily') && (
                    <div className="space-y-2"><Label>Time Slot 2</Label><Input type="time" defaultValue={config?.time_slots?.[1] || '14:00'} onBlur={(e) => { const slots = [...(config?.time_slots || ['09:00', '14:00', '18:00'])]; slots[1] = e.target.value; configMutation.mutate({ time_slots: slots }); }} /></div>
                  )}
                  {config?.frequency === 'three_daily' && (
                    <div className="space-y-2"><Label>Time Slot 3</Label><Input type="time" defaultValue={config?.time_slots?.[2] || '18:00'} onBlur={(e) => { const slots = [...(config?.time_slots || ['09:00', '14:00', '18:00'])]; slots[2] = e.target.value; configMutation.mutate({ time_slots: slots }); }} /></div>
                  )}
                  <div className="space-y-2"><Label>Timezone</Label><Input defaultValue={config?.timezone || 'UTC'} onBlur={(e) => configMutation.mutate({ timezone: e.target.value })} /></div>
                  <div className="space-y-2">
                    <Label>Channels</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><Switch checked={config?.channels?.telegram ?? true} onCheckedChange={(v) => configMutation.mutate({ channels: { ...config?.channels, telegram: v } })} /><span className="text-sm">Telegram</span></div>
                      <div className="flex items-center gap-2"><Switch checked={config?.channels?.discord ?? true} onCheckedChange={(v) => configMutation.mutate({ channels: { ...config?.channels, discord: v } })} /><span className="text-sm">Discord</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Eligibility & Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label>Require In Stock</Label><Switch checked={config?.eligibility?.require_in_stock ?? true} onCheckedChange={(v) => configMutation.mutate({ eligibility: { ...config?.eligibility, require_in_stock: v } })} /></div>
                  <div className="flex items-center justify-between"><Label>Require Approved</Label><Switch checked={config?.eligibility?.require_approved ?? true} onCheckedChange={(v) => configMutation.mutate({ eligibility: { ...config?.eligibility, require_approved: v } })} /></div>
                  <div className="flex items-center justify-between"><Label>Require Image</Label><Switch checked={config?.eligibility?.require_image ?? false} onCheckedChange={(v) => configMutation.mutate({ eligibility: { ...config?.eligibility, require_image: v } })} /></div>
                  <div className="space-y-2">
                    <Label>Cooldown (days)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} max={90} className="w-24" defaultValue={config?.eligibility?.cooldown_days ?? 7} onBlur={(e) => configMutation.mutate({ eligibility: { ...config?.eligibility, cooldown_days: parseInt(e.target.value) || 7 } })} />
                      <span className="text-xs text-muted-foreground">days cooldown</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Min Price</Label><Input type="number" step="0.01" placeholder="Any" defaultValue={config?.eligibility?.min_price ?? ''} onBlur={(e) => configMutation.mutate({ eligibility: { ...config?.eligibility, min_price: e.target.value ? parseFloat(e.target.value) : undefined } })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Max Price</Label><Input type="number" step="0.01" placeholder="Any" defaultValue={config?.eligibility?.max_price ?? ''} onBlur={(e) => configMutation.mutate({ eligibility: { ...config?.eligibility, max_price: e.target.value ? parseFloat(e.target.value) : undefined } })} /></div>
                  </div>
                  <div className="flex items-center justify-between"><Label>Price Check Before Post</Label><Switch checked={config?.safety?.price_check_before_post ?? true} onCheckedChange={(v) => configMutation.mutate({ safety: { ...config?.safety, price_check_before_post: v } })} /></div>
                  <div className="flex items-center justify-between"><Label>Compliance Gate</Label><Switch checked={config?.safety?.compliance_gate ?? true} onCheckedChange={(v) => configMutation.mutate({ safety: { ...config?.safety, compliance_gate: v } })} /></div>
                  <div className="flex items-center justify-between"><Label>Skip Flagged</Label><Switch checked={config?.safety?.skip_flagged ?? true} onCheckedChange={(v) => configMutation.mutate({ safety: { ...config?.safety, skip_flagged: v } })} /></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Featured Rotation ═══════════════ */}
          <TabsContent value="featured" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" />Rotation Settings</CardTitle>
                  <CardDescription>Automatically cycle which products appear as "Featured"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><Label>Enabled</Label><Switch checked={featuredConfig?.enabled ?? false} onCheckedChange={(v) => featuredMutation.mutate({ enabled: v })} /></div>
                  <div className="space-y-2">
                    <Label>Rotation Interval</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={168} className="w-24" defaultValue={featuredConfig?.rotation_interval_hours ?? 24} onBlur={(e) => featuredMutation.mutate({ rotation_interval_hours: parseInt(e.target.value) || 24 })} />
                      <span className="text-xs text-muted-foreground">hours</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Featured Products</Label>
                    <Input type="number" min={1} max={20} className="w-24" defaultValue={featuredConfig?.max_featured ?? 6} onBlur={(e) => featuredMutation.mutate({ max_featured: parseInt(e.target.value) || 6 })} />
                  </div>
                  <div className="flex items-center justify-between"><Label>Require In Stock</Label><Switch checked={featuredConfig?.require_in_stock ?? true} onCheckedChange={(v) => featuredMutation.mutate({ require_in_stock: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Require Image</Label><Switch checked={featuredConfig?.require_image ?? true} onCheckedChange={(v) => featuredMutation.mutate({ require_image: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Distribute by Category</Label><Switch checked={featuredConfig?.category_distribution ?? true} onCheckedChange={(v) => featuredMutation.mutate({ category_distribution: v })} /></div>
                  <div className="space-y-2">
                    <Label>Exclude Recently Unfeatured</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={0} max={30} className="w-24" defaultValue={featuredConfig?.exclude_recently_unfeatured_days ?? 3} onBlur={(e) => featuredMutation.mutate({ exclude_recently_unfeatured_days: parseInt(e.target.value) || 3 })} />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between"><Label>Notify on Rotation</Label><Switch checked={featuredConfig?.notify_on_rotation ?? true} onCheckedChange={(v) => featuredMutation.mutate({ notify_on_rotation: v })} /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manual Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => triggerRotationMutation.mutate()} disabled={triggerRotationMutation.isPending}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />Trigger Rotation Now
                  </Button>
                  <p className="text-xs text-muted-foreground">This will immediately rotate featured products based on current settings.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Stock Suppression ═══════════════ */}
          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" />Stock Management Automation</CardTitle>
                <CardDescription>Auto-hide, badge, and restore products based on stock levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Zero Stock Actions</h4>
                    <div className="flex items-center justify-between"><Label>Auto-hide at zero</Label><Switch checked={stockConfig?.auto_hide_at_zero ?? true} onCheckedChange={(v) => stockMutation.mutate({ auto_hide_at_zero: v })} /></div>
                    <div className="flex items-center justify-between"><Label>Disable channel sync at zero</Label><Switch checked={stockConfig?.auto_disable_sync_at_zero ?? true} onCheckedChange={(v) => stockMutation.mutate({ auto_disable_sync_at_zero: v })} /></div>
                    <div className="flex items-center justify-between"><Label>Auto-restore on restock</Label><Switch checked={stockConfig?.auto_restore_on_restock ?? true} onCheckedChange={(v) => stockMutation.mutate({ auto_restore_on_restock: v })} /></div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Low Stock</h4>
                    <div className="space-y-2">
                      <Label>Low Stock Threshold</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" min={0} className="w-24" defaultValue={stockConfig?.low_stock_threshold ?? 5} onBlur={(e) => stockMutation.mutate({ low_stock_threshold: parseInt(e.target.value) || 5 })} />
                        <span className="text-xs text-muted-foreground">units</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between"><Label>Show low stock badge</Label><Switch checked={stockConfig?.low_stock_badge ?? true} onCheckedChange={(v) => stockMutation.mutate({ low_stock_badge: v })} /></div>
                    <div className="flex items-center justify-between"><Label>Notify on low stock</Label><Switch checked={stockConfig?.notify_admin_on_low_stock ?? true} onCheckedChange={(v) => stockMutation.mutate({ notify_admin_on_low_stock: v })} /></div>
                    <div className="flex items-center justify-between"><Label>Notify on out of stock</Label><Switch checked={stockConfig?.notify_admin_on_out_of_stock ?? true} onCheckedChange={(v) => stockMutation.mutate({ notify_admin_on_out_of_stock: v })} /></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Import Queue ═══════════════ */}
          <TabsContent value="import" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={importStatusFilter} onValueChange={setImportStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchImport()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Imported</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : (importRes?.data || []).length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No imports in queue</TableCell></TableRow>
                    ) : (
                      (importRes?.data || []).map((item) => (
                        <TableRow key={item.id} className={item.status === 'pending' ? 'bg-amber-500/5' : item.status === 'rejected' ? 'bg-destructive/5' : ''}>
                          <TableCell className="font-medium text-sm text-foreground">{item.product_name}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{item.source}</Badge></TableCell>
                          <TableCell className="text-sm">{item.price !== undefined ? `$${item.price.toFixed(2)}` : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.category_name || '—'}</TableCell>
                          <TableCell>
                            {item.field_warnings.length > 0 ? (
                              <div className="space-y-0.5">
                                {item.field_warnings.map((w, i) => (
                                  <p key={i} className="text-[10px] text-amber-600">⚠ {w}</p>
                                ))}
                              </div>
                            ) : <span className="text-xs text-muted-foreground">None</span>}
                          </TableCell>
                          <TableCell><Badge variant={importStatusVariant[item.status]} className="text-[10px]">{item.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</TableCell>
                          <TableCell>
                            {(item.status === 'pending' || item.status === 'draft') && (
                              <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending}>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => rejectMutation.mutate(item.id)} disabled={rejectMutation.isPending}>
                                  <X className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            )}
                            {item.reviewed_by && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">by {item.reviewed_by}</p>
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

          {/* ═══════════════ TAB: Reseller Markup ═══════════════ */}
          <TabsContent value="reseller" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Margin Analysis</CardTitle>
                <CardDescription>Preview base cost vs website price and markup percentages</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Base Cost</TableHead>
                      <TableHead>Website Price</TableHead>
                      <TableHead>Markup %</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Suggested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {markupLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : (markupRes?.data || []).length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No products with cost data</TableCell></TableRow>
                    ) : (
                      (markupRes?.data || []).map((item) => (
                        <TableRow key={item.product_id}>
                          <TableCell>
                            <div className="text-xs">
                              <span className="font-medium text-foreground">{item.product_name}</span>
                              <p className="text-[10px] text-muted-foreground">#{item.product_id}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">${item.base_cost.toFixed(2)}</TableCell>
                          <TableCell className="text-sm font-medium text-foreground">${item.website_price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={item.markup_percent < 30 ? 'destructive' : item.markup_percent < 50 ? 'outline' : 'default'} className="text-[10px]">
                              {item.markup_percent.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">${item.margin_amount.toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.suggested_price ? `$${item.suggested_price.toFixed(2)}` : '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Job Log ═══════════════ */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="random_post">Random Post</SelectItem>
                  <SelectItem value="featured_rotation">Featured Rotation</SelectItem>
                  <SelectItem value="stock_suppression">Stock Suppression</SelectItem>
                  <SelectItem value="supplier_discovery">Supplier Auto-Discovery</SelectItem>
                  <SelectItem value="auto_fulfillment">Auto-Fulfillment</SelectItem>
                  <SelectItem value="renewal_reminder">Renewal Reminder</SelectItem>
                  <SelectItem value="import_review">Import Review</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobChannelFilter} onValueChange={setJobChannelFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchJobs()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
              {failedJobs.length > 0 && <Badge variant="destructive">{failedJobs.length} failed</Badge>}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 7 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : (jobsRes?.data || []).length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No jobs found</TableCell></TableRow>
                    ) : (
                      (jobsRes?.data || []).map((job) => {
                        const cfg = jobStatusConfig[job.status];
                        return (
                          <TableRow key={job.id} className={job.status === 'failed' ? 'bg-destructive/5' : ''}>
                            <TableCell className="text-xs text-muted-foreground">{timeAgo(job.scheduled_at || job.created_at)}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{jobTypeLabels[job.type] || job.type}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{job.channel || '—'}</TableCell>
                            <TableCell className="text-xs font-medium text-foreground">{job.product_name || '—'}</TableCell>
                            <TableCell><Badge variant={cfg.variant} className="text-[10px] gap-1">{cfg.icon}{cfg.label}</Badge></TableCell>
                            <TableCell className="text-xs max-w-[200px] truncate">
                              {job.error_message && <span className="text-destructive">{job.error_message}</span>}
                              {job.skip_reason && <span className="text-muted-foreground">{job.skip_reason}</span>}
                            </TableCell>
                            <TableCell>
                              {job.status === 'failed' && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => retryMutation.mutate(job.id)} disabled={retryMutation.isPending}>
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
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
