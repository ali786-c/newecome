import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Download, Search, Eye, Filter, RefreshCw } from 'lucide-react';

type ActionType = 'create' | 'update' | 'delete' | 'login' | 'export' | 'settings';
const COLORS: Record<ActionType, string> = {
  create: 'bg-green-500/10 text-green-700 border-green-200',
  update: 'bg-blue-500/10 text-blue-700 border-blue-200',
  delete: 'bg-red-500/10 text-red-700 border-red-200',
  login: 'bg-purple-500/10 text-purple-700 border-purple-200',
  export: 'bg-amber-500/10 text-amber-700 border-amber-200',
  settings: 'bg-slate-500/10 text-slate-700 border-slate-200',
};

const LOGS = [
  { id: 1,  ts: '2026-03-16 14:32:11', user: 'admin@example.com',   role: 'admin',   action: 'update'   as ActionType, resource: 'Product #14 — Figma Pro',      detail: 'Price changed €7.99 → €8.99',              ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 2,  ts: '2026-03-16 14:28:05', user: 'admin@example.com',   role: 'admin',   action: 'create'   as ActionType, resource: 'Product #45 — Canva Teams',    detail: 'New product in Productivity category',      ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 3,  ts: '2026-03-16 13:55:42', user: 'admin@example.com',   role: 'admin',   action: 'login'    as ActionType, resource: 'Auth session',                 detail: 'Successful login',                          ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 4,  ts: '2026-03-16 13:10:22', user: 'manager@example.com', role: 'manager', action: 'export'   as ActionType, resource: 'Orders CSV',                   detail: '156 rows exported (Mar 1–15)',               ip: '91.99.141.22', ua: 'Firefox 123 / macOS'  },
  { id: 5,  ts: '2026-03-16 12:41:07', user: 'admin@example.com',   role: 'admin',   action: 'delete'   as ActionType, resource: 'Product #38 — HBO Max',        detail: 'Product removed — out of stock',            ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 6,  ts: '2026-03-16 11:30:00', user: 'admin@example.com',   role: 'admin',   action: 'settings' as ActionType, resource: 'Stripe Gateway',               detail: 'API keys updated (test → live)',             ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 7,  ts: '2026-03-16 10:15:33', user: 'manager@example.com', role: 'manager', action: 'update'   as ActionType, resource: 'Order #ORD-00154',              detail: 'Status: pending → completed',               ip: '91.99.141.22', ua: 'Firefox 123 / macOS'  },
  { id: 8,  ts: '2026-03-16 09:48:19', user: 'admin@example.com',   role: 'admin',   action: 'settings' as ActionType, resource: 'Automation Rule #3',           detail: 'Discord pricing sync enabled',              ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 9,  ts: '2026-03-15 18:22:44', user: 'admin@example.com',   role: 'admin',   action: 'update'   as ActionType, resource: 'Customer #89',                 detail: 'Wallet credited €20 (manual top-up)',        ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 10, ts: '2026-03-15 17:05:12', user: 'admin@example.com',   role: 'admin',   action: 'create'   as ActionType, resource: 'Blog Post #12',                detail: '"Top 5 VPN Services 2026" published',       ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 11, ts: '2026-03-15 15:40:07', user: 'manager@example.com', role: 'manager', action: 'export'   as ActionType, resource: 'Customer CSV',                 detail: '89 records exported',                       ip: '91.99.141.22', ua: 'Firefox 123 / macOS'  },
  { id: 12, ts: '2026-03-15 14:10:55', user: 'admin@example.com',   role: 'admin',   action: 'settings' as ActionType, resource: 'NOWPayments Gateway',          detail: 'IPN secret key updated',                    ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 13, ts: '2026-03-15 12:30:00', user: 'admin@example.com',   role: 'admin',   action: 'create'   as ActionType, resource: 'Automation Rule #7',           detail: 'Telegram daily blog post rule created',     ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
  { id: 14, ts: '2026-03-15 09:15:22', user: 'admin@example.com',   role: 'admin',   action: 'update'   as ActionType, resource: 'Compliance Review #4',         detail: 'KYC status: pending → approved (Jane D.)', ip: '82.14.210.51', ua: 'Chrome 122 / Windows' },
];

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<typeof LOGS[0] | null>(null);

  const filtered = LOGS.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.user.includes(q) || l.resource.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <PageScaffold title="Audit Logs" description="Complete immutable trail of all administrative actions for compliance and security.">
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, resource, detail…" className="pl-9 h-8 text-xs" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
          <Button variant="outline" size="icon" className="h-8 w-8"><RefreshCw className="h-3.5 w-3.5" /></Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Resource</TableHead>
                    <TableHead className="text-xs">IP Address</TableHead>
                    <TableHead className="text-xs w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No audit logs match your filters
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((log) => (
                    <TableRow key={log.id} className={`cursor-pointer hover:bg-muted/30 ${selectedLog?.id === log.id ? 'bg-muted/50' : ''}`} onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}>
                      <TableCell className="text-xs font-mono whitespace-nowrap">{log.ts}</TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{log.user}</p>
                        <Badge variant="outline" className="text-[10px] h-4 mt-0.5">{log.role}</Badge>
                      </TableCell>
                      <TableCell><Badge className={`text-xs capitalize ${COLORS[log.action]}`}>{log.action}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{log.resource}</TableCell>
                      <TableCell className="text-xs font-mono">{log.ip}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {selectedLog && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold mb-3 text-primary">Log Detail — #{selectedLog.id}</p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-muted-foreground block">Timestamp</span><span className="font-mono">{selectedLog.ts}</span></div>
                <div><span className="text-muted-foreground block">User</span>{selectedLog.user}</div>
                <div><span className="text-muted-foreground block">Role</span><Badge variant="outline" className="text-[10px] h-4">{selectedLog.role}</Badge></div>
                <div><span className="text-muted-foreground block">Action</span><Badge className={`text-[10px] capitalize ${COLORS[selectedLog.action]}`}>{selectedLog.action}</Badge></div>
                <div><span className="text-muted-foreground block">Resource</span>{selectedLog.resource}</div>
                <div><span className="text-muted-foreground block">Detail</span>{selectedLog.detail}</div>
                <div><span className="text-muted-foreground block">IP Address</span><span className="font-mono">{selectedLog.ip}</span></div>
                <div className="sm:col-span-2"><span className="text-muted-foreground block">User Agent</span>{selectedLog.ua}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageScaffold>
  );
}
