import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/shared/SeoHead';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard, CategoryCard, ProductSearch } from '@/components/storefront';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package, Star, Users, Clock, Shield, ArrowRight,
  MessageCircle, Headphones, Zap, CheckCircle2,
  ShoppingBag, LayoutGrid, CreditCard,
  ChevronDown, ChevronUp, Globe, RefreshCw,
  TrendingUp, Sparkles, BadgeDollarSign,
} from 'lucide-react';
import { ALL_PRODUCTS, CATEGORIES, type Product } from '@/data/products';

/* ══════════════════════════════════════════
   Data slices
   ══════════════════════════════════════════ */
const available = ALL_PRODUCTS.filter((p) => p.inStock && !p.onHold && p.price > 0);

const popularProducts = available.filter((p) =>
  p.badge && ['Popular', 'Best Seller', 'Hot'].includes(p.badge),
);

const bestValueProducts = [...available]
  .sort((a, b) => a.price - b.price)
  .slice(0, 8);

const recentProducts = [...available]
  .sort((a, b) => b.id - a.id)
  .slice(0, 8);

/* ══════════════════════════════════════════
   Static data
   ══════════════════════════════════════════ */
const TRUST_STATS = [
  { icon: Package, value: '254+', label: 'Sold' },
  { icon: Star, value: '5/5', label: 'Rating' },
  { icon: Users, value: '200+', label: 'Customers' },
  { icon: Clock, value: '2025', label: 'Since' },
];

const VALUE_PROPS = [
  { icon: Zap, text: 'Instant delivery' },
  { icon: Shield, text: 'Verified subscription seats' },
  { icon: Headphones, text: '24/7 support' },
  { icon: CheckCircle2, text: 'Secure checkout' },
];

const WHY_US = [
  { icon: Shield, title: 'Authorized Plans', desc: 'Official subscriptions, shared legally' },
  { icon: Zap, title: 'Instant Delivery', desc: 'Seconds, not hours' },
  { icon: Headphones, title: '24/7 Support', desc: 'Telegram & Discord' },
  { icon: CreditCard, title: 'Flexible Payment', desc: 'Crypto, Cards, PayPal' },
  { icon: RefreshCw, title: 'Replacement Guarantee', desc: 'Issues? We replace it' },
  { icon: Globe, title: 'Global Service', desc: 'Customers worldwide' },
];

const REVIEWS = [
  { name: 'Alex M.', text: 'Got my Windows license instantly. Legit activation, great price. Will buy again.', product: 'Windows 11 Pro' },
  { name: 'Sarah K.', text: 'Support on Telegram was super fast. They helped me set everything up in minutes.', product: 'Office 365' },
  { name: 'Marco R.', text: 'Best prices I found for streaming upgrades. Delivery was literally instant.', product: 'Spotify Premium' },
];

const FAQ_ITEMS = [
  { q: 'How does shared subscription pricing work?', a: 'We purchase official family, team, or multi-seat plans directly from providers and split them among verified members. Each user gets their own private credentials on a legitimate subscription.' },
  { q: 'Is this legal and compliant?', a: 'Yes. We operate within the terms of service of each provider that allows multi-user or family plans. All subscriptions are purchased through authorized channels.' },
  { q: 'How fast is delivery?', a: 'Most products are delivered instantly after payment. In rare cases, manual delivery may take up to 15 minutes.' },
  { q: 'What payment methods do you accept?', a: 'Cryptocurrency (BTC, ETH, USDT), credit/debit cards, and PayPal. All payments are processed through secure, PCI-compliant gateways.' },
  { q: "What if my subscription doesn't work?", a: 'We offer a full replacement guarantee. Contact support on Telegram or Discord and we\'ll resolve it within 24 hours.' },
];

/* ══════════════════════════════════════════
   Page
   ══════════════════════════════════════════ */
