import { useState, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { categoryApi } from '@/api/category.api';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/csv-export';
import { BulkDeleteDialog } from '@/components/shared/BulkDeleteDialog';
import type { Category } from '@/types';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Search, RefreshCw, MoreHorizontal, Pencil, Trash2, FolderOpen, Download, Package,
} from 'lucide-react';

export default function AdminCategories() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => { document.title = 'Categories — Admin — UpgraderCX'; }, []);

  const { data: categoriesRes, isLoading, refetch } = useApiQuery(
    ['admin-categories', search],
    () => categoryApi.list({ search: search || undefined, per_page: 50 }),
  );
  const categories = categoriesRes?.data || [];

  const filteredCategories = search
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  const allSelected = filteredCategories.length > 0 && filteredCategories.every((c) => selected.has(c.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredCategories.map((c) => c.id)));
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const openCreate = () => {
    setEditCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description || '');
    setFormOpen(true);
  };

  const createMutation = useApiMutation(
    (data: { name: string; slug: string; description: string }) => categoryApi.create(data),
    {
      onSuccess: () => { toast({ title: 'Category created' }); setFormOpen(false); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to create category' }),
    },
  );

  const updateMutation = useApiMutation(
    ({ id, data }: { id: number; data: { name: string; slug: string; description: string } }) => categoryApi.update(id, data),
    {
      onSuccess: () => { toast({ title: 'Category updated' }); setFormOpen(false); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to update category' }),
    },
  );

  const deleteMutation = useApiMutation(
    (id: number) => categoryApi.delete(id),
    {
      onSuccess: () => { toast({ title: 'Category deleted' }); setDeleteTarget(null); refetch(); },
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete category' }),
    },
  );

  const handleFormSubmit = () => {
    if (!formName.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    const slug = formSlug.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = { name: formName.trim(), slug, description: formDescription.trim() };

    if (editCategory) {
      updateMutation.mutate({ id: editCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBulkDelete = () => {
    // In production, this would be a bulk endpoint. For now, sequential deletes.
    const ids = Array.from(selected);
    Promise.all(ids.map((id) => categoryApi.delete(id))).then(() => {
      toast({ title: `${ids.length} categories deleted` });
      setSelected(new Set());
      setBulkDeleteOpen(false);
      refetch();
    });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize products into categories for storefront navigation.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            exportToCsv('categories', [
              { header: 'Name', accessor: (c) => c.name },
              { header: 'Slug', accessor: (c) => c.slug },
              { header: 'Description', accessor: (c) => c.description || '' },
              { header: 'Products', accessor: (c) => c.products_count ?? 0 },
            ], filteredCategories);
            toast({ title: 'CSV exported' });
          }}>
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Category
          </Button>
        </div>
      </div>

      {/* Search + bulk bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>Delete Selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-full animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {search ? 'No categories match your search.' : 'No categories defined yet. Create your first one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className={selected.has(cat.id) ? 'bg-muted/30' : ''}>
                    <TableCell>
                      <Checkbox checked={selected.has(cat.id)} onCheckedChange={() => toggleOne(cat.id)} />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{cat.description || '—'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        <Package className="mr-1 h-3 w-3" />
                        {cat.products_count ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(cat)}>
                            <Pencil className="mr-2 h-3 w-3" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(cat)}>
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
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {editCategory ? `Editing "${editCategory.name}"` : 'Add a new product category.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Streaming Services"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="auto-generated if blank"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground">URL-friendly identifier. Leave blank to auto-generate from name.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Brief description for SEO and storefront..."
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>.
              {(deleteTarget?.products_count ?? 0) > 0 && (
                <> This category has <strong>{deleteTarget?.products_count}</strong> products that will become uncategorized.</>
              )}
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

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        count={selected.size}
        entityName="categories"
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
