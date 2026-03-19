import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageScaffold } from '@/components/PageScaffold';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ALL_PRODUCTS } from '@/data/products';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';

const WISHLIST_KEY = 'upgradercx_wishlist';

function getStoredWishlist(): number[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}

export function useWishlist() {
  const [ids, setIds] = useState<number[]>(getStoredWishlist);
  const { toast } = useToast();

  function toggle(id: number) {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }

  function isWished(id: number) { return ids.includes(id); }

  return { ids, toggle, isWished };
}

export default function Wishlist() {
  const { ids, toggle } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => { document.title = 'Wishlist — UpgraderCX'; }, []);

  const products = ALL_PRODUCTS.filter((p) => ids.includes(p.id));

  function moveToCart(productId: number) {
    const p = ALL_PRODUCTS.find((pr) => pr.id === productId);
    if (!p) return;
    addItem(p, 1, undefined, p.price);
    toggle(productId);
    toast({ title: 'Moved to cart', description: `${p.name} added to your cart.` });
  }

  function removeAll() {
    localStorage.setItem(WISHLIST_KEY, '[]');
    window.location.reload();
  }

  return (
    <PageScaffold title="Wishlist" description="Your saved products for later.">
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Save products you like for quick access later.</p>
              <Button asChild><Link to="/products">Browse Products <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
              <Button variant="ghost" size="sm" onClick={removeAll} className="text-destructive hover:text-destructive gap-1.5"><Trash2 className="h-3.5 w-3.5" />Clear all</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {product.badge && (
                      <Badge className="absolute top-2 left-2 text-xs">{product.badge}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 bg-background/80 hover:bg-background text-destructive hover:text-destructive"
                      onClick={() => toggle(product.id)}
                    >
                      <Heart className="h-3.5 w-3.5 fill-current" />
                    </Button>
                  </div>
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <Link to={`/products/${product.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm leading-tight">{product.name}</Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-foreground">€{Number(product.price).toFixed(2)}</span>
                        {product.retailPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-1.5">€{Number(product.retailPrice).toFixed(2)}</span>
                        )}
                        {product.startingAt && <span className="text-xs text-muted-foreground ml-1">/ mo</span>}
                      </div>
                      <Badge variant={product.inStock ? 'default' : 'outline'} className="text-xs">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" asChild>
                        <Link to={`/products/${product.slug}`}><Package className="h-3.5 w-3.5" />View</Link>
                      </Button>
                      <Button size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => moveToCart(product.id)} disabled={!product.inStock}>
                        <ShoppingCart className="h-3.5 w-3.5" />Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageScaffold>
  );
}
