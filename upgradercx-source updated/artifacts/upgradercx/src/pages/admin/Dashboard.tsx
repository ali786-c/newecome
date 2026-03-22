import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Users, DollarSign, Send, MessageSquare,
  FileText, Bot, Plus, RefreshCw, Settings, Eye, MoreHorizontal,
  ExternalLink, Search, LifeBuoy, AlertTriangle, CheckCircle2,
  XCircle, Download, Activity, Zap, Star, TrendingUp, Clock,
} from 'lucide-react';
import { StatCard, StatusBadge, DataWidget, QuickAction, AlertItem } from '@/components/dashboard';
import { SupplierBalanceWidget } from '@/components/dashboard/SupplierBalanceWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

/* ── Mock data ── */

const stats = {
  totalProducts: 24,
  activeProducts: 18,
  inactiveProducts: 6,
  totalOrders: 156,
  ordersToday: 12,
  revenue: '$4,280',
  totalCustomers: 89,
  newCustomersWeek: 7,
  openTickets: 3,
  pendingImports: 2,
  syncSuccessRate: 96,
  failedJobs24h: 1,
};

const channelHealth = [
  { name: 'Telegram', provider: 'telegram', status: 'connected' as const, lastSync: '2 min ago', postsToday: 4, failedToday: 0, icon: Send },
  { name: 'Discord', provider: 'discord', status: 'error' as const, lastSync: '3 hours ago', postsToday: 0, failedToday: 1, icon: MessageSquare },
];

const recentOrders = [
  { id: 'ORD-00156', customer: 'Jane D.', product: 'Office 365', status: 'completed' as const, total: '$22.99', date: '10 min ago' },
  { id: 'ORD-00155', customer: 'Bob M.', product: 'VPN Premium', status: 'processing' as const, total: '$34.99', date: '25 min ago' },
  { id: 'ORD-00154', customer: 'Alice K.', product: 'Adobe CC', status: 'pending' as const, total: '$54.99', date: '1 hour ago' },
  { id: 'ORD-00153', customer: 'Tom R.', product: 'Dev Tools Pro', status: 'completed' as const, total: '$19.99', date: '2 hours ago' },
  { id: 'ORD-00152', customer: 'Sara L.', product: 'Cloud Storage', status: 'cancelled' as const, total: '$9.99', date: '3 hours ago' },
];

const recentPriceChanges = [
  { id: 1, product: 'Office 365 Business', from: '$24.99', to: '$22.99', source: 'Admin', date: '2 hours ago' },
  { id: 2, product: 'Adobe CC License', from: '$49.99', to: '$54.99', source: 'Discord !price', date: '5 hours ago' },
  { id: 3, product: 'VPN Premium 1yr', from: '$39.99', to: '$34.99', source: 'Admin', date: '1 day ago' },
];

const openTickets = [
  { id: 'TKT-0089', subject: 'License key not received', customer: 'Alice K.', priority: 'high' as const, created: '45 min ago', notified: ['discord'] },
  { id: 'TKT-0088', subject: 'Billing question', customer: 'Bob M.', priority: 'medium' as const, created: '2 hours ago', notified: ['discord', 'telegram'] },
  { id: 'TKT-0087', subject: 'Product upgrade help', customer: 'Sara L.', priority: 'low' as const, created: '5 hours ago', notified: ['discord'] },
];

const automationModules = [
  { name: 'Random Posting', enabled: true, lastRun: '2 min ago', jobs24h: 4, failures: 0 },
  { name: 'Featured Rotation', enabled: true, lastRun: '6 hours ago', jobs24h: 1, failures: 0 },
  { name: 'Stock Suppression', enabled: true, lastRun: '30 min ago', jobs24h: 3, failures: 0 },
  { name: 'Import Queue', enabled: true, lastRun: '1 hour ago', jobs24h: 2, failures: 0 },
];

