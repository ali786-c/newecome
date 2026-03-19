import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Tag, Plus, Trash2, Copy, Download, RefreshCw, Search,
  Percent, DollarSign, Zap, CheckCircle2, XCircle, Clock,
} from 'lucide-react';

type DiscountType = 'percentage' | 'fixed';
type CouponStatus = 'active' | 'expired' | 'disabled' | 'scheduled';

interface Coupon {
  id: number;
  code: string;
  type: DiscountType;
  value: number;
  minOrderValue: number;
  maxUses: number | null;
  usedCount: number;
  status: CouponStatus;
  expiresAt: string | null;
  createdAt: string;
  description: string;
  firstOrderOnly: boolean;
}

const MOCK_COUPONS: Coupon[] = [
  { id: 1, code: 'WELCOME20', type: 'percentage', value: 20, minOrderValue: 0, maxUses: null, usedCount: 47, status: 'active', expiresAt: null, createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), description: 'Welcome discount for new customers', firstOrderOnly: true },
  { id: 2, code: 'SAVE5EUR', type: 'fixed', value: 5, minOrderValue: 20, maxUses: 100, usedCount: 63, status: 'active', expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(), description: 'Spring promo — fixed €5 off', firstOrderOnly: false },
  { id: 3, code: 'BLACKFRI30', type: 'percentage', value: 30, minOrderValue: 10, maxUses: 500, usedCount: 500, status: 'expired', expiresAt: new Date(Date.now() - 86400000 * 60).toISOString(), createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), description: 'Black Friday 2024', firstOrderOnly: false },
  { id: 4, code: 'VIP15', type: 'percentage', value: 15, minOrderValue: 0, maxUses: 50, usedCount: 12, status: 'active', expiresAt: new Date(Date.now() + 86400000 * 60).toISOString(), createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'VIP customer discount', firstOrderOnly: false },
  { id: 5, code: 'REFER10', type: 'percentage', value: 10, minOrderValue: 0, maxUses: null, usedCount: 88, status: 'active', expiresAt: null, createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), description: 'Referral reward for new signups', firstOrderOnly: true },
];

const statusCfg: Record<CouponStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  active:    { label: 'Active',     variant: 'default',     icon: <CheckCircle2 className="h-3 w-3" /> },
  expired:   { label: 'Expired',   variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  disabled:  { label: 'Disabled',  variant: 'outline',     icon: <XCircle className="h-3 w-3" /> },
  scheduled: { label: 'Scheduled', variant: 'secondary',   icon: <Clock className="h-3 w-3" /> },
};

