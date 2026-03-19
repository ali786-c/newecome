import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/storefront';
import { SeoHead } from '@/components/shared/SeoHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ALL_PRODUCTS, CATEGORIES_LIST } from '@/data/products';

type SortKey = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock'>('all');

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category !== 'all') {
      list = list.filter((p) => p.catSlug === category);
    }
    if (stockFilter === 'in_stock') {
      list = list.filter((p) => p.inStock && !p.onHold);
    }
    switch (sort) {
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      default: list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [search, category, sort, stockFilter]);

  return (
    <div className="container py-6 sm:py-8">
      <SeoHead
        title="All Products — UpgraderCX"
        description="Browse our full catalog of genuine digital services, software licenses, AI tools, streaming, VPN, and gaming subscriptions."
        canonical="https://upgradercx.com/products"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'All Products',
          url: 'https://upgradercx.com/products',
          description: 'Browse the full UpgraderCX digital product catalog.',
        }}
      />
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Products</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-xl font-bold text-foreground sm:text-2xl">All Products</h1>
      <p className="mt-1 text-sm text-muted-foreground">Browse our full catalog of digital services and upgrades.</p>

      {/* Filters toolbar */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[160px] text-xs">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES_LIST.map((c) => (
                <SelectItem key={c.slug} value={c.slug} className="text-sm">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="name-asc">Name: A → Z</SelectItem>
              <SelectItem value="name-desc">Name: Z → A</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={stockFilter === 'in_stock' ? 'default' : 'outline'}
            size="sm"
            className="h-9 text-xs"
            onClick={() => setStockFilter(stockFilter === 'all' ? 'in_stock' : 'all')}
          >
            In Stock Only
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="mt-4 text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">No products match your filters.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearch(''); setCategory('all'); setStockFilter('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.name}
              price={`€${p.price.toFixed(2)}`}
              startingAt={p.startingAt}
              imageUrl={p.imageUrl}
              inStock={p.inStock}
              onHold={p.onHold}
              badge={p.badge}
              product={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}
