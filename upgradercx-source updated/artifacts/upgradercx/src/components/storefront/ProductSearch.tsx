import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ALL_PRODUCTS } from '@/data/products';
import { Link } from 'react-router-dom';

export function ProductSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search for a product..."
        className="pl-9 h-10 text-sm bg-card"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-card shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No products found</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                onClick={() => { setQuery(''); setFocused(false); }}
              >
                <div className="h-8 w-8 rounded bg-muted/30 overflow-hidden shrink-0">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="h-full w-full object-contain p-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.category}</p>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0">
                  {p.startingAt && <span className="text-[10px] font-normal text-muted-foreground mr-1">from</span>}
                  €{p.price.toFixed(2)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
