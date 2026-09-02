import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, Bitcoin, Wallet, ShoppingBag, Eye, EyeOff,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink,
  Copy, Shield, Zap, DollarSign, Globe,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/* ── Compliance tips ── */
const COMPLIANCE_TIPS = [
  { icon: Shield, text: 'Always describe products as "authorized family/team plan" — never use "cheap" or "cracked".' },
  { icon: CheckCircle2, text: 'Require ToS acceptance checkbox before every purchase.' },
  { icon: AlertTriangle, text: 'Add velocity checks: block >3 failed cards per IP/hour.' },
  { icon: Globe, text: 'Enable geo-blocking for high-chargeback regions (confirmed in dashboard).' },
  { icon: DollarSign, text: 'Offer crypto (NOWPayments) for high-risk GEOs to reduce Stripe disputes.' },
];

/* ── Gateway card ── */
interface GatewayCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  live: boolean;
  children: React.ReactNode;
}

function GatewayCard({ name, description, icon, color, connected, live, children }: GatewayCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {live ? (
              <Badge className="bg-green-500/10 text-green-700 border-green-200">Live</Badge>
            ) : (
              <Badge variant="secondary">Test</Badge>
            )}
            {connected ? (
              <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <XCircle className="h-3 w-3" /> Not Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

/* ── Key field with show/hide ── */
function SecretField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10 font-mono text-xs"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShow(!show)}>
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function Payments() {
  /* ── Stripe state ── */
  const [stripePublic, setStripePublic] = useState('pk_test_••••••');
  const [stripeSecret, setStripeSecret] = useState('sk_test_••••••');
  const [stripeWebhook, setStripeWebhook] = useState('whsec_••••••');
  const [stripeLive, setStripeLive] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(true);

  /* ── PayPal state ── */
  const [ppClientId, setPpClientId] = useState('');
  const [ppSecret, setPpSecret] = useState('');
  const [ppSandbox, setPpSandbox] = useState(true);
  const [ppEnabled, setPpEnabled] = useState(false);

  /* ── NOWPayments state ── */
  const [nowKey, setNowKey] = useState('');
  const [nowIpn, setNowIpn] = useState('');
  const [nowEnabled, setNowEnabled] = useState(false);
  const [nowCoins, setNowCoins] = useState({ btc: true, eth: true, usdt: true, ltc: true, bnb: false, xmr: false });

  /* ── Wholesale Supplier API state ── */
  const [g2gKey, setG2gKey] = useState('');
  const [g2gSecret, setG2gSecret] = useState('');
  const [g2gEnabled, setG2gEnabled] = useState(false);

  const save = (name: string) => toast({ title: `${name} settings saved`, description: 'Changes will apply to new transactions.' });
  const copy = (val: string) => { navigator.clipboard.writeText(val); toast({ title: 'Copied to clipboard' }); };

  const webhookUrl = `${window.location.origin}/api/webhooks/stripe`;
  const nowCallbackUrl = `${window.location.origin}/api/webhooks/nowpayments`;
  const ppWebhookUrl = `${window.location.origin}/api/webhooks/paypal`;

  return (
    <PageScaffold
      title="Payment Gateways"
      description="Configure Stripe, PayPal, NOWPayments (crypto), and wholesale supplier payouts."
    >
      <Tabs defaultValue="stripe">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="stripe" className="gap-2"><CreditCard className="h-3.5 w-3.5" /> Stripe</TabsTrigger>
          <TabsTrigger value="paypal" className="gap-2"><Wallet className="h-3.5 w-3.5" /> PayPal</TabsTrigger>
          <TabsTrigger value="crypto" className="gap-2"><Bitcoin className="h-3.5 w-3.5" /> NOWPayments</TabsTrigger>
          <TabsTrigger value="g2g" className="gap-2"><ShoppingBag className="h-3.5 w-3.5" /> Wholesale Supplier</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2"><Shield className="h-3.5 w-3.5" /> Compliance</TabsTrigger>
        </TabsList>

        {/* ── Stripe ── */}
        <TabsContent value="stripe">
          <GatewayCard
            id="stripe"
            name="Stripe"
            description="Card payments, 3DS, Apple Pay, Google Pay"
            icon={<CreditCard className="h-5 w-5 text-white" />}
            color="bg-[#635BFF]"
            connected={!!stripeSecret}
            live={stripeLive}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Stripe</p>
                  <p className="text-xs text-muted-foreground">Show Stripe card payment at checkout</p>
                </div>
                <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Live mode</p>
                  <p className="text-xs text-muted-foreground">Switch from test keys to production</p>
                </div>
                <Switch checked={stripeLive} onCheckedChange={setStripeLive} />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <SecretField label="Publishable Key" placeholder="pk_live_..." value={stripePublic} onChange={setStripePublic} />
                <SecretField label="Secret Key" placeholder="sk_live_..." value={stripeSecret} onChange={setStripeSecret} />
                <div className="sm:col-span-2">
                  <SecretField label="Webhook Signing Secret" placeholder="whsec_..." value={stripeWebhook} onChange={setStripeWebhook} />
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">Webhook endpoint URL</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{webhookUrl}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copy(webhookUrl)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Register this URL in your{' '}
                  <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline">
                    Stripe Dashboard → Webhooks
                  </a>
                  . Events needed: <code className="bg-background px-1 rounded">payment_intent.succeeded</code>, <code className="bg-background px-1 rounded">charge.dispute.created</code>
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save('Stripe')}>Save Stripe Settings</Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    Open Stripe Dashboard <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </GatewayCard>
        </TabsContent>

        {/* ── PayPal ── */}
        <TabsContent value="paypal">
          <GatewayCard
            id="paypal"
            name="PayPal"
            description="PayPal Checkout, PayPal Credit, Venmo"
            icon={<Wallet className="h-5 w-5 text-white" />}
            color="bg-[#003087]"
            connected={!!ppClientId}
            live={!ppSandbox}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable PayPal</p>
                  <p className="text-xs text-muted-foreground">Show PayPal button at checkout</p>
                </div>
                <Switch checked={ppEnabled} onCheckedChange={setPpEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sandbox mode</p>
                  <p className="text-xs text-muted-foreground">Use PayPal sandbox for testing</p>
                </div>
                <Switch checked={ppSandbox} onCheckedChange={setPpSandbox} />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <SecretField label="Client ID" placeholder="AXxx..." value={ppClientId} onChange={setPpClientId} />
                <SecretField label="Client Secret" placeholder="Exx..." value={ppSecret} onChange={setPpSecret} />
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">Webhook URL (IPN/REST)</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{ppWebhookUrl}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copy(ppWebhookUrl)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Add in{' '}
                  <a href="https://developer.paypal.com/dashboard/webhooks" target="_blank" rel="noopener noreferrer" className="underline">
                    PayPal Developer → Webhooks
                  </a>
                  . Events: <code className="bg-background px-1 rounded">PAYMENT.CAPTURE.COMPLETED</code>, <code className="bg-background px-1 rounded">PAYMENT.CAPTURE.DENIED</code>
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save('PayPal')}>Save PayPal Settings</Button>
                <Button variant="outline" asChild>
                  <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    PayPal Developer <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </GatewayCard>
        </TabsContent>

        {/* ── NOWPayments / Crypto ── */}
        <TabsContent value="crypto">
          <GatewayCard
            id="nowpayments"
            name="NOWPayments"
            description="BTC, ETH, USDT, LTC, BNB, XMR and 300+ more coins"
            icon={<Bitcoin className="h-5 w-5 text-white" />}
            color="bg-amber-500"
            connected={!!nowKey}
            live={false}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Crypto Payments</p>
                  <p className="text-xs text-muted-foreground">Show crypto option at checkout</p>
                </div>
                <Switch checked={nowEnabled} onCheckedChange={setNowEnabled} />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <SecretField label="API Key" placeholder="NOWPayments API Key" value={nowKey} onChange={setNowKey} />
                <SecretField label="IPN Secret Key" placeholder="IPN secret for webhook verification" value={nowIpn} onChange={setNowIpn} />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Accepted Cryptocurrencies</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(nowCoins).map(([coin, enabled]) => (
                    <button
                      key={coin}
                      onClick={() => setNowCoins((prev) => ({ ...prev, [coin]: !prev[coin as keyof typeof prev] }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors uppercase ${
                        enabled
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium">IPN Callback URL</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{nowCallbackUrl}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copy(nowCallbackUrl)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure in{' '}
                  <a href="https://account.nowpayments.io/store-settings" target="_blank" rel="noopener noreferrer" className="underline">
                    NOWPayments → Store Settings
                  </a>
                  . Enable IPN and set this as your callback URL.
                </p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Pro tip
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Route customers from high-chargeback regions (RU, NG, PK, IN) automatically to crypto checkout to protect your Stripe account health.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save('NOWPayments')}>Save Crypto Settings</Button>
                <Button variant="outline" asChild>
                  <a href="https://nowpayments.io/dashboard" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    NOWPayments Dashboard <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </GatewayCard>
        </TabsContent>

        {/* ── Wholesale Supplier API ── */}
        <TabsContent value="g2g">
          <GatewayCard
            id="wholesale"
            name="Wholesale Supplier API"
            description="Source digital products from verified wholesale suppliers at reseller pricing"
            icon={<ShoppingBag className="h-5 w-5 text-white" />}
            color="bg-rose-500"
            connected={!!g2gKey}
            live={false}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Wholesale Sourcing</p>
                  <p className="text-xs text-muted-foreground">Auto-fulfill orders via supplier API</p>
                </div>
                <Switch checked={g2gEnabled} onCheckedChange={setG2gEnabled} />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                <SecretField label="Supplier API Key" placeholder="Reseller API key" value={g2gKey} onChange={setG2gKey} />
                <SecretField label="Supplier API Secret" placeholder="Reseller API secret" value={g2gSecret} onChange={setG2gSecret} />
              </div>
              <div className="rounded-md bg-muted p-3 space-y-2">
                <p className="text-xs font-medium">How wholesale sourcing works</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Customer places order on UpgraderCX</li>
                  <li>System identifies lowest-cost wholesale listing for the product</li>
                  <li>Auto-purchases from supplier with your reseller balance</li>
                  <li>Delivery credentials are forwarded to customer automatically</li>
                  <li>Margin = your price − supplier cost − platform fee</li>
                </ol>
              </div>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-800">Legal note</p>
                <p className="text-xs text-blue-700 mt-1">
                  Maintain a formal reseller agreement with all wholesale suppliers. Document your supply chain for compliance reviews. Only source from suppliers with verified track records and formal business agreements.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save('Wholesale Supplier')}>Save Supplier Settings</Button>
                <Button variant="outline" asChild>
                  <a href="/admin/supplier-sync" className="gap-1.5">
                    Supplier Price Sync <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </GatewayCard>
        </TabsContent>

        {/* ── Compliance ── */}
        <TabsContent value="compliance">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Payment Processor Compliance Guide
                </CardTitle>
                <CardDescription>Follow these rules to protect your Stripe, PayPal, and crypto gateway accounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {COMPLIANCE_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <tip.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{tip.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stripe-Safe Language Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ['✅ Use', '❌ Never use'],
                    ['"Authorized family/team plan"', '"Cracked account"'],
                    ['"Shared subscription (legal)"', '"Cheap hack"'],
                    ['"Plan upgrade"', '"Unauthorized sharing"'],
                    ['"Reseller access"', '"Bypass region lock"'],
                    ['"Digital upgrade service"', '"Account generator"'],
                  ].map(([a, b], i) => (
                    <div key={i} className={`text-xs p-2 rounded ${i === 0 ? 'font-semibold text-muted-foreground' : 'bg-muted'}`}>
                      {i === 0 ? <div className="grid grid-cols-2 gap-4"><span>{a}</span><span>{b}</span></div> : <div className="grid grid-cols-2 gap-4"><span className="text-green-700">{a}</span><span className="text-red-600">{b}</span></div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: 'Stripe Chargeback Rate', value: '0.4%', target: '< 1%', status: 'good' },
                { title: 'PayPal Dispute Rate', value: '0.7%', target: '< 1.5%', status: 'good' },
                { title: 'Crypto Fail Rate', value: '0%', target: '0%', status: 'good' },
              ].map((m) => (
                <Card key={m.title}>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">{m.title}</p>
                    <p className="text-2xl font-bold mt-1">{m.value}</p>
                    <p className="text-xs text-green-600 mt-0.5">Target: {m.target}</p>
                    <Badge className="mt-2 bg-green-500/10 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Healthy
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageScaffold>
  );
}
