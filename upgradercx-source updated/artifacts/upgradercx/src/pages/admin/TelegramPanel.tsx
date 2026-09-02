import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { telegramApi } from '@/api/telegram.api';
import { ChannelStatusCard, PostPreview, SyncActivityFeed } from '@/components/integrations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { TelegramCommandStatus, TelegramCommandName } from '@/types';
import {
  Send, Loader2, Eye, Zap, Terminal, ArrowLeft, RefreshCw,
  Shield, Bell, Clock, CheckCircle, XCircle, AlertTriangle,
  Lock, Unlock, Copy, ExternalLink, Bot, MessageSquare,
  DollarSign, Package, LifeBuoy, Settings, FileText, History,
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

const statusVariant: Record<TelegramCommandStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  executed: 'default',
  failed: 'destructive',
  rejected: 'destructive',
  pending_approval: 'outline',
};

const categoryIcons: Record<string, React.ReactNode> = {
  pricing: <DollarSign className="h-3 w-3" />,
  product: <Package className="h-3 w-3" />,
  sync: <RefreshCw className="h-3 w-3" />,
  support: <LifeBuoy className="h-3 w-3" />,
  system: <Settings className="h-3 w-3" />,
};

export default function TelegramPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [botToken, setBotToken] = useState('');
  const [previewProductId, setPreviewProductId] = useState(1);
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');
  const [logCommandFilter, setLogCommandFilter] = useState<string>('all');

  useEffect(() => { document.title = 'Telegram Integration — Admin — UpgraderCX'; }, []);

  /* ── Queries ── */
  const { data: configRes, refetch: refetchConfig } = useApiQuery(
    ['telegram-config'], () => telegramApi.getConfig(),
  );
  const config = configRes?.data;

  const { data: postsRes, isLoading: postsLoading } = useApiQuery(
    ['telegram-posts'], () => telegramApi.getPostHistory(),
  );

  const { data: previewRes, isLoading: previewLoading } = useApiQuery(
    ['telegram-preview', previewProductId], () => telegramApi.previewPost(previewProductId),
  );

  const { data: permissionsRes, refetch: refetchPerms } = useApiQuery(
    ['telegram-permissions'], () => telegramApi.getCommandPermissions(),
  );
  const permissions = permissionsRes?.data || [];

  const { data: commandLogRes, isLoading: logLoading, refetch: refetchLog } = useApiQuery(
    ['telegram-command-log', logStatusFilter, logCommandFilter],
    () => telegramApi.getCommandLog({
      status: logStatusFilter !== 'all' ? logStatusFilter : undefined,
      command: logCommandFilter !== 'all' ? logCommandFilter : undefined,
      per_page: 20,
    }),
  );
  const commandLog = commandLogRes?.data || [];

  const { data: alertRes, refetch: refetchAlerts } = useApiQuery(
    ['telegram-alerts'], () => telegramApi.getAlertConfig(),
  );
  const alertConfig = alertRes?.data;

  /* ── Mutations ── */
  const testMutation = useApiMutation(() => telegramApi.testConnection(), {
    onSuccess: (res) => toast({ title: res.data.success ? 'Connection OK' : 'Connection failed' }),
  });
  const tokenMutation = useApiMutation((token: string) => telegramApi.setBotToken(token), {
    onSuccess: () => { toast({ title: 'Bot token saved' }); refetchConfig(); setBotToken(''); },
  });
  const configMutation = useApiMutation((data: Record<string, unknown>) => telegramApi.updateConfig(data), {
    onSuccess: () => { toast({ title: 'Settings updated' }); refetchConfig(); },
  });
  const pushMutation = useApiMutation((productId: number) => telegramApi.pushProduct(productId), {
    onSuccess: () => toast({ title: 'Product push queued' }),
  });
  const retryMutation = useApiMutation((postId: number) => telegramApi.retryPost(postId), {
    onSuccess: () => toast({ title: 'Retry queued' }),
  });
  const permMutation = useApiMutation(
    ({ command, data }: { command: string; data: Record<string, unknown> }) =>
      telegramApi.updateCommandPermission(command, data),
    { onSuccess: () => { toast({ title: 'Permission updated' }); refetchPerms(); } },
  );
  const alertMutation = useApiMutation(
    (data: Record<string, boolean>) => telegramApi.updateAlertConfig(data),
    { onSuccess: () => { toast({ title: 'Alert settings updated' }); refetchAlerts(); } },
  );

  const connectionStatus = config?.bot_token_set ? (config.channel_id ? 'connected' : 'error') : 'disconnected';
  const failedCommands = commandLog.filter((l) => l.status === 'failed' || l.status === 'rejected').length;
  const pendingApprovals = commandLog.filter((l) => l.status === 'pending_approval').length;

  return (
    <PageScaffold
      title="Telegram Integration"
      description="Configure bot, manage admin commands, and control notifications."
      actions={
        <div className="flex items-center gap-2">
          {pendingApprovals > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
              <Clock className="h-3 w-3 mr-1" />{pendingApprovals} pending
            </Badge>
          )}
          {failedCommands > 0 && (
            <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{failedCommands} failed</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/integrations')}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status */}
        <ChannelStatusCard
          name="Telegram Bot"
          icon={<Send className="h-5 w-5" />}
          status={connectionStatus}
          subtitle={config?.bot_username ? `@${config.bot_username}` : undefined}
          lastSync={postsRes?.data?.find((p) => p.status === 'sent')?.posted_at}
          autoSync={config?.auto_sync_enabled}
          errorCount={postsRes?.data?.filter((p) => p.status === 'failed').length}
          onTest={() => testMutation.mutate(undefined)}
          testing={testMutation.isPending}
        />

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="settings"><Settings className="mr-1 h-3.5 w-3.5" /> Settings</TabsTrigger>
            <TabsTrigger value="commands"><Terminal className="mr-1 h-3.5 w-3.5" /> Commands</TabsTrigger>
            <TabsTrigger value="permissions"><Shield className="mr-1 h-3.5 w-3.5" /> Permissions</TabsTrigger>
            <TabsTrigger value="log"><History className="mr-1 h-3.5 w-3.5" /> Command Log</TabsTrigger>
            <TabsTrigger value="alerts"><Bell className="mr-1 h-3.5 w-3.5" /> Alerts</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="mr-1 h-3.5 w-3.5" /> Preview</TabsTrigger>
            <TabsTrigger value="history"><FileText className="mr-1 h-3.5 w-3.5" /> Post History</TabsTrigger>
          </TabsList>

          {/* ═══════════════ TAB: Settings ═══════════════ */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bot Config */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bot Configuration</CardTitle>
                  <CardDescription>Set your Telegram Bot API token from @BotFather</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bot Token</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder={config?.bot_token_set ? '••••••••••••••' : 'Enter bot token'}
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                      />
                      <Button size="sm" disabled={!botToken || tokenMutation.isPending} onClick={() => tokenMutation.mutate(botToken)}>
                        {tokenMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                        Save
                      </Button>
                    </div>
                    {config?.bot_token_set && <Badge variant="outline" className="text-xs">Token configured</Badge>}
                    <p className="text-[10px] text-muted-foreground">Token is stored server-side only. Never exposed to frontend.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Channel / Group ID</Label>
                    <Input
                      placeholder="-1001234567890"
                      defaultValue={config?.channel_id || ''}
                      onBlur={(e) => e.target.value !== (config?.channel_id || '') && configMutation.mutate({ channel_id: e.target.value })}
                    />
                    {config?.channel_title && <p className="text-xs text-muted-foreground">{config.channel_title}</p>}
                  </div>
                  <Separator />
                  {/* Webhook URL */}
                  <div className="space-y-2">
                    <Label className="text-xs">Webhook Callback URL</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={config?.webhook_url || 'Not configured'} className="font-mono text-xs bg-muted" />
                      <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => {
                        navigator.clipboard.writeText(config?.webhook_url || '');
                        toast({ title: 'Copied to clipboard' });
                      }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Register this URL with <code className="bg-muted px-1 rounded">@BotFather</code> → <code className="bg-muted px-1 rounded">setWebhook</code> or via Telegram API.
                    </p>
                  </div>
                  <Separator />
                  {/* Admin Chat IDs */}
                  <div className="space-y-2">
                    <Label className="text-xs">Authorized Admin Chat IDs</Label>
                    <Input
                      placeholder="123456789, 987654321"
                      defaultValue={config?.admin_chat_ids?.join(', ') || ''}
                      onBlur={(e) => configMutation.mutate({ admin_chat_ids: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                    />
                    <p className="text-[10px] text-muted-foreground">Only these Telegram users can execute admin commands. Comma-separated.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Sync Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sync Settings</CardTitle>
                  <CardDescription>Control how product updates are posted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-sync on price change</Label>
                    <Switch checked={config?.auto_sync_enabled ?? false} onCheckedChange={(v) => configMutation.mutate({ auto_sync_enabled: v })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Post Format</Label>
                    <Select value={config?.post_format || 'detailed'} onValueChange={(v) => configMutation.mutate({ post_format: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="custom">Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between"><Label>Include Image</Label><Switch checked={config?.include_image ?? true} onCheckedChange={(v) => configMutation.mutate({ include_image: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Include Price</Label><Switch checked={config?.include_price ?? true} onCheckedChange={(v) => configMutation.mutate({ include_price: v })} /></div>
                  <div className="flex items-center justify-between"><Label>Include Link</Label><Switch checked={config?.include_link ?? true} onCheckedChange={(v) => configMutation.mutate({ include_link: v })} /></div>
                  {config?.post_format === 'custom' && (
                    <div className="space-y-2">
                      <Label>Custom Template</Label>
                      <Textarea
                        placeholder="Use {name}, {price}, {compare_price}, {link}, {description}"
                        defaultValue={config?.custom_template || ''}
                        rows={4}
                        onBlur={(e) => configMutation.mutate({ custom_template: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Commands Help ═══════════════ */}
          <TabsContent value="commands" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Terminal className="h-4 w-4" /> Admin Bot Commands</CardTitle>
                <CardDescription>
                  Commands available when messaging the bot directly. All commands are validated by Laravel before execution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['pricing', 'product', 'sync', 'support', 'system'].map((cat) => {
                  const cmds = permissions.filter((p) => p.category === cat);
                  if (cmds.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                        {categoryIcons[cat]} {cat}
                      </h3>
                      <div className="space-y-1.5">
                        {cmds.map((cmd) => (
                          <div key={cmd.command} className={`flex items-start gap-3 rounded-md border p-3 text-sm ${!cmd.enabled ? 'opacity-50' : ''}`}>
                            <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs shrink-0">{cmd.usage}</code>
                            <span className="text-muted-foreground flex-1">{cmd.description}</span>
                            <div className="flex gap-1 shrink-0">
                              {!cmd.enabled && <Badge variant="secondary" className="text-[9px]">Disabled</Badge>}
                              {cmd.requires_approval && <Badge variant="outline" className="text-[9px]"><Shield className="h-2 w-2 mr-0.5" />Approval</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Command flow diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Command Execution Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    'Admin sends command in Telegram',
                    '→ Bot receives via webhook',
                    '→ Laravel validates user & permissions',
                    '→ Laravel executes action on MySQL',
                    '→ Website updated immediately',
                    '→ Cross-channel sync triggered',
                    '→ Result sent back to Telegram',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <div className="h-0.5 w-3 bg-primary" />}
                      <div className="rounded-md border bg-muted px-2.5 py-1.5 text-[11px] font-medium">{step}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Permissions ═══════════════ */}
          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Command Permissions</CardTitle>
                <CardDescription>Enable/disable individual commands and set approval requirements</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Command</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Requires Approval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((perm) => (
                      <TableRow key={perm.command}>
                        <TableCell><code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">/{perm.command}</code></TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{categoryIcons[perm.category]}<span className="ml-1 capitalize">{perm.category}</span></Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{perm.description}</TableCell>
                        <TableCell>
                          <Switch
                            checked={perm.enabled}
                            onCheckedChange={(v) => permMutation.mutate({ command: perm.command, data: { enabled: v } })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={perm.requires_approval}
                            onCheckedChange={(v) => permMutation.mutate({ command: perm.command, data: { requires_approval: v } })}
                            disabled={!perm.enabled}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Command Log ═══════════════ */}
          <TabsContent value="log" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
              <Select value={logCommandFilter} onValueChange={setLogCommandFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Command" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Commands</SelectItem>
                  {['price', 'enable', 'disable', 'feature', 'sync', 'syncall', 'draft', 'ticket'].map((c) => (
                    <SelectItem key={c} value={c}>/{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetchLog()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Command</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result / Error</TableHead>
                      <TableHead>Value Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 7 }).map((__, j) => (<TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>))}</TableRow>
                      ))
                    ) : commandLog.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No command log entries</TableCell></TableRow>
                    ) : (
                      commandLog.map((entry) => (
                        <TableRow key={entry.id} className={
                          entry.status === 'rejected' ? 'bg-destructive/5' :
                          entry.status === 'pending_approval' ? 'bg-amber-500/5' :
                          entry.status === 'failed' ? 'bg-destructive/5' : ''
                        }>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo(entry.created_at)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <span className="font-medium text-foreground">@{entry.telegram_username || 'unknown'}</span>
                              <p className="text-[10px] text-muted-foreground">ID: {entry.telegram_user_id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{entry.raw_input}</code>
                          </TableCell>
                          <TableCell>
                            {entry.product_name ? (
                              <div className="text-xs">
                                <span className="font-medium text-foreground">{entry.product_name}</span>
                                <p className="text-[10px] text-muted-foreground">#{entry.product_id}</p>
                              </div>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[entry.status]} className="text-[10px]">
                              {entry.status === 'executed' && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                              {entry.status === 'rejected' && <Lock className="h-2.5 w-2.5 mr-0.5" />}
                              {entry.status === 'failed' && <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                              {entry.status === 'pending_approval' && <Clock className="h-2.5 w-2.5 mr-0.5" />}
                              {entry.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px]">
                            {entry.error_message ? (
                              <span className="text-destructive">{entry.error_message}</span>
                            ) : entry.result_message ? (
                              <span className="text-muted-foreground">{entry.result_message}</span>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            {entry.old_value && entry.new_value ? (
                              <div className="text-xs">
                                <span className="text-muted-foreground line-through">${entry.old_value}</span>
                                <span className="mx-1">→</span>
                                <span className="font-medium text-foreground">${entry.new_value}</span>
                              </div>
                            ) : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ TAB: Alerts ═══════════════ */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Automation Alerts</CardTitle>
                  <CardDescription>Choose which system events trigger Telegram notifications to admin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { key: 'new_ticket', label: 'New Support Ticket', desc: 'Customer creates a support ticket on the website', icon: <LifeBuoy className="h-4 w-4" /> },
                    { key: 'ticket_high_priority', label: 'High Priority Ticket', desc: 'High/urgent priority ticket created', icon: <AlertTriangle className="h-4 w-4" /> },
                    { key: 'order_completed', label: 'Order Completed', desc: 'Customer completes a purchase', icon: <CheckCircle className="h-4 w-4" /> },
                    { key: 'order_failed', label: 'Order Failed', desc: 'Payment or order processing failure', icon: <XCircle className="h-4 w-4" /> },
                  ] as const).map(({ key, label, desc, icon }) => (
                    <div key={key} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">{icon}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={(alertConfig as any)?.[key] ?? false}
                        onCheckedChange={(v) => alertMutation.mutate({ [key]: v })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> System Alerts</CardTitle>
                  <CardDescription>Internal system event notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { key: 'price_approval_needed', label: 'Price Approval Needed', desc: 'A price change exceeds threshold and needs approval', icon: <DollarSign className="h-4 w-4" /> },
                    { key: 'sync_failed', label: 'Sync Failed', desc: 'Channel sync job failed', icon: <RefreshCw className="h-4 w-4" /> },
                    { key: 'low_stock', label: 'Low Stock Alert', desc: 'Product stock falls below threshold', icon: <Package className="h-4 w-4" /> },
                    { key: 'automation_triggered', label: 'Automation Triggered', desc: 'Random post or scheduled automation executed', icon: <Zap className="h-4 w-4" /> },
                  ] as const).map(({ key, label, desc, icon }) => (
                    <div key={key} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">{icon}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={(alertConfig as any)?.[key] ?? false}
                        onCheckedChange={(v) => alertMutation.mutate({ [key]: v })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ TAB: Preview ═══════════════ */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Post Preview</CardTitle>
                <CardDescription>See how a product will appear in Telegram before pushing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="space-y-1 flex-1">
                    <Label>Product ID</Label>
                    <Input type="number" value={previewProductId} onChange={(e) => setPreviewProductId(Number(e.target.value))} />
                  </div>
                  <Button size="sm" variant="outline" disabled={previewLoading}><Eye className="h-3.5 w-3.5 mr-1" />Preview</Button>
                  <Button size="sm" disabled={pushMutation.isPending} onClick={() => pushMutation.mutate(previewProductId)}>
                    <Zap className="h-3.5 w-3.5 mr-1" />Push Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            {previewRes?.data && (
              <PostPreview
                channel="telegram"
                productName={previewRes.data.product_name}
                previewText={previewRes.data.preview_text}
                price={previewRes.data.price}
                comparePrice={previewRes.data.compare_price}
                imageUrl={previewRes.data.preview_image}
              />
            )}
          </TabsContent>

          {/* ═══════════════ TAB: Post History ═══════════════ */}
          <TabsContent value="history">
            <SyncActivityFeed
              posts={postsRes?.data || []}
              loading={postsLoading}
              onRetry={(id) => retryMutation.mutate(id)}
              title="Telegram Post History"
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageScaffold>
  );
}
