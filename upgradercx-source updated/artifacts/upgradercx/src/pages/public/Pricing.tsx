import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  { name: 'Starter', price: '$9', period: '/mo', features: ['5 Products', 'Email Support', 'Basic Dashboard'] },
  { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited Products', 'Priority Support', 'Advanced Analytics', 'API Access'], popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Dedicated Manager', 'SLA Guarantee', 'Custom Integrations'] },
];

export default function Pricing() {
  return (
    <div className="container py-12">
      <PageScaffold title="Pricing" description="Simple, transparent pricing for every business size.">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-primary shadow-md' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageScaffold>
    </div>
  );
}
