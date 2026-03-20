import { useState, useCallback, useEffect } from 'react';
import { productApi } from '@/api/product.api';
import { toProductPayload, type ProductFormValues } from '@/lib/schemas/product.schema';
import { ProductForm } from '@/components/products/ProductForm';
import { StatusBadge } from '@/components/dashboard';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/csv-export';
import { BulkDeleteDialog } from '@/components/shared/BulkDeleteDialog';
import type { Product, ListParams } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, Copy, Eye, Send,
  MessageSquare, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Download, Layers
} from 'lucide-react';
import { SupplierImportDialog } from '@/components/products/SupplierImportDialog';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'neutral' | 'error'> = {
  active: 'success', draft: 'warning', archived: 'neutral',
};
const STOCK_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  in_stock: 'success', limited: 'warning', out_of_stock: 'error',
};
const COMPLIANCE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  approved: 'success', pending_review: 'info', flagged: 'warning', rejected: 'error',
};

export default function AdminProducts() {
  const { toast } = useToast();

  /* ── Listing state ── */
  const [params, setParams] = useState<ListParams>({ page: 1, per_page: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const queryParams: ListParams = {
    ...params,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category_id: categoryFilter !== 'all' ? Number(categoryFilter) : undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  const { data: productsData, isLoading, refetch } = useApiQuery(
    ['admin-products', JSON.stringify(queryParams)],
    () => productApi.list(queryParams),
  );

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  /* ── Selection ── */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  /* ── Dialog state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkCategoryId, setBulkCategoryId] = useState('1');
  const [buyTarget, setBuyTarget] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const openCreate = () => { setEditProduct(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setFormOpen(true); };

  /* ── Mutations ── */
  const createMutation = useApiMutation(
    (values: ProductFormValues) => productApi.create(toProductPayload(values) as any),
    {
      onSuccess: () => { toast({ title: 'Product created' }); setFormOpen(false); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to create product' }),
    },
  );

  const updateMutation = useApiMutation(
    ({ id, values }: { id: number; values: ProductFormValues }) => productApi.update(id, toProductPayload(values) as any),
    {
      onSuccess: () => { toast({ title: 'Product updated' }); setFormOpen(false); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to update product' }),
    },
  );

  const deleteMutation = useApiMutation(
    (id: number) => productApi.delete(id),
    {
      onSuccess: () => { toast({ title: 'Product deleted' }); setDeleteTarget(null); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete product' }),
    },
  );

  const duplicateMutation = useApiMutation(
    (id: number) => productApi.duplicate(id),
    {
      onSuccess: () => { toast({ title: 'Product duplicated' }); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to duplicate' }),
    },
  );

  const bulkMutation = useApiMutation(
    (data: { ids: number[]; action: string; payload?: Record<string, unknown> }) =>
      productApi.bulkAction(data as any),
    {
      onSuccess: (_, vars) => {
        toast({ title: `Bulk ${vars.action} completed`, description: `${vars.ids.length} products affected` });
        setSelected(new Set());
        setBulkAction(null);
        refetch();
      },
    },
  );

  const handleFormSubmit = async (values: ProductFormValues) => {
    if (editProduct) await updateMutation.mutateAsync({ id: editProduct.id, values });
    else await createMutation.mutateAsync(values);
  };

  const handleBulkConfirm = () => {
    const ids = Array.from(selected);
    const payload: Record<string, unknown> = {};
    if (bulkAction === 'assign_category') payload.category_id = Number(bulkCategoryId);
    if (bulkAction === 'update_pricing') payload.price_adjust = Number(bulkPriceAdjust);
    bulkMutation.mutate({ ids, action: bulkAction!, payload });
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  useEffect(() => { document.title = 'Products — Admin — UpgraderCX'; }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} products` : 'Loading...'} · Manage your catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            exportToCsv('products', [
              { header: 'Name', accessor: (p) => p.name },
              { header: 'SKU', accessor: (p) => p.slug },
              { header: 'Category', accessor: (p) => p.category?.name || '' },
              { header: 'Price', accessor: (p) => Number(p.price).toFixed(2) },
              { header: 'Status', accessor: (p) => p.status },
              { header: 'Stock', accessor: (p) => p.stock_status },
              { header: 'Compliance', accessor: (p) => p.compliance_status },
            ], products);
            toast({ title: 'CSV exported', description: `${products.length} products exported.` });
          }}>
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Layers className="mr-2 h-4 w-4" /> Import from Supplier
          </Button>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setParams((p) => ({ ...p, page: 1 })); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setParams((p) => ({ ...p, page: 1 })); }}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="1">Software Licenses</SelectItem>
            <SelectItem value="2">Account Upgrades</SelectItem>
            <SelectItem value="3">Digital Tools</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('enable')}>Enable</Button>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('disable')}>Disable</Button>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('assign_category')}>Assign Category</Button>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('update_pricing')}>Update Pricing</Button>
          <Button size="sm" variant="outline" onClick={() => setBulkAction('archive')}>Archive</Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkAction('delete')}>Delete</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Product <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('price')}>
                <span className="flex items-center gap-1">Price <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                  No products found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className={selected.has(product.id) ? 'bg-muted/30' : ''}>
                  <TableCell>
                    <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleOne(product.id)} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.category?.name || '—'}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-foreground">${Number(product.price).toFixed(2)}</span>
                      {product.compare_price && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">${Number(product.compare_price).toFixed(2)}</span>
                      )}
                      {product.discount_label && (
                        <span className="ml-1 text-xs font-medium text-destructive">{product.discount_label}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={product.status} variant={STATUS_VARIANT[product.status]} />
                  </TableCell>
                  <TableCell>
                    {product.supplier ? (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        {product.supplier.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Manual</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={product.stock_status.replace('_', ' ')}
                      variant={STOCK_VARIANT[product.stock_status]}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {product.telegram_enabled && (
                        <span title="Telegram"><Send className="h-3.5 w-3.5 text-blue-500" /></span>
                      )}
                      {product.discord_enabled && (
                        <span title="Discord"><MessageSquare className="h-3.5 w-3.5 text-indigo-500" /></span>
                      )}
                      {!product.telegram_enabled && !product.discord_enabled && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={product.compliance_status.replace('_', ' ')}
                      variant={COMPLIANCE_VARIANT[product.compliance_status]}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(product)}>
                          <Pencil className="mr-2 h-3 w-3" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateMutation.mutate(product.id)}>
                          <Copy className="mr-2 h-3 w-3" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-3 w-3" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · {meta.total} products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Create Product'}</DialogTitle>
            <DialogDescription>
              {editProduct ? `Editing ${editProduct.name}` : 'Fill in the product details below.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <BulkDeleteDialog
        open={bulkAction === 'delete'}
        onOpenChange={(open) => !open && setBulkAction(null)}
        count={selected.size}
        entityName="products"
        onConfirm={handleBulkConfirm}
        loading={bulkMutation.isPending}
      />

      {/* Bulk Action Dialog (non-delete) */}
      <AlertDialog open={!!bulkAction && bulkAction !== 'delete'} onOpenChange={(open) => !open && setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bulk {bulkAction?.replace('_', ' ')} — {selected.size} products
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === 'enable' && 'This will set the selected products to Active status.'}
              {bulkAction === 'disable' && 'This will set the selected products to Draft status.'}
              {bulkAction === 'archive' && 'This will archive the selected products.'}
              {bulkAction === 'assign_category' && (
                <span className="block mt-3">
                  <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Software Licenses</SelectItem>
                      <SelectItem value="2">Account Upgrades</SelectItem>
                      <SelectItem value="3">Digital Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </span>
              )}
              {bulkAction === 'update_pricing' && (
                <span className="block mt-3">
                  <Input
                    type="number"
                    placeholder="Price adjustment (e.g. -5 or +10)"
                    value={bulkPriceAdjust}
                    onChange={(e) => setBulkPriceAdjust(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">Positive adds, negative subtracts from base price</span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SupplierImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportSuccess={() => {
          setImportOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
