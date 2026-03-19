import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApiQuery, useApiMutation } from '@/hooks/use-api-query';
import { walletApi } from '@/api/wallet.api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Loader2, Check, ArrowLeft } from 'lucide-react';

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.67 4.45-.732 7.397-5.476 7.397h-2.19a1.58 1.58 0 0 0-1.564 1.335l-1.12 7.106a.641.641 0 0 0 .633.74h3.344a.641.641 0 0 0 .633-.54l.72-4.562a.641.641 0 0 1 .633-.54h1.99c3.817 0 6.834-2.174 7.55-6.075.326-1.77.072-3.208-.546-4.32z"/>
    </svg>
  );
}

const PACKAGES = [
  { amount: 10, label: '€10', bonus: null },
  { amount: 25, label: '€25', bonus: null },
  { amount: 50, label: '€50', bonus: '€2 bonus' },
  { amount: 100, label: '€100', bonus: '€5 bonus' },
];

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, AMEX' },
  { id: 'crypto', label: 'Cryptocurrency', icon: Wallet, desc: 'BTC, ETH, USDT, LTC' },
  { id: 'paypal', label: 'PayPal', icon: PayPalIcon, desc: 'Pay with PayPal balance' },
];

export default function TopUp() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const { data: balanceRes } = useApiQuery(['my-balance'], () => walletApi.getBalance());

  const topUpMutation = useApiMutation(
    () => walletApi.topUp({ amount: selectedAmount || parseFloat(customAmount), payment_method: paymentMethod }),
    { onSuccess: () => { toast({ title: 'Top-up successful', description: `€${(selectedAmount || parseFloat(customAmount)).toFixed(2)} added to your wallet.` }); navigate('/wallet'); } }
  );

  const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <PageScaffold
      title="Top Up Wallet"
      description="Add funds to your wallet balance."
      actions={<Button variant="outline" size="sm" onClick={() => navigate('/wallet')}><ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to Wallet</Button>}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Amount Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Amount</CardTitle>
              <CardDescription>Choose a preset or enter a custom amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.amount}
                    onClick={() => { setSelectedAmount(pkg.amount); setCustomAmount(''); }}
                    className={`relative rounded-lg border-2 p-4 text-center transition-colors ${selectedAmount === pkg.amount ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <span className="text-xl font-bold">{pkg.label}</span>
                    {pkg.bonus && <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px]">{pkg.bonus}</Badge>}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Custom Amount (€)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount in EUR"
                  min={1}
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-colors ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <method.icon className="h-5 w-5 shrink-0" />
                    <div className="text-left">
                      <span className="text-sm font-medium block">{method.label}</span>
                      <span className="text-[10px] text-muted-foreground">{method.desc}</span>
                    </div>
                    {paymentMethod === method.id && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Balance</span>
                <span>€{balanceRes?.data?.balance?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top-up Amount</span>
                <span className="font-medium">€{amount > 0 ? amount.toFixed(2) : '0.00'}</span>
              </div>
              {amount >= 50 && (
                <div className="flex justify-between text-primary">
                  <span>Bonus</span>
                  <span>+€{amount >= 100 ? '5.00' : '2.00'}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">New Balance</span>
                <span className="font-bold">€{((balanceRes?.data?.balance ?? 0) + (amount > 0 ? amount : 0) + (amount >= 100 ? 5 : amount >= 50 ? 2 : 0)).toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" disabled={amount <= 0 || topUpMutation.isPending} onClick={() => topUpMutation.mutate(undefined)}>
              {topUpMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Pay €{amount > 0 ? amount.toFixed(2) : '0.00'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageScaffold>
  );
}
