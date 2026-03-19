import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SeoHead } from '@/components/shared/SeoHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/storefront';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ShoppingCart, Package, Shield, Zap, ArrowLeft, Minus, Plus, Tag, RefreshCw, CheckCircle2, Headphones, Star, Heart, ThumbsUp } from 'lucide-react';
import { getProductBySlug, getRelatedProducts, type Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/pages/customer/Wishlist';

/* Simulated variants — in production these come from Laravel API */
function getVariants(product: Product) {
  if (!product.startingAt) return [];
  const base = product.price;
  return [
    { label: '6 months', price: base, features: product.features.slice(0, 3) },
    { label: '12 months', price: +(Number(base) * 1.6).toFixed(2), features: product.features.slice(0, 3) },
  ];
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || '');
  const related = getRelatedProducts(slug || '');
  const { addItem } = useCart();

  const variants = product ? getVariants(product) : [];
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const unavailable = product ? (!product.inStock || product.onHold) : true;
  const currentPrice = product ? (variants.length > 0 ? variants[selectedVariant].price : product.price) : 0;
  const currentLabel = variants.length > 0 ? variants[selectedVariant].label : undefined;
  const lineTotal = currentPrice * quantity;

  const { toggle: toggleWishlist, isWished } = useWishlist();
  const { toast } = useToast();
  const wished = product ? isWished(product.id) : false;

  const productJsonLd = useMemo(() => {
    if (!product) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.imageUrl || undefined,
      url: `https://upgradercx.com/products/${product.slug}`,
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: Number(currentPrice).toFixed(2),
        priceCurrency: 'EUR',
        availability: unavailable
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UpgraderCX' },
      },
    };
  }, [product, currentPrice, unavailable]);

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This product doesn't exist or has been removed.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/products"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Browse Products</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!unavailable) {
      addItem(product, quantity, currentLabel, currentPrice);
    }
  };

  return (
    <div className="container py-6 sm:py-8">
      <SeoHead
        title={`${product.name} — UpgraderCX`}
        description={product.description}
        canonical={`https://upgradercx.com/products/${product.slug}`}
        type="product"
        image={product.imageUrl || undefined}
        jsonLd={productJsonLd}
      />
      {/* Breadcrumb */}
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/products">Products</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to={`/categories/${product.catSlug}`}>{product.category}</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Layout: image + details left, purchase panel right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: product info */}
        <div>
          {/* Variant title */}
          {currentLabel && (
            <h2 className="text-xl font-bold text-foreground mb-4">{currentLabel}</h2>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Image */}
            <Card className="overflow-hidden">
              <CardContent className="relative flex aspect-square items-center justify-center bg-muted/30 p-0">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4" />
                ) : (
                  <Package className="h-16 w-16 text-muted-foreground/25" />
                )}
                {product.badge && !unavailable && (
                  <Badge className="absolute left-3 top-3">{product.badge}</Badge>
                )}
                <button
                  className="absolute right-3 top-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  onClick={() => { toggleWishlist(product.id); toast({ title: wished ? 'Removed from wishlist' : 'Added to wishlist' }); }}
                >
                  <Heart className={`h-4 w-4 transition-colors ${wished ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                </button>
                {unavailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <span className="rounded bg-destructive/90 px-3 py-1.5 text-xs font-semibold text-destructive-foreground uppercase">
                      {product.onHold ? 'On Hold' : 'Unavailable'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <div className="flex flex-col gap-3">
              <div>
                <Link to={`/categories/${product.catSlug}`} className="text-xs font-medium text-primary hover:underline">
                  {product.category}
                </Link>
                <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{product.name}</h1>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

              <ul className="space-y-1.5">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Guarantee badges */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { icon: RefreshCw, label: 'Replacement Guarantee' },
                  { icon: Shield, label: 'Verified Seat' },
                  { icon: CheckCircle2, label: 'Dedicated Credentials' },
                  { icon: Headphones, label: '24/7 Support' },
                ].map((g) => (
                  <div key={g.label} className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1.5">
                    <g.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[10px] font-medium text-foreground">{g.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] text-muted-foreground leading-relaxed">
                <Shield className="inline h-3 w-3 text-primary mr-1" />
                <strong className="text-foreground">How it works:</strong> We purchase official multi-seat or family plans directly from providers, then allocate individual seats to customers — leveraging legitimate purchasing-power parity pricing. Seats are dedicated to you for the full subscription period.
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Payment:</span>
                <span className="text-xs font-medium text-foreground">Card | BTC | ETH | USDT | LTC</span>
              </div>

              <p className="text-[11px] text-muted-foreground">
                📢 Bulk / reseller deals available — DM to open a ticket!
              </p>
            </div>
          </div>
        </div>

        {/* Right: Purchase Panel */}
        <div className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-base font-bold text-foreground">Purchase</h3>

              {/* Quantity + Stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded border flex items-center justify-center hover:bg-accent"
                    disabled={unavailable}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded border flex items-center justify-center hover:bg-accent"
                    disabled={unavailable}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Stock <span className="font-bold">∞</span>
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-foreground">€{Number(lineTotal).toFixed(2)}</span>
                  {product.retailPrice && product.retailPrice > currentPrice && (
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-muted-foreground line-through">€{Number(product.retailPrice * quantity).toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-accent-foreground bg-accent rounded px-1 py-0.5">
                        Save {Math.round(((product.retailPrice - currentPrice) / product.retailPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Continue */}
              <Button className="w-full" disabled={unavailable} onClick={handleAddToCart}>
                {unavailable ? 'Unavailable' : 'Continue'}
              </Button>

              {/* Secondary actions */}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1.5" disabled={unavailable}>
                  <Tag className="h-3.5 w-3.5" /> Apply a Coupon
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1.5" disabled={unavailable} onClick={handleAddToCart}>
                  <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Variant selector cards */}
          {variants.length > 0 && (
            <div className="mt-3 space-y-2">
              {variants.map((v, idx) => (
                <button
                  key={v.label}
                  onClick={() => { setSelectedVariant(idx); setQuantity(1); }}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    idx === selectedVariant ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{v.label}</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Starting at</span>
                      <span className="ml-1.5 text-sm font-bold text-foreground">€{Number(v.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      Stock <span className="font-bold">∞</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection productSlug={product.slug} productName={product.name} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={`€${Number(p.price).toFixed(2)}`}
                startingAt={p.startingAt}
                imageUrl={p.imageUrl}
                inStock={p.inStock}
                onHold={p.onHold}
                badge={p.badge}
                product={p}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Reviews Section ─────────────────────────────────────────────────── */
interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

const SEED_REVIEWS: Record<string, Review[]> = {
  default: [
    { id: 1, author: 'Alex M.',  rating: 5, comment: 'Instant delivery, credentials work perfectly. Highly recommended!', date: new Date(Date.now() - 86400000 * 3).toISOString(),  helpful: 12, verified: true },
    { id: 2, author: 'Sara K.',  rating: 4, comment: 'Great price, had a minor login issue that support resolved in minutes.', date: new Date(Date.now() - 86400000 * 8).toISOString(), helpful: 7,  verified: true },
    { id: 3, author: 'Jordan T.', rating: 5, comment: 'Been using this service for 3 months, never had a problem. Worth every cent.', date: new Date(Date.now() - 86400000 * 15).toISOString(), helpful: 20, verified: false },
  ],
};

function StarRow({ rating, onChange, size = 'md' }: { rating: number; onChange?: (r: number) => void; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} ${onChange ? 'cursor-pointer hover:text-amber-400 transition-colors' : ''}`}
          onClick={() => onChange?.(n)}
        />
      ))}
    </div>
  );
}

