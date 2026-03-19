import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingBag, CreditCard, Wallet, ArrowLeft, CheckCircle2, Tag, AlertCircle } from 'lucide-react';
import { checkoutSchema } from '@/lib/schemas/checkout.schema';
import { useToast } from '@/hooks/use-toast';
import { orderApi } from '@/api/order.api';
import { walletApi } from '@/api/wallet.api';

export default function Checkout() {
  const { items, subtotal, discount, total, couponCode, setCouponCode, couponApplied, applyCoupon } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('payhub');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingBalance(true);
      walletApi.getBalance()
        .then(res => setWalletBalance(res.data.balance))
        .catch(err => console.error("Balance fetch failed", err))
        .finally(() => setLoadingBalance(false));
    }
  }, [isAuthenticated]);

  const handlePay = async () => {
    setEmailError('');
    const result = checkoutSchema.safeParse({ email, paymentMethod });
    if (!result.success) {
      const emailErr = result.error.issues.find((e) => e.path[0] === 'email');
      if (emailErr) setEmailError(emailErr.message);
      toast({ title: 'Validation error', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'wallet' && walletBalance !== null && walletBalance < total) {
      toast({ title: 'Insufficient Balance', description: 'You do not have enough funds in your wallet.', variant: 'destructive' });
      return;
    }

    try {
      toast({ title: 'Processing…', description: 'Creating your order.' });

      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        notes: `Customer Email: ${email}`
      };

      const response = await orderApi.create(orderData);

      // The backend returns checkout_url if payment_method is handled by Pay Hub
      if ((response as any).checkout_url) {
        toast({ title: 'Redirecting', description: 'Taking you to the payment secure gateway.' });
        window.location.href = (response as any).checkout_url;
      } else if (paymentMethod === 'wallet') {
        toast({ title: 'Payment Successful', description: 'Order paid via wallet balance.' });
        // Redirect to orders page or success page
        setTimeout(() => window.location.href = '/orders', 1500);
      } else {
        toast({ title: 'Order Created', description: 'Your order has been placed successfully.' });
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({ title: 'Checkout Failed', description: 'There was an error processing your order.', variant: 'destructive' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Browse our products and add items to your cart.</p>
        <Button className="mt-4" asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 sm:py-10">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
        <Link to="/products"><ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping</Link>
      </Button>

      <h1 className="text-xl font-bold text-foreground sm:text-2xl mb-6">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Email */}
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="checkout-email">Email address *</Label>
                <Input id="checkout-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={emailError ? 'border-destructive' : ''} />
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                <p className="text-[11px] text-muted-foreground">Your product will be delivered to this email.</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                {/* Pay Hub */}
                <Label
                  htmlFor="payhub"
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors ${paymentMethod === 'payhub' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="payhub" id="payhub" className="sr-only" />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Gateway (Pay Hub)</p>
                      <p className="text-xs text-muted-foreground">Stripe, Crypto, and more</p>
                    </div>
                  </div>
                  {paymentMethod === 'payhub' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </Label>

                {/* Wallet (Only if authenticated) */}
                {isAuthenticated && (
                  <Label
                    htmlFor="wallet"
                    className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border'} ${walletBalance !== null && walletBalance < total ? 'opacity-60 grayscale' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wallet" id="wallet" className="sr-only" disabled={walletBalance !== null && walletBalance < total} />
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Wallet Balance</p>
                        <p className="text-xs text-muted-foreground">
                          {loadingBalance ? 'Loading balance...' : `Available: €${walletBalance?.toFixed(2) || '0.00'}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {walletBalance !== null && walletBalance < total && (
                        <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Insufficient
                        </span>
                      )}
                      {paymentMethod === 'wallet' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  </Label>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variantLabel || ''}`} className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded bg-muted/30 overflow-hidden">
                      {item.product.image_url && <img src={item.product.image_url} alt="" className="h-full w-full object-contain p-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      {item.variantLabel && <p className="text-[10px] text-muted-foreground">{item.variantLabel}</p>}
                      <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">€{(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

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
              <div className="space-y-1.5 text-sm border-t pt-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground text-base pt-1 border-t">
                  <span>Total</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handlePay} disabled={paymentMethod === 'wallet' && (walletBalance === null || walletBalance < total)}>
                {paymentMethod === 'wallet' ? <Wallet className="mr-1.5 h-4 w-4" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                Pay €{total.toFixed(2)}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center">
                By completing this purchase you agree to our <Link to="/terms" className="text-primary underline">Terms of Service</Link> and <Link to="/refund-policy" className="text-primary underline">Refund Policy</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
