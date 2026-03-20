import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApiQuery } from '@/hooks/use-api-query';
import { orderApi } from '@/api/order.api';
import { categoryApi } from '@/api/category.api';
import { Search, Package, RefreshCw, ShoppingCart, ShieldCheck } from 'lucide-react';
import { CredentialsDisplay } from '@/components/customer/CredentialsDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export default function MyProducts() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: categoriesRes } = useApiQuery(['categories'], () => categoryApi.list());
  const categories = categoriesRes?.data || [];

  const { data: productsRes, isLoading } = useApiQuery(
    ['my-products', search, categoryFilter], 
    () => orderApi.myProducts({ 
      search, 
      category_id: categoryFilter === 'all' ? undefined : categoryFilter 
    })
  );

  const items = productsRes?.data || [];

  return (
    <PageScaffold 
      title="My Products" 
      description="Direct access to your purchased digital accounts and licenses."
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9 bg-background/50" 
              placeholder="Search by product name..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-52 bg-background/50">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-muted/60">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-4">
                <Package className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold">No active products found</h3>
              <p className="text-muted-foreground mt-1 max-w-xs mx-auto">
                {search || categoryFilter !== 'all' 
                  ? "Try adjusting your filters to find what you're looking for." 
                  : "Start shopping to see your digital assets here!"}
              </p>
              {!search && categoryFilter === 'all' && (
                <Button className="mt-6" asChild>
                  <Link to="/products"><ShoppingCart className="mr-2 h-4 w-4" /> Browse Store</Link>
                </Button>
              )}
            </div>
          ) : (
            items.map((item: any) => (
              <Card key={item.id} className="flex flex-col border-muted/60 hover:border-primary/30 transition-all hover:shadow-md group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className="text-[10px] bg-background/50 border-primary/20 text-primary">
                      {item.product?.category?.name || 'Digital Asset'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Purchased: {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">
                    {item.product?.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 text-xs">
                    {item.product?.short_description || 'Licensed Product'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4 pt-0">
                  <CredentialsDisplay 
                    credentials={item.credentials} 
                  />
                </CardContent>

                <CardFooter className="pt-3 border-t bg-muted/5 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-[10px] h-8 gap-1.5" asChild>
                    <Link to="/tickets">
                      <RefreshCw className="h-3 w-3" /> Report Issue
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 gap-1.5" asChild>
                    <Link to="/orders">
                       Details <ShieldCheck className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageScaffold>
  );
}
