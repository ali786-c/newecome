import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowRight, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

/** Calculate savings percentage */
function getSavingsPercent(price: number, retailPrice?: number): number | null {
  if (!retailPrice || retailPrice <= price) return null;
  return Math.round(((retailPrice - price) / retailPrice) * 100);
}

export interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  price: string | number;
  comparePrice?: string | number;
  startingAt?: boolean;
  imageUrl?: string | null;
  inStock?: boolean;
  onHold?: boolean;
  badge?: string | null;
  product?: any; // Accepting any product type for normalization
}

export function ProductCard({
  id, slug, name, price, comparePrice, startingAt, imageUrl, inStock, onHold, badge, product,
}: ProductCardProps) {
  // Normalize data from both static data and API response
  const normalizedPrice = product?.price ?? price;
  const normalizedRetailPrice = product?.retailPrice ?? product?.compare_price ?? comparePrice;
  const normalizedImageUrl = product?.image_url ?? product?.imageUrl ?? imageUrl;
  const normalizedInStock = product?.inStock ?? (product?.stock_status === 'in_stock' || product?.stock_status === undefined) ?? inStock;
  const normalizedBadge = product?.badge ?? product?.discount_label ?? badge;

  const unavailable = !normalizedInStock || onHold;
  const { addItem } = useCart();
  const savings = getSavingsPercent(Number(normalizedPrice), Number(normalizedRetailPrice));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product && !unavailable) {
      // Create a normalized product object for the cart context
      const cartProduct = {
        ...product,
        id: Number(product.id),
        price: Number(normalizedPrice),
        retailPrice: normalizedRetailPrice ? Number(normalizedRetailPrice) : undefined,
        imageUrl: normalizedImageUrl,
        inStock: normalizedInStock,
      };
      addItem(cartProduct as any);
    }
  };

  const displayPrice = typeof normalizedPrice === 'number'
    ? `€${normalizedPrice.toFixed(2)}`
    : normalizedPrice;

  return (
    <Link to={`/products/${slug}`} className="group block h-full">
      <Card className={`h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 ${unavailable ? 'opacity-60 grayscale-[30%]' : ''}`}>
        {/* Image */}
        <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
          {normalizedImageUrl ? (
            <img src={normalizedImageUrl} alt={name} className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <Package className="h-10 w-10 text-muted-foreground/20" />
          )}

          {normalizedBadge && !unavailable && (
            <Badge className="absolute left-2 top-2 text-[10px] px-1.5 py-0.5 leading-none bg-primary text-primary-foreground shadow-sm">{normalizedBadge}</Badge>
          )}

          {product?.supplier_id && !unavailable && (
            <Badge variant="outline" className="absolute left-2 top-2 text-[9px] px-1.5 py-0.5 leading-none bg-emerald-500 text-white border-none shadow-sm flex items-center gap-1">
              <Zap className="h-2.5 w-2.5 fill-current" /> Instant Delivery
            </Badge>
          )}

          {/* Savings badge */}
          {savings && savings > 0 && !unavailable && (
            <span className="absolute right-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground shadow-sm">
              -{savings}%
            </span>
          )}

          {/* Cart button */}
          {!unavailable && (
            <button
              onClick={handleAddToCart}
              className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 border shadow-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}

          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <span className="rounded-md border border-destructive/30 bg-background/90 px-3 py-1.5 text-[11px] font-semibold text-destructive uppercase tracking-wide">
                {onHold ? 'On Hold' : 'Unavailable'}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <CardContent className="p-3 flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">{name}</p>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            {startingAt && <span className="text-[10px] text-muted-foreground font-medium">From</span>}
            <span className="text-lg font-extrabold text-foreground tracking-tight">{displayPrice}</span>
            {normalizedRetailPrice && Number(normalizedRetailPrice) > Number(normalizedPrice) && (
              <span className="text-xs text-muted-foreground line-through">€{Number(normalizedRetailPrice).toFixed(2)}</span>
            )}
            <span className="text-[10px] text-muted-foreground">/mo</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${normalizedInStock && !onHold ? 'text-success' : 'text-destructive'}`}>
              {onHold ? (
                'On Hold'
              ) : normalizedInStock ? (
                <>Stock <span className="text-xs">∞</span></>
              ) : (
                'Out of Stock'
              )}
            </span>
            {!unavailable && (
              <span className="text-[11px] font-medium text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                View <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── Category Card ── */
export interface CategoryCardProps {
  slug: string;
  name: string;
  imageUrl?: string | null;
  startingPrice?: string;
  productCount?: number;
}

export function CategoryCard({ slug, name, imageUrl, startingPrice, productCount, category }: CategoryCardProps & { category?: any }) {
  const normalizedCount = category?.products_count ?? productCount;
  const normalizedImageUrl = category?.image_url ?? imageUrl;

  return (
    <Link to={`/categories/${slug}`} className="group block">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
        <div className="relative aspect-[3/2] bg-muted/30 flex items-center justify-center overflow-hidden">
          {normalizedImageUrl ? (
            <img src={normalizedImageUrl} alt={name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground/25" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-sm font-bold text-primary-foreground drop-shadow-sm">{name}</p>
            {startingPrice && <p className="text-[11px] text-primary-foreground/80 drop-shadow-sm">From {startingPrice}/mo</p>}
          </div>
        </div>
        {normalizedCount !== undefined && (
          <CardContent className="px-3 py-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">{normalizedCount} products</p>
            <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