const alerts = [
  { title: 'Discord sync failed', description: 'Connection timeout — last successful sync 3 hours ago.', severity: 'critical' as const, timestamp: '3 hours ago' },
  { title: '2 imports pending review', description: 'Supplier products awaiting admin approval in Import Queue.', severity: 'warning' as const, timestamp: '1 hour ago' },
  { title: '3 open tickets', description: '1 high-priority ticket unresolved (45 min).', severity: 'warning' as const, timestamp: '45 min ago' },
  { title: 'Automation healthy', description: 'All 4 modules running — 96% success rate over 24h.', severity: 'success' as const, timestamp: '2 min ago' },
];

const orderStatusMap: Record<string, 'success' | 'warning' | 'info' | 'error' | 'neutral'> = {
  completed: 'success', processing: 'info', pending: 'warning', cancelled: 'error', refunded: 'neutral',
};

const priorityColors: Record<string, string> = {
  high: 'text-destructive', medium: 'text-amber-500', low: 'text-muted-foreground',
};

/* ── Component ── */

export default function AdminDashboard() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Admin Overview — UpgraderCX'; }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">Operational health, tickets, sync status, and quick actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search orders, products..." className="w-64 pl-9" />
          </div>
          <Button variant="outline" size="icon" title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue (30d)" value={stats.revenue} icon={DollarSign} trend={{ value: '12%', positive: true }} />
        <StatCard title="Orders Today" value={stats.ordersToday} subtitle={`${stats.totalOrders} total`} icon={ShoppingCart} trend={{ value: '18%', positive: true }} />
        <StatCard title="Open Tickets" value={stats.openTickets} subtitle="1 high priority" icon={LifeBuoy} />
        <StatCard title="Sync Success" value={`${stats.syncSuccessRate}%`} subtitle={stats.failedJobs24h > 0 ? `${stats.failedJobs24h} failed (24h)` : 'All healthy'} icon={Activity} />
      </div>

      {/* ── Quick Actions (Operational) ── */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        <QuickAction label="Add Product" icon={Plus} onClick={() => navigate('/admin/products')} />
        <QuickAction label="View Tickets" icon={LifeBuoy} onClick={() => navigate('/admin/tickets')} />
        <QuickAction label="Sync Dashboard" icon={RefreshCw} onClick={() => navigate('/admin/sync-logs')} />
        <QuickAction label="Import Products" icon={Download} onClick={() => navigate('/admin/supplier-import')} />
        <QuickAction label="Automation" icon={Bot} onClick={() => navigate('/admin/automation')} />
        <QuickAction label="Settings" icon={Settings} onClick={() => navigate('/admin/settings')} />
      </div>

      <Separator />

      {/* ── Row: Channel Health + Open Tickets ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Channel Health */}
        <DataWidget
          title="Channel Health"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/sync-logs')}>Details <ExternalLink className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            {channelHealth.map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.provider} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">Last sync: {ch.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <p className="text-foreground">{ch.postsToday} posts today</p>
                      {ch.failedToday > 0 && <p className="text-destructive">{ch.failedToday} failed</p>}
                    </div>
                    <StatusBadge
                      label={ch.status === 'connected' ? 'Healthy' : 'Error'}
                      variant={ch.status === 'connected' ? 'success' : 'error'}
                      pulse={ch.status === 'error'}
                    />
                  </div>
                </div>
              );
            })}

            {/* Operational model note */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-3 px-4">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">Source of truth:</span> Website → Laravel backend.
                  Telegram & Discord are notification/sync targets. Admin commands from chat write back through Laravel validation.
                  All actions are queued and logged.
                </p>
              </CardContent>
            </Card>
          </div>
        </DataWidget>

        {/* Open Tickets + Notification Status */}
        <DataWidget
          title="Open Tickets"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/tickets')}>All Tickets <ExternalLink className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            {openTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <LifeBuoy className={`h-4 w-4 ${priorityColors[t.priority]}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.id} · {t.customer} · {t.created}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.notified.map((ch) => (
                    <Badge key={ch} variant="outline" className="text-[9px] gap-0.5 px-1.5">
                      {ch === 'discord' ? <MessageSquare className="h-2.5 w-2.5" /> : <Send className="h-2.5 w-2.5" />}
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DataWidget>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SupplierBalanceWidget />
        </div>
        <div className="lg:col-span-2">
          <DataWidget title="Alerts & Notifications">
            <div className="grid gap-2 sm:grid-cols-2">
              {alerts.map((alert, i) => (
                <AlertItem key={i} {...alert} />
              ))}
            </div>
          </DataWidget>
        </div>
      </div>

      {/* ── Alerts ── */}
      <DataWidget title="Alerts & Notifications">
        <div className="grid gap-2 sm:grid-cols-2">
          {alerts.map((alert, i) => (
            <AlertItem key={i} {...alert} />
          ))}
        </div>
      </DataWidget>

      {/* ── Row: Recent Orders ── */}
      <DataWidget
        title="Recent Orders"
        action={
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>View All <ExternalLink className="ml-1 h-3 w-3" /></Button>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-medium text-foreground">{order.id}</TableCell>
                <TableCell className="text-sm">{order.customer}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.product}</TableCell>
                <TableCell><StatusBadge label={order.status} variant={orderStatusMap[order.status] || 'neutral'} /></TableCell>
                <TableCell className="text-right font-medium text-foreground">{order.total}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="mr-2 h-3 w-3" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem><RefreshCw className="mr-2 h-3 w-3" /> Update Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataWidget>

      {/* ── Row: Price Changes + Automation ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price Changes with Source */}
        <DataWidget
          title="Recent Price Changes"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/pricing')}>Pricing <ExternalLink className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            {recentPriceChanges.map((change) => (
              <div key={change.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{change.product}</p>
                  <p className="text-xs text-muted-foreground">{change.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[9px]">{change.source}</Badge>
                  <div className="text-right">
                    <span className="text-muted-foreground line-through">{change.from}</span>
                    <span className="ml-2 font-medium text-foreground">{change.to}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DataWidget>

        {/* Automation Modules */}
        <DataWidget
          title="Automation Modules"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/automation')}>Manage <ExternalLink className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            {automationModules.map((mod) => (
              <div key={mod.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{mod.name}</p>
                    <p className="text-xs text-muted-foreground">Last: {mod.lastRun} · {mod.jobs24h} jobs/24h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mod.failures > 0 && <Badge variant="destructive" className="text-[9px]">{mod.failures} failed</Badge>}
                  <StatusBadge label={mod.enabled ? 'Active' : 'Paused'} variant={mod.enabled ? 'success' : 'neutral'} pulse={mod.enabled} />
                </div>
              </div>
            ))}
          </div>
        </DataWidget>
      </div>

      {/* ── Row: Import Queue + Product Stats ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataWidget
          title="Supplier Import Queue"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/supplier-import')}>Import <ExternalLink className="ml-1 h-3 w-3" /></Button>}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Pending Review</p>
                <p className="text-xs text-muted-foreground">Products awaiting admin approval before publish</p>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">{stats.pendingImports} pending</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Last Import</p>
                <p className="text-xs text-muted-foreground">Wholesale Supplier · 12 products imported</p>
              </div>
              <StatusBadge label="Completed" variant="success" />
            </div>
          </div>
        </DataWidget>

        <DataWidget title="Product Stats">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.activeProducts}</p>
              <p className="text-xs text-muted-foreground">Active Products</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.inactiveProducts}</p>
              <p className="text-xs text-muted-foreground">Inactive / Draft</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold text-foreground">+{stats.newCustomersWeek}</p>
              <p className="text-xs text-muted-foreground">New This Week</p>
            </div>
          </div>
        </DataWidget>
      </div>
    </div>
  );
}
