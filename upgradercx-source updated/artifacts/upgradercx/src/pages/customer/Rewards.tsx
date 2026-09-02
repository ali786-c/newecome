import { useState, useEffect } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Gift, Star, Zap, Trophy, TrendingUp, ShoppingCart, CheckCircle2, Clock, Lock,
} from 'lucide-react';

interface RewardTier {
  name: string;
  minPoints: number;
  color: string;
  multiplier: number;
  perks: string[];
}

interface PointTransaction {
  id: number;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  amount: number;
  description: string;
  date: string;
  orderId?: string;
}

interface RedeemOption {
  id: string;
  label: string;
  points: number;
  value: string;
  icon: React.ReactNode;
}

const TIERS: RewardTier[] = [
  { name: 'Bronze',   minPoints: 0,    color: 'text-amber-700',  multiplier: 1,   perks: ['1 pt per €1 spent', 'Birthday bonus'] },
  { name: 'Silver',   minPoints: 500,  color: 'text-slate-500',  multiplier: 1.5, perks: ['1.5x points', 'Early access to deals', 'Priority support'] },
  { name: 'Gold',     minPoints: 2000, color: 'text-yellow-500', multiplier: 2,   perks: ['2x points', 'Free replacement upgrades', 'Dedicated account manager'] },
  { name: 'Diamond',  minPoints: 5000, color: 'text-cyan-400',   multiplier: 3,   perks: ['3x points', 'Exclusive products', 'Free monthly seat upgrade'] },
];

const MOCK_TRANSACTIONS: PointTransaction[] = [
  { id: 1, type: 'earned', amount: 60, description: 'Order #ORD-00145 — Netflix Premium 6mo', date: new Date(Date.now() - 86400000 * 1).toISOString(), orderId: 'ORD-00145' },
  { id: 2, type: 'bonus',  amount: 50, description: 'Welcome bonus — first purchase', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 3, type: 'earned', amount: 30, description: 'Order #ORD-00122 — Spotify Premium', date: new Date(Date.now() - 86400000 * 10).toISOString(), orderId: 'ORD-00122' },
  { id: 4, type: 'redeemed', amount: -100, description: 'Redeemed for €1.00 wallet credit', date: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: 5, type: 'earned', amount: 25, description: 'Referral bonus — Alex M. first purchase', date: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 6, type: 'earned', amount: 50, description: 'Order #ORD-00098 — ChatGPT Plus', date: new Date(Date.now() - 86400000 * 30).toISOString(), orderId: 'ORD-00098' },
];

const REDEEM_OPTIONS: RedeemOption[] = [
  { id: 'wallet50',  label: '50 pts → €0.50 credit',  points: 50,   value: '€0.50',  icon: <Gift className="h-4 w-4 text-primary" /> },
  { id: 'wallet100', label: '100 pts → €1.00 credit', points: 100,  value: '€1.00',  icon: <Gift className="h-4 w-4 text-primary" /> },
  { id: 'wallet250', label: '250 pts → €2.50 credit', points: 250,  value: '€2.50',  icon: <Gift className="h-4 w-4 text-primary" /> },
  { id: 'wallet500', label: '500 pts → €5.00 credit', points: 500,  value: '€5.00',  icon: <Gift className="h-4 w-4 text-primary" /> },
  { id: 'coupon10',  label: '300 pts → 10% coupon',   points: 300,  value: '10% off', icon: <Zap className="h-4 w-4 text-amber-500" /> },
  { id: 'coupon20',  label: '600 pts → 20% coupon',   points: 600,  value: '20% off', icon: <Zap className="h-4 w-4 text-amber-500" /> },
];

const typeConfig = {
  earned:   { label: 'Earned',   variant: 'default'     as const, icon: <TrendingUp className="h-3.5 w-3.5" /> },
  redeemed: { label: 'Redeemed', variant: 'destructive' as const, icon: <Gift className="h-3.5 w-3.5" /> },
  bonus:    { label: 'Bonus',    variant: 'secondary'   as const, icon: <Star className="h-3.5 w-3.5" /> },
  expired:  { label: 'Expired',  variant: 'outline'     as const, icon: <Clock className="h-3.5 w-3.5" /> },
};

