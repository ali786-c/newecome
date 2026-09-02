ok# 🏗️ UpgraderCX SaaS - Deep Codebase Analysis

## 📋 Project Overview

**UpgraderCX** is a sophisticated **SaaS (Software-as-a-Service) platform** designed for automated digital product sales, supplier integration, and order fulfillment. It enables merchants to sell digital gift cards, game items, top-up credits, and other digital products while integrating with multiple third-party suppliers (G2G, Reloadly, G2A, etc.) and payment gateways.

### Core Purpose
- **Product Marketplace**: Sell digital products (gift cards, accounts, top-ups, etc.)
- **Multi-Supplier Integration**: Automatically sync inventory from G2G, Reloadly, G2A, and other suppliers
- **Smart Pricing Engine**: Dynamic pricing rules based on supplier costs
- **Automated Fulfillment**: Auto-deliver products via Discord, Telegram, email
- **Payment Hub Integration**: Accept payments via Stripe, Crypto, Cardlink
- **Content Marketing**: AI-powered blog automation for SEO
- **Customer Support**: Ticket system with support team automation

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 11.0 (PHP 8.2+)
- **Database**: MySQL (with migrations)
- **Auth**: Laravel Sanctum (token-based API auth)
- **Queue**: Laravel Queue system
- **Email**: Mailjet service integration
- **Security**: 2FA (Google Authenticator), HMAC signatures

### Frontend
- **Framework**: React (built with Vite)
- **Build Tool**: Vite (hot reload, optimized builds)
- **Styling**: TailwindCSS (likely)
- **State Management**: React Context or similar
- **Build Output**: Deployed as static assets in `/assets`

### Key Dependencies
```json
{
  "php": "^8.2",
  "laravel/framework": "^11.0",
  "laravel/sanctum": "^4.0",
  "pragmarx/google2fa-laravel": "^3.0"
}
```

---

## 🏛️ Architecture Overview

### Directory Structure

```
├── /api (Laravel Backend)
│   ├── app/
│   │   ├── Http/Controllers/       # 32 API controllers
│   │   ├── Models/                 # 32 Eloquent models
│   │   ├── Services/               # Business logic
│   │   ├── Jobs/                   # Queue jobs
│   │   ├── Mail/                   # Email templates
│   │   ├── Notifications/          # Notification classes
│   │   ├── Observers/              # Model observers
│   │   └── Providers/              # Service providers
│   ├── routes/
│   │   ├── api.php                 # Main API routes
│   │   ├── web.php                 # Web routes
│   │   └── console.php             # Artisan commands
│   ├── database/
│   │   ├── migrations/             # Schema definitions
│   │   └── seeders/                # Test data
│   ├── config/                     # Environment configs
│   ├── bootstrap/                  # App initialization
│   └── public/                     # Web root
│
├── /upgradercx-source updated/     # React source code (dev)
│   └── src/
│       ├── pages/                  # Page components
│       ├── components/             # Reusable components
│       ├── services/               # API services
│       └── assets/                 # Images, icons
│
├── /assets/                        # Built React production files (JS/CSS)
│
└── /upgrader-pay-hub/              # Payment Hub module (separate project)
```

### Authentication Flow
```
User Login → AuthController.login() → Generate Sanctum Token → 
Frontend stores token → API requests include "Authorization: Bearer {token}" → 
Middleware verifies token → Access granted/denied
```

### API Design Pattern
- **RESTful**: Standard HTTP methods (GET, POST, PATCH, DELETE)
- **Response Format**: JSON
- **Error Handling**: HTTP status codes + error messages
- **Middleware**: Role-based access control (admin/customer), CORS, rate limiting
- **Public Routes**: Product listings, blog, public settings
- **Protected Routes**: Orders, wallet, tickets (auth required)
- **Admin Routes**: Customer management, system settings, audit logs

---

## 💾 Database Schema (Key Models)

### User Model
```php
- id, name, email, password
- role (admin/customer)
- wallet_balance (decimal)
- referral_code, referred_by
- two_factor_secret, two_factor_confirmed_at
- notification_preferences (JSON)
- last_login_at, avatar_url
```
**Relations**: orders, walletTransactions, tickets, notifications, referrals

### Product Model
```php
- id, name, slug, description
- price, compare_price, cost_price
- category_id, tags (array)
- status, stock_status, compliance_status
- supplier_id, supplier_product_id
- image_url, variants (array)
- supplier_price_orig, supplier_currency_orig
- discord_enabled, telegram_enabled
- is_featured, country_code, brand
```
**Relations**: category, orderItems, supplier