function randomCode(prefix: string, len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix ? prefix.toUpperCase() + '-' : '';
  for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Coupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState('10');
  const [bulkPrefix, setBulkPrefix] = useState('');
  const [bulkType, setBulkType] = useState<DiscountType>('percentage');
  const [bulkValue, setBulkValue] = useState('20');
  const [bulkExpiry, setBulkExpiry] = useState('');
  const [bulkFirstOrder, setBulkFirstOrder] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const [form, setForm] = useState({ code: '', type: 'percentage' as DiscountType, value: '20', minOrder: '0', maxUses: '', expiresAt: '', description: '', firstOrderOnly: false });

  useEffect(() => { document.title = 'Coupons — Admin — UpgraderCX'; }, []);

  const filtered = coupons.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !c.code.includes(search.toUpperCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = coupons.filter((c) => c.status === 'active').length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);

  function createCoupon() {
    const c: Coupon = {
      id: Date.now(), code: form.code.toUpperCase() || randomCode(''), type: form.type,
      value: parseFloat(form.value) || 0, minOrderValue: parseFloat(form.minOrder) || 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null, usedCount: 0,
      status: 'active', expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      createdAt: new Date().toISOString(), description: form.description, firstOrderOnly: form.firstOrderOnly,
    };
    setCoupons((p) => [c, ...p]);
    setCreateOpen(false);
    setForm({ code: '', type: 'percentage', value: '20', minOrder: '0', maxUses: '', expiresAt: '', description: '', firstOrderOnly: false });
    toast({ title: 'Coupon created', description: `Code "${c.code}" is now active.` });
  }

  function generateBulk() {
    const count = parseInt(bulkCount) || 10;
    const codes = Array.from({ length: count }, () => randomCode(bulkPrefix, 8));
    const newCoupons: Coupon[] = codes.map((code, i) => ({
      id: Date.now() + i, code, type: bulkType, value: parseFloat(bulkValue) || 0,
      minOrderValue: 0, maxUses: 1, usedCount: 0, status: 'active',
      expiresAt: bulkExpiry ? new Date(bulkExpiry).toISOString() : null,
      createdAt: new Date().toISOString(), description: 'Bulk generated coupon',
      firstOrderOnly: bulkFirstOrder,
    }));
    setCoupons((p) => [...newCoupons, ...p]);
    setGeneratedCodes(codes);
    toast({ title: `${count} coupons generated`, description: 'Ready to copy or export.' });
  }

  function deleteCoupon(id: number) {
    setCoupons((p) => p.filter((c) => c.id !== id));
    toast({ title: 'Coupon deleted' });
  }

  function toggleStatus(id: number) {
    setCoupons((p) => p.map((c) => c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' } : c));
  }

  function exportCsv() {
    const csv = ['Code,Type,Value,Uses,Max Uses,Expires,Status'].concat(
      filtered.map((c) => `${c.code},${c.type},${c.value},${c.usedCount},${c.maxUses ?? 'unlimited'},${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'never'},${c.status}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'coupons.csv'; a.click();
    toast({ title: 'Exported', description: `${filtered.length} coupons exported.` });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupon Manager</h1>
          <p className="text-sm text-muted-foreground">Create, bulk-generate, and manage discount codes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Create Coupon</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Active Coupons', value: active, icon: <Tag className="h-5 w-5 text-primary" /> },
          { label: 'Total Redemptions', value: totalUses, icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
          { label: 'Total Codes', value: coupons.length, icon: <Zap className="h-5 w-5 text-muted-foreground" /> },
        ].map((s) => (
          <Card key={s.label}><CardContent className="pt-6"><div className="flex items-center gap-3">{s.icon}<div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">All Coupons ({coupons.length})</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search codes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>First Order</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const s = statusCfg[c.status];
                    const usagePct = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : null;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono text-sm font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">{c.code}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: 'Copied!' }); }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                            {c.type === 'percentage' ? <Percent className="h-3.5 w-3.5 text-primary" /> : <DollarSign className="h-3.5 w-3.5 text-primary" />}
                            {c.type === 'percentage' ? `${c.value}% off` : `€${c.value} off`}
                          </div>
                          {c.minOrderValue > 0 && <p className="text-xs text-muted-foreground">Min: €{c.minOrderValue}</p>}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground">{c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : ''}</p>
                          {usagePct !== null && <div className="mt-1 h-1 bg-muted rounded-full w-20"><div className="h-1 bg-primary rounded-full" style={{ width: `${Math.min(100, usagePct)}%` }} /></div>}
                        </TableCell>
                        <TableCell>{c.firstOrderOnly ? <Badge variant="secondary" className="text-xs">Yes</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell><Badge variant={s.variant} className="gap-1">{s.icon}{s.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Switch checked={c.status === 'active'} onCheckedChange={() => toggleStatus(c.id)} className="scale-75" />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCoupon(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Bulk Generator</CardTitle><CardDescription>Generate many unique single-use codes at once.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" min="1" max="1000" value={bulkCount} onChange={(e) => setBulkCount(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Prefix (optional)</Label><Input placeholder="PROMO" value={bulkPrefix} onChange={(e) => setBulkPrefix(e.target.value.toUpperCase())} /></div>
                  <div className="space-y-1.5">
                    <Label>Discount Type</Label>
                    <Select value={bulkType} onValueChange={(v) => setBulkType(v as DiscountType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Value</Label><Input type="number" min="0" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Expiry Date</Label><Input type="date" value={bulkExpiry} onChange={(e) => setBulkExpiry(e.target.value)} /></div>
                  <div className="flex items-center gap-2 pt-5">
                    <Checkbox checked={bulkFirstOrder} onCheckedChange={(v) => setBulkFirstOrder(!!v)} id="fo" />
                    <Label htmlFor="fo" className="cursor-pointer">First order only</Label>
                  </div>
                </div>
                <Button onClick={generateBulk} className="w-full gap-2"><Zap className="h-4 w-4" />Generate {bulkCount} Codes</Button>
              </CardContent>
            </Card>

            {generatedCodes.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{generatedCodes.length} Generated Codes</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generatedCodes.join('\n')); toast({ title: 'All codes copied!' }); }}>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />Copy All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-3 font-mono text-xs space-y-1">
                    {generatedCodes.map((code) => (
                      <div key={code} className="flex items-center justify-between">
                        <span>{code}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(code); toast({ title: 'Copied!', description: code }); }}><Copy className="h-2.5 w-2.5" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Code (leave blank to auto-generate)</Label>
                <div className="flex gap-1.5">
                  <Input placeholder="MYSALE20" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
                  <Button variant="outline" size="icon" onClick={() => setForm((p) => ({ ...p, code: randomCode('') }))}><RefreshCw className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as DiscountType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Value ({form.type === 'percentage' ? '%' : '€'})</Label><Input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Min Order Value (€)</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm((p) => ({ ...p, minOrder: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Max Uses (blank = unlimited)</Label><Input type="number" value={form.maxUses} onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Expires</Label><Input type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Description (internal)</Label><Input placeholder="Spring sale promo..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.firstOrderOnly} onCheckedChange={(v) => setForm((p) => ({ ...p, firstOrderOnly: !!v }))} id="foc" />
              <Label htmlFor="foc" className="cursor-pointer text-sm">First order only</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createCoupon} className="gap-2"><Plus className="h-4 w-4" />Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