export default function Rewards() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PointTransaction[]>(MOCK_TRANSACTIONS);

  useEffect(() => { document.title = 'Rewards — UpgraderCX'; }, []);

  const totalPoints = transactions.reduce((s, t) => s + t.amount, 0);
  const currentTier = TIERS.slice().reverse().find((t) => totalPoints >= t.minPoints) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
  const tierProgress = nextTier ? Math.min(100, Math.round(((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100)) : 100;

  function redeem(option: RedeemOption) {
    if (totalPoints < option.points) {
      toast({ title: 'Not enough points', description: `You need ${option.points - totalPoints} more points.`, variant: 'destructive' });
      return;
    }
    const tx: PointTransaction = {
      id: Date.now(), type: 'redeemed', amount: -option.points,
      description: `Redeemed for ${option.value}`, date: new Date().toISOString(),
    };
    setTransactions((p) => [tx, ...p]);
    toast({ title: 'Redeemed!', description: `${option.value} added to your account.` });
  }

  return (
    <PageScaffold title="Rewards" description="Earn points with every purchase and redeem them for discounts.">
      <div className="space-y-6">
        {/* Points summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="sm:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Trophy className={`h-7 w-7 ${currentTier.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{currentTier.name} Member</p>
                  <p className="text-3xl font-extrabold text-foreground">{totalPoints.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">pts</span></p>
                  {nextTier && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{currentTier.name}</span>
                        <span>{nextTier.name} ({nextTier.minPoints - totalPoints} pts away)</span>
                      </div>
                      <Progress value={tierProgress} className="h-1.5" />
                    </div>
                  )}
                  {!nextTier && <p className="text-xs text-primary mt-1 font-medium">You've reached the highest tier!</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{currentTier.name} Perks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {currentTier.perks.map((p) => (
                  <li key={p} className="flex items-center gap-1.5 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tier ladder */}
        <Card>
          <CardHeader><CardTitle className="text-base">Membership Tiers</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((tier) => {
                const unlocked = totalPoints >= tier.minPoints;
                return (
                  <div key={tier.name} className={`rounded-lg border p-3 ${unlocked ? 'border-primary/30 bg-primary/5' : 'opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {unlocked ? <Trophy className={`h-4 w-4 ${tier.color}`} /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                      <span className={`text-sm font-bold ${tier.color}`}>{tier.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{tier.minPoints.toLocaleString()}+ pts · {tier.multiplier}x earn rate</p>
                    <ul className="space-y-1">
                      {tier.perks.slice(0, 2).map((p) => <li key={p} className="text-[10px] text-muted-foreground">• {p}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Redeem */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Redeem Points</CardTitle>
            <CardDescription>Convert your points to wallet credit or discount coupons.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {REDEEM_OPTIONS.map((opt) => {
                const canRedeem = totalPoints >= opt.points;
                return (
                  <div key={opt.id} className={`rounded-lg border p-3 flex items-center justify-between gap-2 ${canRedeem ? '' : 'opacity-50'}`}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <div>
                        <p className="text-sm font-medium text-foreground">{opt.value}</p>
                        <p className="text-xs text-muted-foreground">{opt.points} points</p>
                      </div>
                    </div>
                    <Button size="sm" variant={canRedeem ? 'default' : 'outline'} className="shrink-0" onClick={() => redeem(opt)} disabled={!canRedeem}>
                      Redeem
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader><CardTitle className="text-base">Points History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => {
                  const cfg = typeConfig[t.type];
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-foreground">{t.description}{t.orderId && <span className="ml-1.5 font-mono text-xs text-muted-foreground">{t.orderId}</span>}</TableCell>
                      <TableCell><Badge variant={cfg.variant} className="gap-1">{cfg.icon}{cfg.label}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell className={`text-right font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageScaffold>
  );
}
