import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Key, Plus, Trash2, Eye, EyeOff, Upload, Download, Copy,
  Package, CheckCircle2, Clock, AlertTriangle, Search, RefreshCw,
} from 'lucide-react';

type CredType = 'email_password' | 'license_key' | 'link' | 'custom';
type CredStatus = 'available' | 'assigned' | 'used' | 'expired';

interface Credential {
  id: number;
  productId: number;
  productName: string;
  type: CredType;
  email?: string;
  password?: string;
  licenseKey?: string;
  deliveryLink?: string;
  customContent?: string;
  status: CredStatus;
  assignedOrderId?: string;
  assignedAt?: string;
  expiresAt?: string;
  addedAt: string;
}

const PRODUCTS = [
  { id: 9, name: 'Netflix Premium' },
  { id: 10, name: 'Disney+' },
  { id: 11, name: 'YouTube Premium' },
  { id: 14, name: 'ChatGPT Plus' },
  { id: 15, name: 'Midjourney' },
  { id: 22, name: 'NordVPN' },
  { id: 25, name: 'Spotify Premium' },
];

const MOCK_CREDS: Credential[] = [
  { id: 1, productId: 9, productName: 'Netflix Premium', type: 'email_password', email: 'seat1@netflix-family.com', password: 'Str0ng#Pass1', status: 'available', addedAt: new Date(Date.now() - 86400000 * 2).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 90).toISOString() },
  { id: 2, productId: 9, productName: 'Netflix Premium', type: 'email_password', email: 'seat2@netflix-family.com', password: 'Str0ng#Pass2', status: 'assigned', assignedOrderId: 'ORD-00124', assignedAt: new Date(Date.now() - 3600000).toISOString(), addedAt: new Date(Date.now() - 86400000 * 3).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 87).toISOString() },
  { id: 3, productId: 11, productName: 'YouTube Premium', type: 'email_password', email: 'ytprem@family.com', password: 'YT#Secure99', status: 'available', addedAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 120).toISOString() },
  { id: 4, productId: 14, productName: 'ChatGPT Plus', type: 'email_password', email: 'gpt4user@mail.com', password: 'ChatP#2025', status: 'used', assignedOrderId: 'ORD-00100', addedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 5, productId: 22, productName: 'NordVPN', type: 'license_key', licenseKey: 'NORD-XXXX-YYYY-ZZZZ-0001', status: 'available', addedAt: new Date(Date.now() - 86400000 * 1).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 180).toISOString() },
  { id: 6, productId: 15, productName: 'Midjourney', type: 'link', deliveryLink: 'https://discord.gg/midjourney-invite-xxx', status: 'available', addedAt: new Date(Date.now() - 3600000 * 5).toISOString() },
];

