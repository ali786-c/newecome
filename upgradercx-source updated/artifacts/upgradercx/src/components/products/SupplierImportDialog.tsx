import { useState } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { supplierApi, type SupplierProduct } from '@/api/supplier.api';
import { categoryApi } from '@/api/category.api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, Download, Layers } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportSuccess?: () => void;
}

export function SupplierImportDialog({ open, onOpenChange, onImportSuccess }: Props) {
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [connectionId, setConnectionId] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [margin, setMargin] = useState(10);
    const [importingId, setImportingId] = useState<number | null>(null);

    const { data: connections } = useApiQuery(['supplier-connections'], () => supplierApi.listConnections());
    const { data: categories } = useApiQuery(['admin-categories'], () => categoryApi.list());

    const { data: productsData, isLoading, refetch } = useApiQuery(
        ['supplier-products', search, connectionId, page],
        () => supplierApi.listProducts({
            search,
            connection_id: connectionId !== 'all' ? connectionId : undefined,
            page,
            per_page: 10
        }),
        { enabled: open }
    );

    const importMutation = useApiMutation(
        (data: any) => supplierApi.importProduct(data),
        {
            onSuccess: () => {
                toast({ title: 'Product imported successfully' });
                onImportSuccess?.();
            },
            onError: (error: any) => {
                toast({
                    variant: 'destructive',
                    title: 'Import failed',
                    description: error.response?.data?.message || 'Something went wrong'
                });
            },
            onSettled: () => setImportingId(null)
        }
    );

    const handleImport = (product: SupplierProduct) => {
        setImportingId(product.id);
        importMutation.mutate({
            supplier_product_id: product.id,
            margin_percentage: margin,
            category_id: categories?.data?.[0]?.id // Default to first category for now
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <DialogTitle>Import from Supplier</DialogTitle>
                    </div>
                    <DialogDescription>
                        Browse cached products from your API providers and import them into your store.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-3 py-4 border-b">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search supplier products..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={connectionId} onValueChange={setConnectionId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Suppliers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Suppliers</SelectItem>
                            {connections?.data?.map((c: any) => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 border rounded-md px-3 h-10">
                        <span className="text-xs font-medium text-muted-foreground">Margin %:</span>
                        <input
                            type="number"
                            className="w-12 bg-transparent text-sm font-bold focus:outline-none"
                            value={margin}
                            onChange={(e) => setMargin(parseInt(e.target.value))}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-auto py-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Cost Price</TableHead>
                                <TableHead>Retail Price (+{margin}%)</TableHead>
                                <TableHead className="w-24 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5}><div className="h-10 w-full animate-pulse bg-muted rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : productsData?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No products found in supplier cache.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productsData?.data?.map((product: SupplierProduct) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.data?.logoUrls?.[0] && (
                                                    <img src={product.data.logoUrls[0]} alt="" className="h-8 w-8 rounded object-contain border" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-sm">{product.name}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{product.connection?.name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">{product.category}</TableCell>
                                        <TableCell className="font-mono text-xs">${Number(product.price).toFixed(2)}</TableCell>
                                        <TableCell className="font-bold text-sm text-primary">
                                            ${(Number(product.price) * (1 + margin / 100)).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={importingId === product.id}
                                                onClick={() => handleImport(product)}
                                            >
                                                {importingId === product.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                                                Import
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-xs text-muted-foreground">
                            Showing page {page} of {productsData?.last_page || 1}
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                            <Button size="sm" variant="outline" disabled={page >= (productsData?.last_page || 1)} onClick={() => setPage(page + 1)}>Next</Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
