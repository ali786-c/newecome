import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const {
    items, isCartOpen, setCartOpen, removeItem, updateQuantity,
    subtotal, couponCode, setCouponCode, couponApplied, applyCoupon,
    discount, total, clearCart, itemCount,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-5 w-5" />
            Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button size="sm" variant="outline" onClick={() => setCartOpen(false)} asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variantLabel || ''}`} className="flex gap-3 rounded-lg border bg-card p-3">
                  {/* Thumbnail */}
                  <div className="h-14 w-14 shrink-0 rounded-md bg-muted/30 overflow-hidden">
                    {item.product.image_url && (
                      <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-contain p-1" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                    {item.variantLabel && (
                      <p className="text-[10px] text-muted-foreground">{item.variantLabel}</p>
                    )}
                    <p className="text-sm font-bold text-foreground mt-0.5">€{Number(item.unitPrice).toFixed(2)}</p>
                    {/* Quantity controls */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantLabel)}
                        className="h-6 w-6 rounded border flex items-center justify-center text-muted-foreground hover:bg-accent"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantLabel)}
                        className="h-6 w-6 rounded border flex items-center justify-center text-muted-foreground hover:bg-accent"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id, item.variantLabel)}
                        className="ml-auto h-6 w-6 rounded flex items-center justify-center text-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: coupon + totals */}
            <div className="border-t px-5 py-4 space-y-3 bg-muted/20">
              {/* Coupon */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
                    className="h-8 pl-8 text-xs"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={applyCoupon} disabled={couponApplied || !couponCode.trim()}>
                  {couponApplied ? 'Applied' : 'Apply'}
                </Button>
              </div>

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>€{Number(subtotal).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-€{Number(discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground pt-1 border-t">
                  <span>Total</span>
                  <span>€{Number(total).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <Button className="w-full" size="sm" asChild>
                <Link to="/checkout" onClick={() => setCartOpen(false)}>
                  Continue to Checkout
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
