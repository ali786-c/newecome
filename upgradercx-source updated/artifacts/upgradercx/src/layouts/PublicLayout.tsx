import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { publicNav, footerNav } from '@/config/navigation';
import { Shield, CreditCard, Headphones } from 'lucide-react';
import { Menu, ShoppingCart, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { FloatingSupport } from '@/components/storefront/FloatingSupport';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', label: 'Mexican Peso' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
];

function CurrencySelector() {
  const [currency, setCurrency] = useState(() => localStorage.getItem('upgradercx_currency') || 'EUR');
  const cur = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[1];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
          <span>{cur.symbol}</span>
          <span>{cur.code}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem key={c.code} onClick={() => { setCurrency(c.code); localStorage.setItem('upgradercx_currency', c.code); }} className={currency === c.code ? 'font-semibold' : ''}>
            <span className="w-5 text-muted-foreground">{c.symbol}</span>
            <span>{c.code}</span>
            <span className="ml-auto text-xs text-muted-foreground">{c.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* Simple SVG icons for Telegram & Discord */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

export function PublicLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, setCartOpen } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium">
        Skip to content
      </a>
      {/* ── Utility bar ── */}
      <div className="border-b bg-muted/40">
        <div className="container flex h-9 items-center justify-between text-xs text-muted-foreground">
          <span>Premium digital subscription seats — save up to 80% via PPP pricing</span>
          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <CurrencySelector />
            {/* Language selector placeholder */}
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Globe className="h-3.5 w-3.5" />
              <span>EN</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <span className="text-border">|</span>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between sm:h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              U
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">UpgraderCX</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {publicNav.map((item) => (
              <Link
                key={item.href + item.title}
                to={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Cart & mobile menu */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-4 w-4" />
                Cart ({itemCount})
              </Button>
              <Button size="sm" className="text-xs" asChild>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
            {/* Mobile: icon only */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:hidden" onClick={() => setCartOpen(true)}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6">
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">U</div>
                  <span className="text-base font-semibold text-foreground">UpgraderCX</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {publicNav.map((item) => (
                    <Link
                      key={item.href + item.title}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                        location.pathname === item.href
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                  <div className="mt-6 flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Cart drawer + floating support + cookie consent */}
      <CartDrawer />
      <FloatingSupport />
      <CookieConsent />

      {/* ── Footer ── */}
      <footer className="border-t bg-muted/30">
        <div className="container py-10 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">U</div>
                <span className="text-base font-semibold text-foreground">UpgraderCX</span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Premium digital services and upgrades — fast, secure, and hassle-free.
              </p>
              {/* Community links */}
              <div className="mt-4 flex items-center gap-3">
                <a href="https://t.me/upgradercx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Telegram">
                  <TelegramIcon className="h-4 w-4" />
                  Telegram
                </a>
                <a href="https://discord.gg/kNfrGy5gFD" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Discord">
                  <DiscordIcon className="h-4 w-4" />
                  Discord
                </a>
              </div>
            </div>

            {/* Nav columns from config */}
            {Object.entries(footerNav).map(([key, items]) => (
              <div key={key}>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{key}</h4>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link to={item.href} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust & payment strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-lg border bg-card px-4 py-3 sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                Crypto · Cards · PayPal
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Headphones className="h-3.5 w-3.5 text-primary" />
                24/7 Support
              </span>
            </div>
            <Link to="/trust" className="text-xs font-medium text-primary hover:underline">
              Trust & Security →
            </Link>
          </div>

          {/* Copyright */}
          {/* Trademark & compliance disclaimer */}
          <div className="mt-6 rounded-md border bg-muted/40 px-4 py-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              <strong className="text-muted-foreground">Disclaimer:</strong> UpgraderCX is an independent platform. All product names, logos, and trademarks are the property of their respective owners. We are not affiliated with, endorsed by, or sponsored by any of the brands listed. Services offered represent seats on officially purchased family, team, or multi-user plans shared in compliance with each provider's terms. UpgraderCX does not sell unauthorized access or cracked software.
            </p>
          </div>

          <div className="mt-4 border-t pt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} UpgraderCX. All rights reserved.</p>
            <p className="text-[11px] text-muted-foreground/60">Prices shown exclude applicable taxes. Digital delivery only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
