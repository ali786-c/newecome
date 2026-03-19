import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gift, Users, DollarSign, TrendingUp, Send, Wallet } from 'lucide-react';
import type { ReferralStats, Referral } from '@/types';

// Mock data (will come from API)
const MOCK_STATS: ReferralStats = {
  total_referrals: 3,
  total_earned: 14.97,
  commission_rate: 20,
  referral_code: 'JANE2025',
  referral_url: 'https://upgradercx.com/ref/JANE2025',
};

const MOCK_REFERRALS: Referral[] = [
  { id: 1, referrer_id: 1, referred_id: 10, referred_user: { id: 10, name: 'Alex M.', email: 'alex@example.com', role: 'customer', created_at: '2025-02-15T00:00:00Z', updated_at: '2025-02-15T00:00:00Z' }, commission: 5.99, status: 'credited', created_at: '2025-02-15T00:00:00Z' },
  { id: 2, referrer_id: 1, referred_id: 11, referred_user: { id: 11, name: 'Sam T.', email: 'sam@example.com', role: 'customer', created_at: '2025-02-20T00:00:00Z', updated_at: '2025-02-20T00:00:00Z' }, commission: 4.99, status: 'credited', created_at: '2025-02-20T00:00:00Z' },
  { id: 3, referrer_id: 1, referred_id: 12, referred_user: { id: 12, name: 'Pat K.', email: 'pat@example.com', role: 'customer', created_at: '2025-03-01T00:00:00Z', updated_at: '2025-03-01T00:00:00Z' }, commission: 3.99, status: 'pending', created_at: '2025-03-01T00:00:00Z' },
];

export default function Referrals() {
  const { toast } = useToast();
  const stats = MOCK_STATS;
  const referrals = MOCK_REFERRALS;
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('wallet');
  const [payoutAddress, setPayoutAddress] = useState('');

  const credited = referrals.filter((r) => r.status === 'credited').reduce((s, r) => s + r.commission, 0);

  const copyLink = () => {
    navigator.clipboard.writeText(stats.referral_url);
    toast({ title: 'Link copied!', description: 'Share it with friends to earn commissions.' });
  };

  const requestPayout = () => {
    if (credited < 5) { toast({ title: 'Minimum €5.00 required', variant: 'destructive' }); return; }
    setPayoutOpen(false);
    toast({ title: 'Payout requested!', description: `€${credited.toFixed(2)} will be processed within 24h.` });
  };

  return (
    <PageScaffold title="Referrals" description="Share your link and earn commissions on every purchase.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_referrals}</p>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">${stats.total_earned.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.commission_rate}%</p>
                  <p className="text-xs text-muted-foreground">Commission Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">${(stats.total_earned * 0.2).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Referral Link</CardTitle>
            <CardDescription>Share this link — you earn {stats.commission_rate}% commission on each purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={stats.referral_url} className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Code: {stats.referral_code}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No referrals yet</TableCell></TableRow>
                ) : referrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="font-medium">{ref.referred_user?.name || 'User'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(ref.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">${ref.commission.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={ref.status === 'credited' ? 'default' : 'outline'}>{ref.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Payout section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" />Commission Payout</CardTitle>
            <CardDescription>Request a payout of your credited commission earnings. Minimum €5.00.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">€{credited.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Available to withdraw</p>
              </div>
              <Button onClick={() => setPayoutOpen(true)} disabled={credited < 5} className="gap-1.5">
                <Send className="h-4 w-4" />Request Payout
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Payouts are processed within 24 hours via your chosen method. Minimum payout is €5.00.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Request Commission Payout</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-sm text-muted-foreground">Available balance</p>
              <p className="text-xl font-bold text-foreground">€{credited.toFixed(2)}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Payout Method</Label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">Wallet Balance (instant)</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Crypto (USDT/BTC)</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {payoutMethod !== 'wallet' && (
              <div className="space-y-1.5">
                <Label>{payoutMethod === 'paypal' ? 'PayPal Email' : payoutMethod === 'crypto' ? 'Wallet Address' : 'IBAN'}</Label>
                <Input value={payoutAddress} onChange={(e) => setPayoutAddress(e.target.value)} placeholder={payoutMethod === 'paypal' ? 'you@example.com' : payoutMethod === 'crypto' ? '0x...' : 'GB29 NWBK...'} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button onClick={requestPayout} className="gap-1.5"><Send className="h-4 w-4" />Confirm Payout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageScaffold>
  );
}
