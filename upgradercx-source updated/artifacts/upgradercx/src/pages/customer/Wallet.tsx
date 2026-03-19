import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/hooks/use-api-query';
import { walletApi } from '@/api/wallet.api';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function WalletPage() {
  const { data: balanceRes } = useApiQuery(['my-balance'], () => walletApi.getBalance());
  const { data: txnRes, isLoading } = useApiQuery(['my-transactions'], () => walletApi.getTransactions());

  const balance = balanceRes?.data;
  const transactions = txnRes?.data || [];

  return (
    <PageScaffold title="Wallet" description="Manage your balance and view transactions.">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">€{Number(balance?.balance || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{balance?.currency || 'EUR'}</p>
              <Button className="mt-4" asChild>
                <Link to="/wallet/top-up"><Plus className="mr-2 h-4 w-4" />Top Up</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Credits</span>
                <span className="font-medium">€{transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Debits</span>
                <span className="font-medium">€{transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-medium">{transactions.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${txn.type === 'credit' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {txn.type === 'credit' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${txn.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                        {txn.type === 'credit' ? '+' : '-'}€{Number(txn.amount).toFixed(2)}
                      </span>
                      {txn.reference && <p className="text-[10px] text-muted-foreground">{txn.reference}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageScaffold>
  );
}