export default function Home() {
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UpgraderCX',
    url: 'https://upgradercx.com',
    description: 'Premium digital services — software licenses, AI tools, streaming, VPN & more at up to 80% off.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://upgradercx.com/products?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }), []);

  return (
    <>
      <SeoHead
        title="UpgraderCX — Save on Premium Subscriptions | Shared Plans & Upgrades"
        description="Access premium software, streaming, AI tools & VPN through authorized shared plans. Save up to 80%. Instant delivery, 24/7 support."
        canonical="https://upgradercx.com"
        jsonLd={jsonLd}
      />
      {/* ── Hero ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-7 md:py-9">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl max-w-2xl leading-tight">
              Premium Subscriptions, Shared Legally — Save&nbsp;Up&nbsp;to&nbsp;80%
            </h1>
            <p className="text-sm text-primary-foreground/75 max-w-lg">
              Official family &amp; team plans split among verified members. Instant delivery. Trusted by 200+ customers.
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" variant="secondary" className="font-semibold shadow-sm" asChild>
                <Link to="/products" className="gap-1.5">
                  <ShoppingBag className="h-4 w-4" /> Browse Products
                </Link>
              </Button>
              <Button size="sm" variant="secondary" className="font-semibold shadow-sm" asChild>
                <Link to="/products#categories" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" /> Categories
                </Link>
              </Button>
              <span className="hidden sm:inline text-primary-foreground/20">|</span>
              <Button size="sm" variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="https://t.me/upgradercx" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <MessageCircle className="h-4 w-4" /> Telegram
                </a>
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="https://discord.gg/kNfrGy5gFD" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <Headphones className="h-4 w-4" /> Discord
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 md:gap-7 border-t border-primary-foreground/10 pt-3">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <s.icon className="h-3.5 w-3.5 text-primary-foreground/50" />
                <span className="text-sm font-bold">{s.value}</span>
                <span className="text-[11px] text-primary-foreground/50">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value ribbon ── */}
      <section className="border-b bg-card">
        <div className="container py-2">
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1">
            {VALUE_PROPS.map((v) => (
              <span key={v.text} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <v.icon className="h-3.5 w-3.5 text-success" />
                {v.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search bar ── */}
      <section className="container pt-6 md:pt-8">
        <ProductSearch className="max-w-xl mx-auto" />
      </section>

      {/* ── Popular Products ── */}
      <section className="container py-6 md:py-8">
        <ProductRow icon={TrendingUp} title="Popular Products" badge={`${popularProducts.length}`} products={popularProducts} />
      </section>

      {/* ── Best Value ── */}
      <section className="bg-muted/20">
        <div className="container py-6 md:py-8">
          <ProductRow icon={BadgeDollarSign} title="Best Value" badge={`From €${bestValueProducts[0]?.price.toFixed(2)}`} products={bestValueProducts} />
        </div>
      </section>

      {/* ── Recently Added ── */}
      <section className="container py-6 md:py-8">
        <ProductRow icon={Sparkles} title="Recently Added" badge="New" products={recentProducts} />
      </section>

      {/* ── Mid-page CTA ── */}
      <section className="border-y bg-primary/5">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Explore all {available.length} products</p>
            <p className="text-xs text-muted-foreground">Software, AI, streaming, VPN, gaming & more</p>
          </div>
          <Button size="sm" asChild>
            <Link to="/products" className="gap-1.5">
              <ShoppingBag className="h-4 w-4" /> Browse All
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-muted/30">
        <div className="container py-6 md:py-8">
          <SectionBar title="Browse by Category" count={CATEGORIES.length} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} slug={cat.slug} name={cat.name} imageUrl={cat.imageUrl} startingPrice={cat.startingPrice} productCount={cat.productCount} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How Shared Plans Work ── */}
      <section className="container py-8 md:py-10">
        <Heading>How Shared Plans Work</Heading>
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-6">
          We purchase official family, team, or multi-seat subscriptions and allocate individual seats to verified members — giving you full access at a fraction of the retail price.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { step: '1', icon: ShoppingBag, title: 'We Buy Official Plans', desc: 'Family or team subscriptions purchased directly from providers.' },
            { step: '2', icon: Users, title: 'Seats Are Allocated', desc: 'Each member gets their own private login on a legitimate plan.' },
            { step: '3', icon: CreditCard, title: 'You Pay Less', desc: 'The cost is split — you save up to 80% vs individual pricing.' },
            { step: '4', icon: Zap, title: 'Instant Activation', desc: 'Credentials delivered in seconds after secure payment.' },
          ].map((s, idx) => (
            <div key={s.step} className="relative text-center px-2">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {s.step}
              </div>
              <p className="text-sm font-semibold text-foreground mb-0.5">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border bg-muted/30 p-4 max-w-xl mx-auto">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">100% Compliant:</strong> All plans are purchased through official channels. We only share services that explicitly allow family or team members. Your privacy is protected with individual credentials.
          </p>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-muted/30">
        <div className="container py-8 md:py-10">
          <Heading>Why Customers Choose UpgraderCX</Heading>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {WHY_US.map((item) => (
              <Card key={item.title} className="border-0 shadow-none bg-card">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="container py-8 md:py-10">
        <Heading>
          <span className="inline-flex items-center gap-2">
            Customer Reviews
            <span className="inline-flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-warning fill-warning" />
              ))}
            </span>
            <span className="text-xs font-normal text-muted-foreground">5/5</span>
          </span>
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {REVIEWS.map((r) => (
            <Card key={r.name}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-[13px] text-foreground leading-relaxed mb-3 italic">"{r.text}"</p>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-xs font-semibold text-foreground">{r.name}</span>
                  <span className="text-[10px] text-muted-foreground">{r.product}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Verified reviews from our Telegram &amp; Discord community
        </p>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/30">
        <div className="container py-8 md:py-10 max-w-2xl">
          <Heading>Frequently Asked Questions</Heading>
          <FaqPreview />
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/faq" className="text-primary text-xs gap-1">
                View all FAQs <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t bg-card">
        <div className="container py-8 text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">Start Saving on Premium Plans</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Join 200+ customers accessing authorized shared subscriptions. Instant delivery, full support, replacement guarantee.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link to="/products" className="gap-1.5">
                <ShoppingBag className="h-4 w-4" /> Browse Products
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact" className="gap-1.5">
                <MessageCircle className="h-4 w-4" /> Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Support Footer ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5" />
            <h2 className="text-base font-bold">Need Help? We're Online 24/7</h2>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-md mx-auto mb-3">
            Average response under 15 minutes on Telegram and Discord.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="sm" variant="secondary" asChild>
              <a href="https://t.me/upgradercx" target="_blank" rel="noopener noreferrer">Telegram</a>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <a href="https://discord.gg/kNfrGy5gFD" target="_blank" rel="noopener noreferrer">Discord</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════ */

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-foreground text-center mb-6">{children}</h2>;
}

function SectionBar({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-5 w-1 rounded-full bg-primary" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {count != null && (
        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">{count}</span>
      )}
    </div>
  );
}

function ProductRow({ icon: Icon, title, badge, products }: {
  icon: LucideIcon;
  title: string;
  badge: string;
  products: Product[];
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-primary" />
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">{badge}</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/products" className="text-primary text-xs gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            name={p.name}
            price={`€${p.price.toFixed(2)}`}
            startingAt={p.startingAt}
            imageUrl={p.imageUrl}
            inStock={p.inStock}
            onHold={p.onHold}
            badge={p.badge}
            product={p}
          />
        ))}
      </div>
    </>
  );
}

function FaqPreview() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <button
          key={i}
          onClick={() => setOpen(open === i ? null : i)}
          className="w-full text-left rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/30"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">{item.q}</span>
            {open === i
              ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            }
          </div>
          {open === i && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed border-t border-border pt-2">{item.a}</p>
          )}
        </button>
      ))}
    </div>
  );
}