function ReviewsSection({ productSlug, productName }: { productSlug: string; productName: string }) {
  const { toast } = useToast();
  const stored = JSON.parse(localStorage.getItem(`reviews_${productSlug}`) || 'null') as Review[] | null;
  const [reviews, setReviews] = useState<Review[]>(stored || SEED_REVIEWS.default);
  const [writeOpen, setWriteOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [helpfulVoted, setHelpfulVoted] = useState<Set<number>>(new Set());

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1);
  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  function submitReview() {
    if (!newComment.trim()) { toast({ title: 'Please write a review', variant: 'destructive' }); return; }
    const r: Review = { id: Date.now(), author: newAuthor.trim() || 'Anonymous', rating: newRating, comment: newComment.trim(), date: new Date().toISOString(), helpful: 0, verified: false };
    const updated = [r, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${productSlug}`, JSON.stringify(updated));
    setWriteOpen(false);
    setNewComment('');
    setNewAuthor('');
    toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
  }

  function markHelpful(id: number) {
    if (helpfulVoted.has(id)) return;
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r));
    setHelpfulVoted((prev) => new Set([...prev, id]));
  }

  return (
    <section className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Customer Reviews ({reviews.length})</h2>
        <Button size="sm" onClick={() => setWriteOpen(true)} className="gap-1.5"><Star className="h-3.5 w-3.5" />Write a Review</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Summary */}
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-foreground">{Number(avgRating || 0).toFixed(1)}</p>
            <StarRow rating={Math.round(avgRating)} size="md" />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-1">
            {ratingDist.map(({ n, count }) => (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{n}</span>
                <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-xs text-muted-foreground w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.author}</span>
                    {r.verified && <Badge variant="outline" className="text-[9px] h-4 px-1">Verified</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRow rating={r.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{r.comment}</p>
              <button
                className={`flex items-center gap-1.5 text-xs ${helpfulVoted.has(r.id) ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                onClick={() => markHelpful(r.id)}
              >
                <ThumbsUp className="h-3 w-3" />{r.helpful} found this helpful
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Write review dialog */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review {productName}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Your rating</p>
              <StarRow rating={newRating} onChange={setNewRating} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Your name (optional)</p>
              <Input placeholder="Anonymous" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Review</p>
              <Textarea rows={4} placeholder="Share your experience with this product..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setWriteOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} className="gap-1.5"><Star className="h-3.5 w-3.5" />Submit Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
