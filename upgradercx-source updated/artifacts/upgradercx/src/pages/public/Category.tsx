import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '@/components/storefront';
import { SeoHead } from '@/components/shared/SeoHead';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Search } from 'lucide-react';
import { ALL_PRODUCTS, CATEGORIES } from '@/data/products';

/* Category descriptions */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'education': 'Online courses, certifications, and learning platforms.',
  'streaming': 'Premium streaming service subscriptions for music, video, and sports.',
  'ai-products': 'Cutting-edge AI subscriptions and productivity tools.',
  'dev-design': 'Software licenses, IDEs, design tools, and development platforms.',
  'productivity': 'Office suites, OS licenses, and productivity software.',
  'vpn-security': 'Protect your online presence with premium VPN and security tools.',
  'gaming': 'Game passes, subscriptions, and gaming utilities.',
  'lifestyle': 'Social, wellness, and lifestyle premium subscriptions.',
  'reseller': 'Reseller packages to start your own digital product business.',
};

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const products = ALL_PRODUCTS.filter((p) => p.catSlug === slug);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => b.id - a.id); break;
    }
    return list;
  }, [products, search, sort]);

  if (!cat) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Category not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The category you're looking for doesn't exist.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/products">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  const description = CATEGORY_DESCRIPTIONS[slug || ''] || `Browse all ${cat.name} products.`;

  return (
    <div className="container py-6 sm:py-8">
      <SeoHead
        title={`${cat.name} — UpgraderCX`}
        description={description}
        canonical={`https://upgradercx.com/categories/${slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: cat.name,
          url: `https://upgradercx.com/categories/${slug}`,
          description,
        }}
      />
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/products">Products</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{cat.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-xl font-bold text-foreground sm:text-2xl">{cat.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {/* Toolbar */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search in category..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-[160px] text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
            <SelectItem value="name-asc">Name: A → Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