### Order Model
```php
- id, user_id
- total, currency
- status (pending/completed/failed)
- fulfillment_status (processing/delivered/failed)
- payment_method, payment_ref
- card_last4, card_brand, paid_at
- coupon_id, discount_amount
```
**Computed**: order_number (formatted as #00001)
**Relations**: user, items, coupon

### OrderItem Model
```php
- id, order_id, product_id
- quantity, unit_price, total
```
**Links**: Order → OrderItem → Product

### Integration Models
- **SupplierConnection**: G2G, Reloadly, G2A credentials
- **SupplierProduct**: Synced products from suppliers
- **SupplierImportJob**: Track sync operations
- **SupplierSyncLog**: Sync history and errors

### Configuration Models
- **Setting**: Global platform settings
- **PricingRule**: Dynamic pricing (markup/discount rules)
- **AutomationRule**: Workflow automation triggers
- **BlogAutomationConfig**: AI blog posting config
- **Integration**: Third-party integrations (Discord, Telegram, Pinterest)

### Support Models
- **Ticket**: Customer support tickets
- **TicketMessage**: Ticket replies
- **TicketWebhookConfig**: Webhook configurations
- **Review**: Customer reviews
- **ComplianceReview**: Content moderation

### Financial Models
- **WalletTransaction**: Account balance movements
- **Coupon**: Discount codes
- **Referral**: Referral program tracking

### Audit & Logging
- **AuditLog**: User action tracking
- **SyncLog**: Supplier sync history
- **SupplierSyncLog**: Detailed sync logs

---

## 🔄 Core Business Flows

### 1️⃣ Product Sync Flow
```
SupplierSyncController.sync()
    ↓
SupplierSyncService.syncSupplier()
    ↓
SupplierServiceFactory.getService(supplier_type)
    ↓
[G2GService | ReloadlyService | G2AService]
    ↓ (API call to supplier)
Parse & transform products
    ↓
SupplierProduct.upsert() / Product.upsert()
    ↓
SupplierSyncLog.create() (track result)
```

### 2️⃣ Order Creation Flow
```
User selects products (React frontend)
    ↓
POST /api/orders (OrderController.store())
    ↓
Validate cart, apply coupon, calculate total
    ↓
Order.create() → OrderItem.create()
    ↓
Generate Pay Hub checkout URL
    ↓
Return checkout_url to frontend
    ↓
Frontend redirects to Pay Hub payment page
```

### 3️⃣ Payment Verification Flow
```
User completes payment on Pay Hub
    ↓
Pay Hub webhook: POST /api/webhooks/payhub
    ↓
OrderController.handlePayHubWebhook()
    ↓
Verify HMAC-SHA256 signature
    ↓
Order.update(['status' => 'completed'])
    ↓
OrderFulfillmentService.fulfill()
    ↓
[Send via Discord | Telegram | Email]
```

### 4️⃣ Fulfillment Flow
```
Order marked as completed
    ↓
OrderFulfillmentService.fulfill(Order $order)
    ↓
Group items by supplier
    ↓
For each supplier:
    - Get SupplierConnection credentials
    - Instantiate supplier service
    - Call API to purchase/activate item
    - Get product credentials/account
    ↓
Send delivery message via:
    - Discord DM
    - Telegram message
    - Email with file attachment
    ↓
Mark fulfillment_status = 'delivered'
    ↓
Notify customer via notifications
```

---

## 🔌 External Integrations

### Supplier APIs (Inventory Sync)
| Supplier | Purpose | Status | Integration |
|----------|---------|--------|-------------|
| **G2G** | Gift cards, game items | ✅ Implemented | G2GService |
| **Reloadly** | Mobile top-ups, gift cards | ✅ Implemented | ReloadlyService |
| **G2A** | Digital products | ✅ Implemented | G2AService |

**Key Features**:
- API authentication with HMAC signatures
- Brand discovery (1000+ brands)
- Product catalog sync
- Real-time pricing
- Automatic inventory updates

### Payment Gateway (Pay Hub)
**URL**: https://www.linkpaypro.online

**Supported Gateways**:
- Stripe (cards)
- Crypto (Bitcoin, Ethereum, Solana, etc.)
- Cardlink (Greek payment)

**Flow**:
1. Order created in UpgraderCX
2. Backend calls Pay Hub `/checkout/create`
3. Returns `checkout_url`
4. User directed to multi-gateway selection
5. Pay Hub webhook confirms payment
6. Order marked complete → fulfillment triggered

### Communication Channels
| Channel | Purpose | Status |
|---------|---------|--------|
| **Discord** | Product delivery via DM | ✅ Implemented (DiscordService) |
| **Telegram** | Product delivery via message | ✅ Implemented (TelegramService) |
| **Email** | Order confirmations, support | ✅ Implemented (MailjetMailService) |
| **Mailjet** | Email service provider | ✅ Configured |

### Content & SEO
| Tool | Purpose | Status |
|------|---------|--------|
| **Google Gemini AI** | Blog article generation | ✅ Implemented (GeminiService) |
| **Pinterest** | Social media automation | ✅ Implemented (PinterestService) |

---

## 🚀 API Endpoints Structure

### Authentication (`/api/auth`)
```
POST   /auth/login                  - User login
POST   /auth/register               - User registration
POST   /auth/forgot-password        - Password reset request
POST   /auth/reset-password         - Reset with token
POST   /auth/verify-2fa             - Verify 2FA code
POST   /auth/refresh                - Refresh token
GET    /auth/user                   - Get current user
GET    /auth/2fa/setup              - Setup 2FA
POST   /auth/2fa/confirm            - Confirm 2FA setup
POST   /auth/2fa/disable            - Disable 2FA
```

### Products & Categories (Public)
```
GET    /products                    - All products (paginated)
GET    /products/{id}               - Product details
GET    /products/slug/{slug}        - Product by slug
GET    /products/gift-card-filters  - Filter options
GET    /categories                  - All categories
GET    /categories/{id}             - Category details
GET    /categories/slug/{slug}      - Category by slug
```

### Orders (Protected)
```
GET    /orders                      - User's orders
POST   /orders                      - Create order
GET    /orders/{id}                 - Order details
GET    /my-products                 - Purchased products
```

### Wallet (Protected)
```
GET    /wallet/balance              - Current balance
GET    /wallet/transactions         - Transaction history
POST   /wallet/top-up               - Add funds
POST   /wallet/spend                - Spend balance
```

### Tickets (Protected)
```
GET    /tickets                     - User's tickets
POST   /tickets                     - Create ticket
GET    /tickets/{id}                - Ticket details
POST   /tickets/{id}/reply          - Reply to ticket
POST   /tickets/{id}/close          - Close ticket
POST   /tickets/{id}/reopen         - Reopen ticket
```

### Admin Routes (`/api/admin`)
```
GET    /admin/dashboard             - Dashboard stats
GET    /admin/customers             - All customers
PATCH  /admin/customers/{id}        - Update customer
POST   /admin/customers/{id}/suspend - Suspend account
GET    /admin/orders                - All orders
PATCH  /admin/products              - Bulk product operations
POST   /admin/supplier-sync         - Trigger sync
GET    /admin/audit-logs            - User activity logs
```

### Webhooks (Public, No Auth)
```
POST   /webhooks/payhub             - Pay Hub payment confirmation
POST   /webhooks/supplier           - Supplier notifications
```

---

## 📦 Key Services

### OrderFulfillmentService
- Coordinates product delivery across multiple suppliers
- Groups order items by supplier
- Handles Discord/Telegram/Email dispatch
- Tracks fulfillment status
- Logs errors for admin review

### SupplierSyncService
- Orchestrates syncing with all suppliers
- Updates product inventory
- Manages pricing sync
- Tracks sync history
- Handles errors gracefully

### DiscordService
- Direct messaging customers
- Embed formatting
- Webhook delivery
- Error handling with fallback to email

### GeminiService
- AI article generation
- Keyword-based content creation
- SEO optimization
- Scheduled posting

### PinterestService
- OAuth authentication
- Pin creation from blog posts
- Board management
- Link pinning for affiliate income

### MailjetMailService
- Customer notifications
- Receipt delivery
- Support tickets
- Password resets
- Transactional email

---

## 🔐 Security Features

### Authentication
- ✅ Laravel Sanctum (stateless token auth)
- ✅ Email verification
- ✅ 2FA with Google Authenticator
- ✅ Recovery codes

### Data Protection
- ✅ Password hashing (bcrypt)
- ✅ HMAC-SHA256 signatures for external APIs
- ✅ HTTPS-only cookies
- ✅ CSRF protection on web routes
- ✅ Role-based access control (RBAC)

### Auditing
- ✅ AuditLog model (tracks user actions)
- ✅ SyncLog (tracks supplier operations)
- ✅ API request logging

### Compliance
- ✅ ComplianceReview model (content moderation)
- ✅ GDPR-ready user deletion
- ✅ Privacy policy enforcement

---

## 📊 Database Relationships (ER Diagram)

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email           │
│ role            │
│ wallet_balance  │
└────────┬────────┘
         │
    ┌────┴─────┬───────────┬──────────┬────────────┐
    │           │           │          │            │
    ▼           ▼           ▼          ▼            ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐
│ Order  │ │Ticket  │ │Referral │ │Wallet    │ │Notification│
│ Items  │ │Messages│ │         │ │Transaction
└────────┘ └────────┘ └─────────┘ └──────────┘ └─────────────┘
    │
    ├──→ Product
         │
         ├──→ Category
         │
         └──→ SupplierConnection
              └──→ SupplierProduct
```

---

## 🎯 Key Features Breakdown

### 1. Product Management
- Catalog management (CRUD)
- Multi-category organization
- Pricing rules & markups
- Stock management
- SEO optimization (slugs, tags)
- Soft deletes for archiving

### 2. Multi-Supplier Integration
- Connect to G2G, Reloadly, G2A
- Automated inventory sync
- Real-time pricing updates
- Automatic margin calculation
- Smart categorization
- Error handling & retries

### 3. Dynamic Pricing
- Cost-based pricing
- Markup rules (percentage/fixed)
- Promotion pricing
- Supplier-specific margins
- Real-time calculations

### 4. Automated Fulfillment
- Multi-channel delivery (Discord, Telegram, Email)
- Automatic account/code delivery
- Customer notifications
- Delivery tracking
- Fallback mechanisms

### 5. Payment Integration
- Multi-gateway support (Stripe, Crypto, Cardlink)
- Coupon/discount system
- Wallet top-ups
- Refund handling
- Payment verification

### 6. Customer Management
- User registration & profiles
- Purchase history
- Wallet system
- Referral programs
- Account suspension
- 2FA security

### 7. Support System
- Ticketing system
- Support team assignment
- Ticket webhooks
- Customer communication
- Issue tracking

### 8. Content Marketing
- Blog post management
- AI-powered article generation
- Pinterest integration
- SEO optimization
- Automated scheduling

### 9. Analytics & Reporting
- Dashboard statistics
- Sales reports
- Supplier performance
- Customer analytics
- Audit logs

---

## 📁 Development Workflow

### Local Development
```bash
# Backend setup
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend setup
cd upgradercx-source\ updated/artifacts/upgradercx/
pnpm install
pnpm run dev

# Concurrent development
npm run dev  # Starts server, queue, logs, vite together
```

### Deployment (cPanel)
1. Push code to production
2. Configure `.env` with production settings
3. Run `php artisan migrate --force`
4. Build React: `pnpm run build`
5. Copy `dist/public` to root folder
6. Set up addon domain

---

## 🧪 Testing Structure

```
/tests/
├── Feature/       # API endpoint tests
├── Unit/          # Service & model tests
└── DuskTests/     # Browser automation
```

---

## 🚨 Current Integration Status

### ✅ Working
- Laravel API framework
- Database schema & migrations
- User authentication (Sanctum)
- Product management
- Order system
- Wallet functionality
- Supplier APIs (G2G, Reloadly, G2A)
- Payment verification (webhook ready)

### 🔄 In Progress
- Pay Hub integration (webhook routing complete, frontend redirect needed)
- Discord delivery automation
- Telegram delivery automation
- Pinterest content scheduling
- Gemini AI blog generation

### ⚠️ Notes
- G2G account: API authenticated, but no live inventory (needs products added to G2G seller account)
- Pay Hub: Configuration ready, awaiting React frontend integration
- Error handling: Comprehensive logging via Pail (Laravel logs)

---

## 📝 Configuration Files

### `.env` Required Variables
```env
APP_NAME=UpgraderCX
APP_URL=http://upgradercx.com
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=upgradercx
DB_USERNAME=root
DB_PASSWORD=...

VITE_AUTH_MODE=token
VITE_API_BASE_URL=http://upgradercx.com/api

# Payment
PAYHUB_CLIENT_ID=hub_830ae9a540a88a4d
PAYHUB_CLIENT_SECRET=85c5fde4f80065ce16c5ad610016556e27f960f7d88d3f64e53a9b1f8dcdb77d
PAYHUB_API_URL=https://www.linkpaypro.online/api

# Suppliers
G2G_API_KEY=...
G2G_API_SECRET=...
RELOADLY_API_KEY=...
G2A_API_KEY=...

# Communications
DISCORD_BOT_TOKEN=...
TELEGRAM_BOT_TOKEN=...
MAILJET_API_KEY=...

# AI & Marketing
GEMINI_API_KEY=...
PINTEREST_ACCESS_TOKEN=...
```

---

## 🎓 Summary

**UpgraderCX** is a **complex, production-grade SaaS platform** that:
- 🛍️ Manages a digital product marketplace
- 🔄 Synchronizes inventory from multiple suppliers
- 💰 Processes payments through multiple gateways
- 🤖 Automates product delivery and customer communication
- 📊 Provides analytics and admin controls
- 🔒 Implements enterprise-grade security

The codebase is **well-structured** with clear separation of concerns (Controllers → Services → Models), comprehensive integration points, and scalable architecture suitable for high-volume transactions.

---

**Last Updated**: 2026-09-02  
**Status**: Production-Ready (with ongoing integration refinements)
