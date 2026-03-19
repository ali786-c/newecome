# UpgraderCX — Workspace

## Overview

pnpm workspace monorepo. **UpgraderCX** is a premium digital subscription marketplace (47-page React frontend + Laravel 11 API backend).

## Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | React 18 + Vite 5, Tailwind CSS v4 (`@tailwindcss/vite`), Shadcn UI |
| **Backend** | Laravel 11 (PHP 8.3), Sanctum token auth |
| **Database** | SQLite (dev) / MySQL 8 (production) |
| **State** | React Context (AuthContext, CartContext) |
| **Auth mode** | Bearer token via localStorage (`VITE_AUTH_MODE=token`) |
| **Mock mode** | `VITE_USE_MOCK=true` — full mock layer, flip to `false` when Laravel is wired |

## Brand

- Primary color: Forest green `#1F5141` → `hsl(155 43% 21%)`
- CSS variable: `--primary` in `artifacts/upgradercx/src/index.css`

## Structure

```
artifacts/
├── upgradercx/          # React + Vite frontend (port from PORT env var)
│   ├── src/
│   │   ├── api/         # API client layer (all 120+ endpoints, mock + real modes)
│   │   ├── components/  # Shared UI: storefront/, shared/, admin/, dashboard/
│   │   ├── contexts/    # AuthContext, CartContext
│   │   ├── data/        # products.ts — mock product catalog (30 products, 9 categories)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/
│   │   │   ├── public/  # 19 public pages (Home, Products, ProductDetail, Blog, etc.)
│   │   │   ├── auth/    # Login, Register, ForgotPassword, ResetPassword, EmailVerification
│   │   │   ├── admin/   # 17 admin pages (Dashboard, Products, Orders, Customers, etc.)
│   │   │   └── customer/ # 8 customer pages (Dashboard, Orders, Wallet, Tickets, etc.)
│   │   ├── types/       # index.ts — Laravel API-compatible TypeScript types
│   │   └── App.tsx      # 47 routes with role-based guards
│   ├── vite.config.ts
│   └── package.json
├── laravel-backend/     # Laravel 11 API (NOT yet a running service/artifact)
│   ├── app/Http/Controllers/ # 23 controllers
│   ├── app/Models/      # 24 Eloquent models
│   ├── database/migrations/ # 24 migrations (ran on SQLite)
│   ├── routes/api.php   # 120+ endpoints
│   └── .env             # DB_CONNECTION=sqlite for dev
├── api-server/          # Legacy Node/Express/Drizzle server (port 8080) — not used by upgradercx
└── mockup-sandbox/      # Vite component preview server for canvas mockups
```

## Mock Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Customer | user@example.com | password |

## Key Files

- `artifacts/upgradercx/src/data/products.ts` — 30 mock products, 9 categories, Cloudflare CDN images
- `artifacts/upgradercx/src/api/client.ts` — Axios client, `USE_MOCK` flag, `mockDelay` helper
- `artifacts/upgradercx/src/contexts/AuthContext.tsx` — Auth state, login/logout, session expiry
- `artifacts/upgradercx/src/contexts/CartContext.tsx` — Cart state, add/remove/clear
- `artifacts/laravel-backend/routes/api.php` — All 120+ REST endpoints

## Workflows

- **`artifacts/upgradercx: web`** — `pnpm --filter @workspace/upgradercx run dev` (frontend)
- **`artifacts/api-server: API Server`** — `pnpm --filter @workspace/api-server run dev` (legacy, not used by upgradercx)
- **`artifacts/mockup-sandbox: Component Preview Server`** — canvas mockup previews

## Completed Features (this session)

- **Multi-currency selector** — dropdown in PublicLayout top bar (USD, EUR, GBP, CAD, AUD, BRL, MXN, INR); persists to localStorage
- **Wishlist heart button** — overlaid on product image in ProductDetail; uses `useWishlist()` hook from `src/pages/customer/Wishlist.tsx`
- **Automatic refund processing** — "Process Refund" button in admin Orders dropdown for completed orders
- **Referral commission payout** — payout request dialog in customer Referrals with method selection (wallet/PayPal/crypto/bank)
- **G2G competitor price alerts tab** — new "Price Alerts" tab in G2GSync with configurable thresholds, alert channels, and live alert table
- **AI description generator** — "✨ AI Generate" button in ProductForm description field; simulates AI generation with 1.2s delay
- **Stock count field** — "Seats in Stock" input in ProductForm pricing section for depletion tracking
- **Digital Product Vault** — `/admin/product-vault` for credential management
- **Bulk Coupon Generator** — `/admin/coupons` for discount code management
- **Customer Wishlist page** — `/wishlist` with localStorage persistence
- **Product Reviews & Ratings** — star ratings + write review dialog in ProductDetail
- **Loyalty/Points system** — `/rewards` with Bronze/Silver/Gold/Diamond tiers
- **Email/2FA/webhook settings** — expanded AdminSettings with SMTP config, email templates, 2FA enforcement, Stripe/PayPal/NOWPayments webhooks

## Compliance Notes

- Use "premium access seat", "verified seat", "dedicated credentials", "PPP pricing"
- Never use "shared plan", "authorized shared plans", or "Official Plan"
- Trust bar copy: "Verified subscription seats" (Home.tsx), "Premium digital subscription seats — save up to 80% via PPP pricing" (PublicLayout)

## Status

- **Frontend**: ✅ Fully working — all 47 pages render, auth guards work, cart works, mock mode active
- **Laravel backend**: 🔧 Code complete (23 controllers, 24 models, 120+ routes, migrations ran) but NOT registered as a running workflow/artifact yet
- **Next steps**:
  1. Register Laravel backend as a running artifact/service (PHP artisan serve)
  2. Set `VITE_USE_MOCK=false` and wire frontend to Laravel API
  3. Implement real payments (crypto gateway or Stripe)

## Development Notes

- Tailwind v4 uses `@tailwindcss/vite` plugin, NOT PostCSS setup — do not add `tailwind.config.js`
- Cart imports from `@/types` — do NOT import `Product` from `@/data/products` in CartContext
- Vite reads `PORT` env var for server port (Replit assigns dynamically)
- `@replit/vite-plugin-cartographer` warnings are harmless
- `useWishlist()` is exported from `src/pages/customer/Wishlist.tsx` — localStorage key `upgradercx_wishlist`
- Reviews stored per product in localStorage key `reviews_${productSlug}`
- Currency selector in `PublicLayout.tsx` — localStorage key `upgradercx_currency`
- Hooks must be called before any early returns (Rules of Hooks)
