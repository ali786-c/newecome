import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { supplierImportApi } from '@/api/supplier-import.api';
import { categoryApi } from '@/api/category.api';
import { useToast } from '@/hooks/use-toast';
import type { SupplierProduct, ImportAdjustment, SupplierConnection } from '@/types';
import {
  Plug, RefreshCw, Search, CheckCircle2, XCircle, AlertTriangle, Loader2,
  Package, DollarSign, FileUp, Copy, Eye, Pencil, ArrowRight, History,
  Wifi, WifiOff, Download, Settings, Trash2,
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

const supplierStatusConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  connected: { label: 'Connected', variant: 'default', icon: <Wifi className="h-3 w-3" /> },
  disconnected: { label: 'Disconnected', variant: 'secondary', icon: <WifiOff className="h-3 w-3" /> },
  error: { label: 'Error', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  syncing: { label: 'Syncing', variant: 'outline', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
};

export default function SupplierImport() {
  const { toast } = useToast();
  const [activeSupplier, setActiveSupplier] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [adjustmentModal, setAdjustmentModal] = useState<SupplierProduct | null>(null);
  const [adjustments, setAdjustments] = useState<Map<string, ImportAdjustment>>(new Map());
  const [settingsSupplier, setSettingsSupplier] = useState<SupplierConnection | null>(null);

  // Adjustment form state
  const [adjName, setAdjName] = useState('');
  const [adjDesc, setAdjDesc] = useState('');
  const [adjPrice, setAdjPrice] = useState(0);
  const [adjMarkupType, setAdjMarkupType] = useState<'fixed' | 'percentage'>('percentage');
  const [adjMarkupValue, setAdjMarkupValue] = useState(50);
  const [adjCategoryId, setAdjCategoryId] = useState<number>(0);
  const [adjPublishNow, setAdjPublishNow] = useState(false);
  const [adjCompliance, setAdjCompliance] = useState<string>('pending_review');
  const [globalStatus, setGlobalStatus] = useState<'active' | 'draft'>('draft');
  const [globalCompliance, setGlobalCompliance] = useState<'approved' | 'pending_review'>('pending_review');
  const [globalCategoryId, setGlobalCategoryId] = useState<string>('auto');
  const [globalMarkupValue, setGlobalMarkupValue] = useState<number>(50);
  const [globalMarkupType, setGlobalMarkupType] = useState<'percentage' | 'fixed'>('percentage');
  const [productCache, setProductCache] = useState<Map<string, SupplierProduct>>(new Map());

  useEffect(() => { document.title = 'Supplier Import — Admin — UpgraderCX'; }, []);

  /* ── Queries ── */
  const { data: suppliersRes } = useApiQuery(['suppliers'], () => supplierImportApi.getSuppliers());
  const suppliers = suppliersRes?.data || [];

  const { data: productsRes, isLoading: productsLoading, refetch: refetchProducts } = useApiQuery(
    ['supplier-products', activeSupplier, searchQuery, categoryFilter],
    () => supplierImportApi.getSupplierProducts(activeSupplier!, {
      search: searchQuery || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
    }),
    { enabled: !!activeSupplier },
  );
  const products = productsRes?.data || [];

  // Update product cache whenever products results change
  useEffect(() => {
    if (productsRes?.data) {
      setProductCache((prev) => {
        const next = new Map(prev);
        productsRes.data.forEach((p) => next.set(p.id, p));
        return next;
      });
    }
  }, [productsRes?.data]);

  const { data: duplicatesRes } = useApiQuery(
    ['supplier-duplicates', activeSupplier],
    () => supplierImportApi.getDuplicates(activeSupplier!),
    { enabled: !!activeSupplier },
  );
  const duplicates = duplicatesRes?.data || [];

  const { data: jobsRes, isLoading: jobsLoading, refetch: refetchJobs } = useApiQuery(
    ['import-jobs'],
    () => supplierImportApi.getImportJobs(),
  );

  const { data: categoriesRes } = useApiQuery(['categories-list'], () => categoryApi.list());
  const categories = categoriesRes?.data || [];

  /* ── Mutations ── */
  const syncMutation = useApiMutation(
    (id: number) => supplierImportApi.syncSupplier(id),
    { onSuccess: (res) => { toast({ title: `Fetched ${res.data.products_fetched} products` }); refetchProducts(); } },
  );

  const bulkApplySettings = () => {
    const nextAdjustments = new Map(adjustments);
    selectedProducts.forEach(pid => {
      const sp = productCache.get(pid);
      const basePrice = sp?.supplier_price || 0;

      const existing = nextAdjustments.get(pid) || {
        product_id: pid,
        reseller_price: 0,
        markup_value: globalMarkupValue,
        markup_type: globalMarkupType,
        publish_now: globalStatus === 'active'
      };

      nextAdjustments.set(pid, {
        ...existing,
        status: globalStatus,
        compliance_status: globalCompliance,
        category_id: globalCategoryId === 'auto' ? undefined : Number(globalCategoryId),
        markup_value: globalMarkupValue,
        markup_type: globalMarkupType,
        reseller_price: globalMarkupType === 'percentage'
          ? basePrice * (1 + globalMarkupValue / 100)
          : basePrice + globalMarkupValue,
      });
    });
    setAdjustments(nextAdjustments);
    toast({ title: 'Settings applied to all selected products locally' });
  };
  const importMutation = useApiMutation(
    (adj: ImportAdjustment[]) => supplierImportApi.importProducts({
      products: adj,
      global_status: globalStatus,
      global_compliance: globalCompliance,
      global_category_id: globalCategoryId,
      global_markup_value: globalMarkupValue,
      global_markup_type: globalMarkupType,
    }),
    {
      onSuccess: () => {
        toast({ title: `Import queued — ${selectedProducts.size} products` });
        setSelectedProducts(new Set());
        setAdjustments(new Map());
        refetchJobs();
      },
    },
  );

  const retryMutation = useApiMutation(
    (id: number) => supplierImportApi.retryJob(id),
    { onSuccess: () => { toast({ title: 'Job requeued' }); refetchJobs(); } },
  );

  /* ── Selection helpers ── */
  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  /* ── Open adjustment modal ── */
  const openAdjustment = (product: SupplierProduct) => {
    const existing = adjustments.get(product.id);
    setAdjName(existing?.custom_name || product.name);
    setAdjDesc(existing?.custom_description || product.description);
    setAdjMarkupType(existing?.markup_type || 'percentage');
    setAdjMarkupValue(existing?.markup_value ?? 50);
    setAdjCategoryId(existing?.category_id || 0);
    setAdjPublishNow(existing?.publish_now ?? false);
    setAdjCompliance(existing?.compliance_status || 'pending_review');
    // Calculate reseller price
    const mv = existing?.markup_value ?? 50;
    const mt = existing?.markup_type || 'percentage';
    setAdjPrice(mt === 'percentage' ? product.supplier_price * (1 + mv / 100) : product.supplier_price + mv);
    setAdjustmentModal(product);
  };

  const saveAdjustment = () => {
    if (!adjustmentModal) return;
    const adj: ImportAdjustment = {
      product_id: adjustmentModal.id,
      custom_name: adjName !== adjustmentModal.name ? adjName : undefined,
      custom_description: adjDesc !== adjustmentModal.description ? adjDesc : undefined,
      reseller_price: adjPrice,
      markup_type: adjMarkupType,
      markup_value: adjMarkupValue,
      category_id: adjCategoryId || undefined,
      status: adjPublishNow ? 'active' : 'draft',
      compliance_status: adjCompliance,
      publish_now: adjPublishNow,
    };
    setAdjustments((prev) => new Map(prev).set(adjustmentModal.id, adj));
    if (!selectedProducts.has(adjustmentModal.id)) {
      setSelectedProducts((prev) => new Set(prev).add(adjustmentModal.id));
    }
    setAdjustmentModal(null);
    toast({ title: `Adjustment saved for ${adjName}` });
  };

  // Recalculate price when markup changes
  const recalcPrice = (type: 'fixed' | 'percentage', value: number) => {
    if (!adjustmentModal) return;
    const base = adjustmentModal.supplier_price;
    setAdjMarkupType(type);
    setAdjMarkupValue(value);
    setAdjPrice(type === 'percentage' ? base * (1 + value / 100) : base + value);
  };

  /* ── Import selected ── */
  const handleImport = () => {
    const items: ImportAdjustment[] = Array.from(selectedProducts).map((pid) => {
      const existing = adjustments.get(pid);
      const product = products.find((p) => p.id === pid);
      if (existing) return existing;
      return {
        product_id: pid,
        reseller_price: (product?.supplier_price || 0) * 1.5,
        markup_type: 'percentage' as const,
        markup_value: 50,
        status: 'draft' as const,
        publish_now: false,
      };
    });
    importMutation.mutate(items);
  };

  const uniqueCategories = [...new Set(products.map((p) => p.category_name).filter(Boolean))];

  return (
    <PageScaffold
      title="Supplier Import"
      description="Fetch, review, adjust, and import products from external suppliers."
      actions={
        selectedProducts.size > 0 ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedProducts.size} selected</Badge>
            <Button size="sm" onClick={handleImport} disabled={importMutation.isPending}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Import {selectedProducts.size} Products
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="suppliers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="suppliers"><Plug className="mr-1 h-3.5 w-3.5" /> Suppliers</TabsTrigger>
            <TabsTrigger value="browse"><Package className="mr-1 h-3.5 w-3.5" /> Browse</TabsTrigger>
            <TabsTrigger value="duplicates"><Copy className="mr-1 h-3.5 w-3.5" /> Duplicates</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="mr-1 h-3.5 w-3.5" /> Import Preview</TabsTrigger>
            <TabsTrigger value="logs"><History className="mr-1 h-3.5 w-3.5" /> Import Logs</TabsTrigger>
          </TabsList>

          {/* ═══ TAB: Suppliers ═══ */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {suppliers.map((s) => {
                const cfg = supplierStatusConfig[s.status] || supplierStatusConfig.disconnected;
                return (
                  <Card key={s.id} className={s.status === 'error' ? 'border-destructive/30' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{s.name}</CardTitle>
                        <Badge variant={cfg.variant} className="text-[10px] gap-1">{cfg.icon}{cfg.label}</Badge>
                      </div>
                      <CardDescription className="text-xs">Provider: {s.provider}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-muted-foreground">Products</p><p className="font-medium text-foreground">{s.products_available}</p></div>
                        <div><p className="text-muted-foreground">Last Sync</p><p className="font-medium text-foreground">{timeAgo(s.last_synced_at)}</p></div>
                      </div>
                      {s.error_message && <p className="text-[10px] text-destructive">{s.error_message}</p>}

                      {/* Credential placeholders */}
                      <div className="space-y-2 border-t border-border pt-2">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Credentials (managed by Laravel)</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] w-16 shrink-0">API Key</Label>
                            <Input type="password" placeholder="••••••••" disabled className="h-7 text-xs" value={s.status === 'connected' ? '••••••••••••' : ''} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] w-16 shrink-0">Secret</Label>
                            <Input type="password" placeholder="••••••••" disabled className="h-7 text-xs" value={s.status === 'connected' ? '••••••••••••' : ''} />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Credentials are stored securely on the Laravel backend. Contact your developer to update.</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline" size="sm" className="flex-1"
                          disabled={s.status === 'disconnected' || syncMutation.isPending}
                          onClick={() => { setActiveSupplier(s.id); syncMutation.mutate(s.id); }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />Fetch Products
                        </Button>
                        <Button
                          variant="default" size="sm" className="flex-1"
                          disabled={s.status !== 'connected'}
                          onClick={() => setActiveSupplier(s.id)}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />Browse
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setSettingsSupplier(s)}>
                        <Settings className="h-3 w-3 mr-1" />Connector Settings
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ TAB: Browse Products ═══ */}
          <TabsContent value="browse" className="space-y-4">
            {!activeSupplier ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Select a supplier from the Suppliers tab first.</CardContent></Card>
            ) : (
              <>
                {selectedProducts.size > 0 && (
                  <Card className="border-primary/20 bg-primary/5 mb-4">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Global Status</label>
                          <Select value={globalStatus} onValueChange={(v: any) => setGlobalStatus(v)}>
                            <SelectTrigger className="h-8 bg-background">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active (Publish)</SelectItem>
                              <SelectItem value="draft">Draft (Hidden)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compliance</label>
                          <Select value={globalCompliance} onValueChange={(v: any) => setGlobalCompliance(v)}>
                            <SelectTrigger className="h-8 bg-background">
                              <SelectValue placeholder="Select compliance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="pending_review">Pending Review</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Margin ({globalMarkupType === 'percentage' ? '%' : '$'})</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={globalMarkupValue}
                              onChange={(e) => setGlobalMarkupValue(Number(e.target.value))}
                              className="h-8 bg-background"
                            />
                            <Select value={globalMarkupType} onValueChange={(v: any) => setGlobalMarkupType(v)}>
                              <SelectTrigger className="h-8 w-[100px] bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">$</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2 flex flex-col justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full h-8"
                            onClick={bulkApplySettings}
                          >
                            Apply to {selectedProducts.size} Selected
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products…" className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map((c) => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => refetchProducts()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox checked={products.length > 0 && selectedProducts.size === products.length} onCheckedChange={toggleAll} />
                          </TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Supplier Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Duplicate?</TableHead>
                          <TableHead>Adjusted?</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>)}</TableRow>
                          ))
                        ) : products.length === 0 ? (
                          <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No products found. Try fetching from the Suppliers tab.</TableCell></TableRow>
                        ) : (
                          products.map((p) => {
                            const hasAdj = adjustments.has(p.id);
                            const isDup = !!p.duplicate_of;
                            return (
                              <TableRow key={p.id} className={isDup ? 'bg-amber-500/5' : ''}>
                                <TableCell><Checkbox checked={selectedProducts.has(p.id)} onCheckedChange={() => toggleProduct(p.id)} /></TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {p.image_url && <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />}
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                                      <p className="text-[10px] text-muted-foreground">{p.external_id}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{p.category_name}{p.subcategory_name ? ` › ${p.subcategory_name}` : ''}</TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium text-foreground">${Number(p.supplier_price).toFixed(2)}</span>
                                  {hasAdj && <p className="text-[10px] text-primary">→ ${Number(adjustments.get(p.id)!.reseller_price).toFixed(2)}</p>}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={p.stock_status === 'in_stock' ? 'default' : p.stock_status === 'limited' ? 'outline' : 'destructive'} className="text-[10px]">
                                    {p.stock_status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {isDup ? (
                                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                                      {p.duplicate_confidence}% match
                                    </Badge>
                                  ) : <span className="text-xs text-muted-foreground">No</span>}
                                </TableCell>
                                <TableCell>{hasAdj ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAdjustment(p)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ═══ TAB: Duplicates ═══ */}
          <TabsContent value="duplicates" className="space-y-4">
            {duplicates.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">{activeSupplier ? 'No duplicates detected.' : 'Select a supplier first.'}</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {duplicates.map((d) => (
                  <Card key={d.supplier_product.id} className="border-amber-500/30">
                    <CardContent className="pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Supplier Product</p>
                          <p className="text-sm font-medium text-foreground">{d.supplier_product.name}</p>
                          <p className="text-xs text-muted-foreground">${Number(d.supplier_product.supplier_price).toFixed(2)} · {d.supplier_product.external_id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Existing Product</p>
                          <p className="text-sm font-medium text-foreground">{d.existing_product_name}</p>
                          <p className="text-xs text-muted-foreground">ID #{d.existing_product_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/10">
                          {d.confidence}% · {d.match_type.replace('_', ' ')}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => openAdjustment(d.supplier_product)}>
                          <Pencil className="h-3 w-3 mr-1" />Adjust & Import Anyway
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { selectedProducts.delete(d.supplier_product.id); setSelectedProducts(new Set(selectedProducts)); toast({ title: 'Skipped duplicate' }); }}>
                          Skip
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB: Import Preview ═══ */}
          <TabsContent value="preview" className="space-y-4">
            {selectedProducts.size === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Select products from the Browse tab to preview import.</CardContent></Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selectedProducts.size} Products Ready to Import</CardTitle>
                  <CardDescription>Review adjustments before importing. Products without adjustments will use global markup and status.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Supplier Price</TableHead>
                        <TableHead>Reseller Price</TableHead>
                        <TableHead>Markup</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(selectedProducts).map((pid) => {
                        const product = productCache.get(pid);
                        if (!product) return null;
                        const adj = adjustments.get(pid);

                        const markupValue = adj?.markup_value ?? globalMarkupValue;
                        const markupType = adj?.markup_type ?? globalMarkupType;

                        const resellerPrice = adj?.reseller_price || (
                          markupType === 'percentage'
                            ? product.supplier_price * (1 + markupValue / 100)
                            : product.supplier_price + markupValue
                        );

                        const markupDisplay = markupType === 'percentage'
                          ? `${markupValue}%`
                          : `$${markupValue} fixed`;

                        return (
                          <TableRow key={pid}>
                            <TableCell className="text-sm font-medium text-foreground">{adj?.custom_name || product.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">${Number(product.supplier_price).toFixed(2)}</TableCell>
                            <TableCell className="text-sm font-medium text-foreground">${Number(resellerPrice).toFixed(2)}</TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{markupDisplay}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {adj?.category_id ? categories.find((c) => c.id === adj.category_id)?.name || `#${adj.category_id}` : product.category_name || '—'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={(adj?.status || globalStatus) === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                {adj?.status || globalStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAdjustment(product)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive/70 hover:text-destructive"
                                  onClick={() => {
                                    selectedProducts.delete(pid);
                                    setSelectedProducts(new Set(selectedProducts));
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t p-6 bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    Estimated Total Cost: <span className="font-semibold text-foreground">${Array.from(selectedProducts).reduce((acc, pid) => acc + (productCache.get(pid)?.supplier_price || 0), 0).toFixed(2)}</span>
                  </p>
                  <Button size="lg" onClick={() => importMutation.mutate(Array.from(adjustments.values()))} isLoading={importMutation.isLoading}>
                    Confirm Import & Process Jobs
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          {/* ═══ TAB: Import Logs ═══ */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetchJobs()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Fetched</TableHead>
                      <TableHead>Imported</TableHead>
                      <TableHead>Skipped</TableHead>
                      <TableHead>Duplicates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 9 }).map((__, j) => <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>)}</TableRow>
                      ))
                    ) : (jobsRes?.data || []).length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="py-12 text-center text-muted-foreground">No import jobs yet.</TableCell></TableRow>
                    ) : (
                      (jobsRes?.data || []).map((job) => (
                        <TableRow key={job.id} className={job.status === 'failed' ? 'bg-destructive/5' : ''}>
                          <TableCell className="text-xs text-muted-foreground">{timeAgo(job.started_at || job.created_at)}</TableCell>
                          <TableCell className="text-sm text-foreground">{job.supplier_name}</TableCell>
                          <TableCell className="text-sm text-foreground">{job.products_fetched}</TableCell>
                          <TableCell className="text-sm font-medium text-foreground">{job.products_imported}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{job.products_skipped}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{job.duplicates_found}</TableCell>
                          <TableCell>
                            <Badge
                              variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'outline'}
                              className="text-[10px] gap-1"
                            >
                              {job.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                              {job.status === 'failed' && <XCircle className="h-3 w-3" />}
                              {job.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.error_details && job.error_details.length > 0 ? (
                              <div className="space-y-0.5">{job.error_details.map((e, i) => <p key={i} className="text-[10px] text-destructive">{e}</p>)}</div>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
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
        </Tabs>
      </div>

      {/* ═══ RESELLER ADJUSTMENT MODAL ═══ */}
      <Dialog open={!!adjustmentModal} onOpenChange={(open) => { if (!open) setAdjustmentModal(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reseller Adjustment</DialogTitle>
            <DialogDescription>Adjust pricing, content, and publish status before import.</DialogDescription>
          </DialogHeader>
          {adjustmentModal && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Original info */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4 space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Original Supplier Data</p>
                  <p className="text-sm font-medium text-foreground">{adjustmentModal.name}</p>
                  <p className="text-xs text-muted-foreground">{adjustmentModal.external_id} · ${Number(adjustmentModal.supplier_price).toFixed(2)} {adjustmentModal.supplier_currency}</p>
                </CardContent>
              </Card>

              {/* Name */}
              <div className="space-y-1.5">
                <Label>Product Name</Label>
                <Input value={adjName} onChange={(e) => setAdjName(e.target.value)} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={adjDesc} onChange={(e) => setAdjDesc(e.target.value)} rows={3} />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Supplier Price</Label>
                  <Input value={`$${Number(adjustmentModal.supplier_price).toFixed(2)}`} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Reseller Price</Label>
                  <Input type="number" step="0.01" value={Number(adjPrice).toFixed(2)} onChange={(e) => setAdjPrice(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              {/* Markup tools */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Markup Type</Label>
                  <Select value={adjMarkupType} onValueChange={(v: 'fixed' | 'percentage') => recalcPrice(v, adjMarkupValue)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Markup Value</Label>
                  <Input type="number" step={adjMarkupType === 'percentage' ? '1' : '0.01'} value={adjMarkupValue} onChange={(e) => recalcPrice(adjMarkupType, parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Margin: <span className="font-medium text-foreground">${Number(adjPrice - adjustmentModal.supplier_price).toFixed(2)}</span></span>
                <span className="text-muted-foreground">({Number((adjPrice - adjustmentModal.supplier_price) / adjustmentModal.supplier_price * 100).toFixed(1)}%)</span>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label>Category Assignment</Label>
                <Select value={String(adjCategoryId)} onValueChange={(v) => setAdjCategoryId(parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Keep supplier category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Keep supplier category ({adjustmentModal.category_name})</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Publish */}
              <div className="flex items-center justify-between">
                <Label>Publish immediately?</Label>
                <Switch checked={adjPublishNow} onCheckedChange={setAdjPublishNow} />
              </div>
              {!adjPublishNow && <p className="text-[10px] text-muted-foreground">Product will be imported as Draft — requires manual publish.</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustmentModal(null)}>Cancel</Button>
            <Button onClick={saveAdjustment}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ CONNECTOR SETTINGS DIALOG ═══ */}
      <Dialog open={!!settingsSupplier} onOpenChange={(open) => { if (!open) setSettingsSupplier(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{settingsSupplier?.name} — Settings</DialogTitle>
            <DialogDescription>Connector-specific configuration managed by your Laravel backend.</DialogDescription>
          </DialogHeader>
          {settingsSupplier && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>API Endpoint</Label>
                <Input disabled value={settingsSupplier.api_url || 'Not configured'} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Default Import Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (requires manual publish)</SelectItem>
                    <SelectItem value="active">Active (auto-publish)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Default Markup (%)</Label>
                <Input type="number" defaultValue="50" className="w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-skip duplicates</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Require image for import</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Sync on schedule</Label>
                <Switch />
              </div>
              <p className="text-[10px] text-muted-foreground">These settings are placeholders. Actual persistence requires the Laravel backend connector implementation.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsSupplier(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageScaffold>
  );
}