const statusCfg: Record<CredStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  available:  { label: 'Available',  variant: 'default',     icon: <CheckCircle2 className="h-3 w-3" /> },
  assigned:   { label: 'Assigned',   variant: 'secondary',   icon: <Clock className="h-3 w-3" /> },
  used:       { label: 'Used',       variant: 'outline',     icon: <Package className="h-3 w-3" /> },
  expired:    { label: 'Expired',    variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function ProductVault() {
  const { toast } = useToast();
  const [creds, setCreds] = useState<Credential[]>(MOCK_CREDS);
  const [showValues, setShowValues] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkProduct, setBulkProduct] = useState('');
  const [bulkType, setBulkType] = useState<CredType>('email_password');

  const [newCred, setNewCred] = useState({ productId: '', type: 'email_password' as CredType, email: '', password: '', licenseKey: '', deliveryLink: '', customContent: '', expiresAt: '' });

  useEffect(() => { document.title = 'Product Vault — Admin — UpgraderCX'; }, []);

  const filtered = creds.filter((c) => {
    if (productFilter !== 'all' && c.productId !== parseInt(productFilter)) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !c.email?.includes(search) && !c.licenseKey?.includes(search) && !c.productName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const available = creds.filter((c) => c.status === 'available').length;
  const assigned = creds.filter((c) => c.status === 'assigned').length;
  const used = creds.filter((c) => c.status === 'used').length;
  const stockPct = creds.length ? Math.round((available / creds.length) * 100) : 0;

  function addSingle() {
    const prod = PRODUCTS.find((p) => p.id === parseInt(newCred.productId));
    if (!prod) { toast({ title: 'Select a product', variant: 'destructive' }); return; }
    const c: Credential = {
      id: Date.now(), productId: prod.id, productName: prod.name, type: newCred.type,
      email: newCred.email || undefined, password: newCred.password || undefined,
      licenseKey: newCred.licenseKey || undefined, deliveryLink: newCred.deliveryLink || undefined,
      customContent: newCred.customContent || undefined,
      expiresAt: newCred.expiresAt ? new Date(newCred.expiresAt).toISOString() : undefined,
      status: 'available', addedAt: new Date().toISOString(),
    };
    setCreds((prev) => [c, ...prev]);
    setAddOpen(false);
    setNewCred({ productId: '', type: 'email_password', email: '', password: '', licenseKey: '', deliveryLink: '', customContent: '', expiresAt: '' });
    toast({ title: 'Credential added', description: `${prod.name} seat added to vault.` });
  }

  function addBulk() {
    const prod = PRODUCTS.find((p) => p.id === parseInt(bulkProduct));
    if (!prod) { toast({ title: 'Select a product', variant: 'destructive' }); return; }
    const lines = bulkText.trim().split('\n').filter(Boolean);
    const newItems: Credential[] = lines.map((line, i) => {
      const parts = line.split(':');
      return {
        id: Date.now() + i,
        productId: prod.id, productName: prod.name, type: bulkType,
        ...(bulkType === 'email_password' ? { email: parts[0], password: parts[1] } : {}),
        ...(bulkType === 'license_key' ? { licenseKey: parts[0] } : {}),
        ...(bulkType === 'link' ? { deliveryLink: parts[0] } : {}),
        ...(bulkType === 'custom' ? { customContent: line } : {}),
        status: 'available' as CredStatus, addedAt: new Date().toISOString(),
      };
    });
    setCreds((prev) => [...newItems, ...prev]);
    setBulkText('');
    toast({ title: `${newItems.length} credentials added`, description: `${prod.name} bulk import complete.` });
  }

  function deleteCred(id: number) {
    setCreds((prev) => prev.filter((c) => c.id !== id));
    toast({ title: 'Credential deleted' });
  }

  function maskVal(val: string) { return val.slice(0, 3) + '••••••' + val.slice(-2); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Vault</h1>
          <p className="text-sm text-muted-foreground">Store and manage pre-loaded credentials for instant auto-delivery.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Credentials</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Available', value: available, icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
          { label: 'Assigned', value: assigned, icon: <Clock className="h-5 w-5 text-amber-500" /> },
          { label: 'Used / Delivered', value: used, icon: <Package className="h-5 w-5 text-muted-foreground" /> },
          { label: 'Total Stock', value: creds.length, icon: <Key className="h-5 w-5 text-primary" /> },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="font-medium">Stock health</span>
            <span className="text-muted-foreground">{stockPct}% available</span>
          </div>
          <Progress value={stockPct} className="h-2" />
          {stockPct < 20 && <p className="text-xs text-destructive mt-1.5">Low stock — add more credentials to avoid delays.</p>}
        </CardContent>
      </Card>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Vault ({filtered.length})</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search credentials..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All Products" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {PRODUCTS.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credential</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Key className="h-8 w-8 mx-auto mb-2 opacity-30" />No credentials found</TableCell></TableRow>
                  ) : filtered.map((c) => {
                    const s = statusCfg[c.status];
                    const visible = showValues[c.id];
                    const credValue = c.type === 'email_password' ? `${c.email} / ${visible ? c.password : maskVal(c.password || '')}` : c.type === 'license_key' ? (visible ? c.licenseKey : maskVal(c.licenseKey || '')) : c.deliveryLink || c.customContent || '—';
                    return (
                      <TableRow key={c.id} className={c.status === 'used' ? 'opacity-50' : ''}>
                        <TableCell className="font-medium text-sm">{c.productName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground capitalize">{c.type.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{credValue}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setShowValues((p) => ({ ...p, [c.id]: !p[c.id] }))}>
                              {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { navigator.clipboard.writeText(credValue); toast({ title: 'Copied!' }); }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={s.variant} className="gap-1">{s.icon}{s.label}</Badge></TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{c.assignedOrderId || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteCred(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Import Credentials</CardTitle>
              <CardDescription>Paste one credential per line. For email/password format: <code className="text-xs bg-muted px-1 rounded">email@example.com:password</code></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select value={bulkProduct} onValueChange={setBulkProduct}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{PRODUCTS.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Credential Type</Label>
                  <Select value={bulkType} onValueChange={(v) => setBulkType(v as CredType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email_password">Email : Password</SelectItem>
                      <SelectItem value="license_key">License Key</SelectItem>
                      <SelectItem value="link">Delivery Link</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Credentials (one per line)</Label>
                <Textarea rows={8} placeholder="seat1@netflix.com:Password123&#10;seat2@netflix.com:Password456&#10;seat3@netflix.com:Password789" value={bulkText} onChange={(e) => setBulkText(e.target.value)} className="font-mono text-xs" />
                <p className="text-xs text-muted-foreground">{bulkText.trim().split('\n').filter(Boolean).length} lines detected</p>
              </div>
              <Button onClick={addBulk} className="gap-2" disabled={!bulkText.trim() || !bulkProduct}>
                <Upload className="h-4 w-4" />Import {bulkText.trim().split('\n').filter(Boolean).length || 0} Credentials
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Single Credential Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="h-4 w-4" />Add Credential</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select value={newCred.productId} onValueChange={(v) => setNewCred((p) => ({ ...p, productId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{PRODUCTS.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={newCred.type} onValueChange={(v) => setNewCred((p) => ({ ...p, type: v as CredType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_password">Email + Password</SelectItem>
                  <SelectItem value="license_key">License Key</SelectItem>
                  <SelectItem value="link">Delivery Link</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newCred.type === 'email_password' && <>
              <div className="space-y-1.5"><Label>Email</Label><Input value={newCred.email} onChange={(e) => setNewCred((p) => ({ ...p, email: e.target.value }))} placeholder="account@example.com" /></div>
              <div className="space-y-1.5"><Label>Password</Label><Input value={newCred.password} onChange={(e) => setNewCred((p) => ({ ...p, password: e.target.value }))} placeholder="StrongPassword#123" /></div>
            </>}
            {newCred.type === 'license_key' && <div className="space-y-1.5"><Label>License Key</Label><Input value={newCred.licenseKey} onChange={(e) => setNewCred((p) => ({ ...p, licenseKey: e.target.value }))} className="font-mono" placeholder="XXXX-XXXX-XXXX-XXXX" /></div>}
            {newCred.type === 'link' && <div className="space-y-1.5"><Label>Link</Label><Input value={newCred.deliveryLink} onChange={(e) => setNewCred((p) => ({ ...p, deliveryLink: e.target.value }))} placeholder="https://..." /></div>}
            {newCred.type === 'custom' && <div className="space-y-1.5"><Label>Content</Label><Textarea value={newCred.customContent} onChange={(e) => setNewCred((p) => ({ ...p, customContent: e.target.value }))} rows={3} /></div>}
            <div className="space-y-1.5"><Label>Expiry Date (optional)</Label><Input type="date" value={newCred.expiresAt} onChange={(e) => setNewCred((p) => ({ ...p, expiresAt: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addSingle} className="gap-2"><Plus className="h-4 w-4" />Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
