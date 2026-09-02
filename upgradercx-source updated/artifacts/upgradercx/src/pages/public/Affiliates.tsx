import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

export default function Affiliates() {
  return (
    <div className="container max-w-4xl py-12">
      <PageScaffold title="Affiliate & Reseller Program" description="Earn commissions by referring customers to UpgraderCX.">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: DollarSign, title: 'Earn Commissions', desc: 'Up to 20% recurring commission on every referral.' },
            { icon: Users, title: 'Reseller Tiers', desc: 'Volume-based pricing tiers for resellers.' },
            { icon: TrendingUp, title: 'Real-time Tracking', desc: 'Track your earnings and referrals in your dashboard.' },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6 text-center">
                <item.icon className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/register">Join the Program</Link>
          </Button>
        </div>
      </PageScaffold>
    </div>
  );
}
