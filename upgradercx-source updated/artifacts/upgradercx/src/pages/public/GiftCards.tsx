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
import { Search, Globe, Building2, Ticket } from 'lucide-react';
import { useApiQuery } from '@/hooks/use-api-query';
import { productApi } from '@/api/product.api';
import { Skeleton } from '@/components/ui/skeleton';

// Common countries for gift cards
const CATEGORIES = [
  { id: 'all', name: 'All Services', icon: Ticket },
  { id: '1', name: 'Entertainment', icon: Ticket }, // Map these to your DB IDs
  { id: 'Gaming', name: 'Gaming', icon: Ticket },
];

// Helper to get flag/name for a country code
const getCountryDisplay = (code: string) => {
  const map: Record<string, { name: string, flag: string }> = {
    'US': { name: 'United States', flag: '🇺🇸' },
    'GB': { name: 'United Kingdom', flag: '🇬🇧' },
    'DE': { name: 'Germany', flag: '🇩🇪' },
    'ES': { name: 'Spain', flag: '🇪🇸' },
    'FR': { name: 'France', flag: '🇫🇷' },
    'IT': { name: 'Italy', flag: '🇮🇹' },
    'CA': { name: 'Canada', flag: '🇨🇦' },
    'AU': { name: 'Australia', flag: '🇦🇺' },
    'AE': { name: 'UAE', flag: '🇦🇪' },
    'SA': { name: 'Saudi Arabia', flag: '🇸🇦' },
    'TR': { name: 'Turkey', flag: '🇹🇷' },
    'GLOBAL': { name: 'Worldwide', flag: '🌐' },
    'WW': { name: 'Worldwide', flag: '🌐' },
  };
  return map[code.toUpperCase()] || { name: code, flag: '🏳️' };
};

export default function GiftCards() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');

  const { data: filtersData } = useApiQuery(['products', 'gift-card-filters'], () => productApi.getGiftCardFilters({ supplier_id: 1 }));
  const dynamicCountries = filtersData?.countries || [];
  const dynamicBrands = filtersData?.brands || [];

  const { data: productsData, isLoading } = useApiQuery(
    ['products', 'gift-cards', search, country, brand, category],
    () => productApi.list({
      search,
      country_code: country === 'all' ? undefined : (country as string),
      brand: brand === 'all' ? undefined : (brand as string),
      category_id: category === 'all' ? undefined : Number(category),
      supplier_id: 1, // Restrict to Reloadly products
      status: 'active',
      per_page: 100,
    }),
    { staleTime: 30_000 }
  );

  const products = productsData?.data || [];

  // Extract unique brands from current results for the brand filter
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    // In a real app, we'd fetch this from a dedicated brands API, 
    // but for now, we'll derive it from visible products
    products.forEach((p: any) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Gift Card Store — Buy Digital Cards & Subscriptions"
        description="Fast delivery on Netflix, PUBG, Xbox, Amazon, and 1000+ other gift cards. Filter by country and brand."
        canonical="https://upgradercx.com/gift-cards"
      />

      <div className="container py-6 sm:py-10">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Gift Cards</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-primary/5 px-6 py-10 sm:px-12 sm:py-16">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Dedicated <span className="text-primary">Gift Card</span> Store
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Get instant digital delivery for your favorite brands. 
              Filter by country to find the perfect card for your region.
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Filters Toolbar */}
        <div className="sticky top-20 z-30 -mx-4 mb-8 bg-background/80 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:bg-card sm:px-6 sm:shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search brands (e.g. Netflix, PUBG)..."
                className="h-11 pl-10 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Country Filter */}
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-11 w-full min-w-[180px] sm:w-[200px]">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {dynamicCountries.map((code) => {
                    const display = getCountryDisplay(code);
                    return (
                      <SelectItem key={code} value={code}>
                        <span className="flex items-center gap-2">
                          <span>{display.flag}</span>
                          <span>{display.name}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Brand Filter */}
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="h-11 w-full min-w-[160px] sm:w-[180px]">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {dynamicBrands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear */}
              {(search || country !== 'all' || brand !== 'all' || category !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setSearch('');
                    setCountry('all');
                    setBrand('all');
                    setCategory('all');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-6 text-muted-foreground">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No results found</h3>
            <p className="mt-1 text-muted-foreground">Try adjusting your filters or search terms.</p>
            <Button variant="outline" className="mt-6" onClick={() => { setSearch(''); setCountry('all'); setBrand('all'); }}>
              View All Gift Cards
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Displaying {products.length} Products
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {products.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  product={p}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
