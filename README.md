# UpgraderCX - Digital Product SaaS Platform

A production-ready SaaS platform for selling digital products with multi-supplier integration, automated fulfillment, and intelligent marketing automation.

**Status**: ✅ Production-Ready | 🚀 Actively Developed | 🔄 Integrations Live

---

## 📋 Table of Contents
1. [Quick Overview](#-quick-overview)
2. [Folder Structure](#-folder-structure)
3. [Key Features](#-key-features)
4. [Tech Stack](#-tech-stack)
5. [Development Workflow](#-development-workflow)
6. [Deployment](#-deployment)
7. [Configuration](#-configuration)
8. [Auto-Post Feature](#-auto-post-products-feature)
9. [API Documentation](#-api-documentation)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Quick Overview

**UpgraderCX** is a comprehensive SaaS solution for:
- 🛍️ Managing a digital product marketplace
- 🔄 Syncing inventory from multiple suppliers (G2G, Reloadly, G2A)
- 💳 Processing payments through multiple gateways (Pay Hub: Stripe, Crypto, Cardlink)
- 🤖 Automating product fulfillment and customer communication
- 📱 Auto-posting products to Discord & Telegram
- 📝 AI-powered blog content generation
- 🎫 Customer support ticketing system
- 👥 Referral program management

---

## 📁 Folder Structure

```
├── / (Root)                          # Production UI assets (React builds)
├── /api                              # Laravel Backend (Core Application)
│   ├── app/
│   │   ├── Http/Controllers/         # 32+ API controllers
│   │   ├── Models/                   # 32+ database models
│   │   ├── Services/                 # Business logic (Discord, Telegram, Fulfillment)
│   │   ├── Jobs/                     # Queue jobs (Sync, AutoPost, AI)
│   │   ├── Observers/                # Model observers (ProductObserver, etc.)
│   │   └── Console/                  # Scheduler & CLI commands
│   ├── routes/
│   │   ├── api.php                   # 70+ REST API endpoints
│   │   ├── web.php                   # Web routes
│   │   └── console.php               # CLI commands
│   ├── database/
│   │   ├── migrations/               # Schema definitions
│   │   └── seeders/                  # Test data
│   ├── config/                       # App configuration
│   └── public/                       # Web root
│
├── /upgradercx-source updated/       # ⚠️ CRITICAL: React frontend source
│   └── artifacts/upgradercx/
│       └── src/                      # React components & pages
│
├── /upgrader-pay-hub/                # Payment Hub module
│
├── /CODEBASE_DEEP_ANALYSIS.md        # Comprehensive architecture docs
├── /AUTO_POST_FEATURE_PLAN.md        # Auto-posting feature implementation plan
├── /context.md                       # Session working context
└── /backup/                          # Original files backup
```

---

## ✨ Key Features

### 1. **Digital Product Marketplace**
- Product catalog management (CRUD)
- Multi-category organization
- Dynamic pricing with markup rules
- Stock management (in_stock, limited, out_of_stock)
- SEO optimization (slug, tags, metadata)

### 2. **Multi-Supplier Integration** 
- **G2G** - Gift cards, game items (1000+ brands)
- **Reloadly** - Mobile top-ups, gift cards
- **G2A** - Digital products
- Automated inventory sync
- Real-time pricing updates
- Automatic margin calculation
- Smart product categorization

### 3. **Smart Pricing Engine**
- Cost-based pricing calculations
- Percentage & fixed markup rules
- Supplier-specific margins
- Promotion pricing
- Real-time price adjustments

### 4. **Automated Order Fulfillment**
- Multi-channel delivery:
  - 🎮 Discord Direct Messages
  - 📱 Telegram Messages
  - 📧 Email with attachments
- Automatic credential delivery
- Customer notifications
- Delivery tracking
- Error recovery with fallbacks

### 5. **Auto-Post Products Feature** 🆕
- **Automatic posting** to Discord & Telegram when:
  - New products added
  - Product prices/stock updated
  - Random interval (configurable: hourly, 2h, 4h, 6h, daily)
- **Smart eligibility filters**:
  - In-stock status required/optional
  - Image presence required/optional
  - Featured products only option
- **Rich formatting**:
  - Embedded images & product details
  - Price comparison (original vs current)
  - Stock status indicators
  - Direct product links
- **Configurable channels**:
  - Enable/disable per channel
  - Per-product channel selection
  - Test connectivity endpoints

### 6. **Payment Integration**
- Multi-gateway support via **Pay Hub**:
  - 💳 Stripe (credit/debit cards)
  - ₿ Crypto (Bitcoin, Ethereum, Solana, etc.)
  - 🇬🇷 Cardlink (Greek payment)
- Webhook-based payment verification
- Coupon & discount system
- Wallet top-ups
- Refund handling

### 7. **Customer Management**
- User registration & authentication (2FA)
- Purchase history tracking
- Wallet system for balance management
- Referral programs
- Account suspension capabilities
- Comprehensive audit logging

### 8. **Content Marketing**
- Blog post management
- AI article generation (Google Gemini)
- Pinterest integration (OAuth)
- SEO optimization
- Automated scheduling

### 9. **Support System**
- Customer support ticketing
- Ticket assignment & status tracking
- Webhook-based customer notifications
- Internal notes & audit trail

### 10. **Analytics & Admin**
- Dashboard statistics
- Customer analytics
- Supplier performance metrics
- Audit logs (all user actions)
- System settings management

---

## 🛠 Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Laravel | 11.0+ |
| Language | PHP | 8.2+ |
| Database | MySQL | 5.7+ |
| Authentication | Laravel Sanctum | 4.0+ |
| Queue | Laravel Queue | Built-in |
| Caching | Redis/File | Configurable |
| Email | Mailjet | API integration |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18+ |
| Build Tool | Vite | Latest |
| Styling | TailwindCSS | 3.0+ |
| State Management | Context API/Redux | TBD |
| API Client | Axios | 1.4+ |

### External APIs
| Service | Purpose | Status |
|---------|---------|--------|
| G2G | Supplier API | ✅ Live |
| Reloadly | Supplier API | ✅ Live |
| G2A | Supplier API | ✅ Live |
| Pay Hub | Payment Gateway | ✅ Live |
| Discord | Bot API | ✅ Live |
| Telegram | Bot API | ✅ Live |
| Mailjet | Email Service | ✅ Live |
| Google Gemini | AI Content | ✅ Configured |
| Pinterest | Social Marketing | ✅ OAuth Ready |

---

## 🛠 Development Workflow (UI)

### Local Development Setup

**Backend (Laravel)**:
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

**Frontend (React)**:
```bash
cd upgradercx-source\ updated/artifacts/upgradercx/
pnpm install
pnpm run dev
```

**Concurrent Development** (recommended):
```bash
cd api
npm run dev  # Runs: server + queue + logs + vite together
```

### Making Changes

1. **Frontend Changes**:
   - Edit files in `/upgradercx-source updated/artifacts/upgradercx/src`
   - Build: `pnpm run build`
   - Copy output: `dist/public/*` → `/` (root)

2. **Backend Changes**:
   - Edit files in `/api/app`
   - Run migrations: `php artisan migrate`
   - Test with: `php artisan test`

3. **Database Changes**:
   - Create migration: `php artisan make:migration create_table_name`
   - Run: `php artisan migrate`

---

## 🚀 Deployment (cPanel)

### Initial Deployment
1. **Upload code** to your cPanel home directory
2. **Configure SSL** (Let's Encrypt via cPanel)
3. **Create addon domain** pointing to project root
4. **Database Setup**:
   ```bash
   # SSH into server
   cd your-domain
   php artisan migrate --force
   php artisan db:seed  # Optional
   ```

### Configuration
```bash
# .env file (in /api directory)
APP_NAME=UpgraderCX
APP_URL=https://your-domain.com
APP_ENV=production
APP_DEBUG=false

DB_HOST=localhost
DB_DATABASE=db_name
DB_USERNAME=db_user
DB_PASSWORD=db_password

VITE_AUTH_MODE=token
VITE_API_BASE_URL=https://your-domain.com/api
```

### Post-Deployment
1. Visit `https://your-domain.com/api/migrate` (optional - runs migrations)
2. Test login at `https://your-domain.com`
3. Configure admin settings via dashboard
4. Test Discord/Telegram webhooks
5. Set up scheduler (cron job)

### Cron Job Setup (Essential for Auto-Posting)
```bash
# Add to cPanel Cron Jobs
* * * * * cd /home/user/your-domain/api && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🔐 Configuration

### Required Environment Variables

**Core Application**:
```env
APP_NAME=UpgraderCX
APP_ENV=production
APP_KEY=base64:...generated by php artisan key:generate
APP_DEBUG=false
APP_URL=https://your-domain.com
```

**Database**:
```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=upgradercx_prod
DB_USERNAME=root
DB_PASSWORD=...
```

**Payment Gateway**:
```env
PAYHUB_CLIENT_ID=hub_xxx
PAYHUB_CLIENT_SECRET=xxx
PAYHUB_API_URL=https://www.linkpaypro.online/api
```

**Suppliers** (Get from respective dashboards):
```env
G2G_API_KEY=xxx
G2G_API_SECRET=xxx
RELOADLY_API_KEY=xxx
G2A_API_KEY=xxx
```

**Communication Channels**:
```env
DISCORD_BOT_TOKEN=xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHANNEL_ID=-1001234567890

MAILJET_API_KEY=xxx
MAILJET_SECRET_KEY=xxx
```

**Marketing & AI**:
```env
GEMINI_API_KEY=xxx
PINTEREST_ACCESS_TOKEN=xxx
```

---

## 📱 Auto-Post Products Feature

### Overview
Automatically post products to Discord and Telegram at random intervals with rich formatting.

### How It Works

**1. When New Product Is Added**:
- Immediately posted to configured Discord/Telegram channels
- Uses rich embeds with product image, price, stock status

**2. When Product Is Updated**:
- Auto-posts if price or stock status changed
- Update notification with new details

**3. At Random Intervals**:
- Scheduled job posts random eligible products
- Configurable interval: hourly, 2h, 4h, 6h, daily
- Respects eligibility filters (in-stock, image-required, etc.)

### Configuration

**Admin Panel** → Settings → Automation:
```json
{
  "random_posting": {
    "enabled": true,
    "interval": "2hours",
    "eligibility": {
      "require_in_stock": true,
      "require_image": false,
      "only_featured": false
    }
  },
  "discord": {
    "enabled": true,
    "webhook_url": "https://discord.com/api/webhooks/..."
  },
  "telegram": {
    "enabled": true,
    "channel_id": "-1001234567890",
    "bot_token": "123:ABC..."
  }
}
```

### Per-Product Settings
When creating/editing product:
- ☑️ Auto-post to Telegram
- ☑️ Auto-post to Discord
- ☑️ Include in random posting pool

### Manual Testing
```bash
# Test random posting (via API)
curl -X POST https://your-domain.com/api/admin/automation/test-post \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Response
{
  "success": true,
  "product_id": 123,
  "product_name": "Roblox Gift Card $50",
  "channels_posted": ["discord", "telegram"],
  "message": "Random product successfully posted to 2 channels"
}
```

### Troubleshooting Auto-Posting

**Products not posting?**
- Check: Is random posting enabled in admin settings?
- Check: Is scheduler running? (`php artisan schedule:run`)
- Check: Are there eligible products? (active, random_post_eligible=true)
- Check: Are Discord/Telegram credentials configured?

**Discord posts failing?**
- Verify webhook URL is correct
- Test: POST to webhook manually with curl
- Check logs: `storage/logs/automation.log`

**Telegram posts failing?**
- Verify bot token and channel ID
- Check bot permissions in channel
- Check logs: `storage/logs/automation.log`

**See detailed plan**: [AUTO_POST_FEATURE_PLAN.md](./AUTO_POST_FEATURE_PLAN.md)

---

## 📡 API Documentation

### Base URL
```
https://your-domain.com/api
```

### Authentication
```
Authorization: Bearer {sanctum_token}
```

### Public Endpoints
```
GET    /products                          # List products
GET    /products/{id}                     # Get product
GET    /categories                        # List categories
GET    /blog                              # List blog posts
GET    /settings                          # Get public settings
POST   /orders                            # Create order
POST   /coupons/validate                  # Validate coupon
```

### Protected Endpoints (auth:sanctum)
```
POST   /auth/login                        # User login
POST   /auth/register                     # Register account
GET    /auth/user                         # Get current user
GET    /orders                            # User's orders
GET    /wallet/balance                    # Wallet balance
POST   /tickets                           # Create support ticket
GET    /referrals                         # Referral history
```

### Admin Endpoints (role:admin)
```
GET    /admin/dashboard                   # Dashboard stats
GET    /admin/customers                   # All customers
GET    /admin/orders                      # All orders
POST   /admin/settings/automation         # Configure auto-posting
POST   /admin/automation/test-post        # Test random post
POST   /admin/supplier-sync               # Trigger supplier sync
GET    /admin/audit-logs                  # Activity logs
```

### Webhooks (Public - No Auth Required)
```
POST   /webhooks/payhub                   # Payment confirmation
POST   /webhooks/supplier                 # Supplier notifications
```

**Full API Documentation**: See [CODEBASE_DEEP_ANALYSIS.md](./CODEBASE_DEEP_ANALYSIS.md)

---

## 🧪 Testing

### Run Tests
```bash
cd api

# All tests
php artisan test

# Specific test file
php artisan test tests/Feature/OrderTest.php

# With coverage
php artisan test --coverage
```

### Test Auto-Posting
```bash
# Dispatch PostRandomProductJob manually
php artisan tinker
>>> \App\Jobs\PostRandomProductJob::dispatch();

# Or via HTTP
POST /api/admin/automation/test-post
```

---

## 📊 Monitoring & Logs

### Application Logs
```bash
# Real-time logs
php artisan pail

# Automation-specific logs
php artisan pail --filter=automation

# Error logs
tail -f storage/logs/laravel.log
```

### Database
```bash
# Access database via Tinker
php artisan tinker
>>> Product::where('random_post_eligible', true)->count()
>>> SyncLog::latest()->first()
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Database connection refused"**
- Check `.env` DB credentials
- Verify MySQL is running
- Test: `php artisan migrate`

**2. "Supplier sync not working"**
- Check API keys in `.env`
- Verify supplier account is active
- Check logs: `storage/logs/automation.log`
- Test manually: `php artisan tinker` → `SyncSupplierProductsJob::dispatch()`

**3. "Payments not going through"**
- Check Pay Hub credentials
- Verify webhook URL is accessible
- Test webhook: `POST /api/webhooks/payhub` (with signature)
- Check logs for HMAC signature errors

**4. "Discord/Telegram not receiving posts"**
- Verify credentials in Settings
- Check webhook/bot permissions
- Test connectivity: `POST /api/admin/automation/test-discord`
- Review logs: `storage/logs/automation.log`

**5. "Queue jobs not running"**
- Ensure scheduler is running (cron job)
- Check job status: `php artisan queue:failed`
- Retry failed: `php artisan queue:retry all`

### Getting Help

1. Check [CODEBASE_DEEP_ANALYSIS.md](./CODEBASE_DEEP_ANALYSIS.md) for architecture details
2. Review [AUTO_POST_FEATURE_PLAN.md](./AUTO_POST_FEATURE_PLAN.md) for feature implementation
3. Check logs in `storage/logs/`
4. Run tests: `php artisan test`

---

## 📝 File Reference

| File | Purpose |
|------|---------|
| `README.md` | This file - Project overview |
| `CODEBASE_DEEP_ANALYSIS.md` | Complete architecture & API docs |
| `AUTO_POST_FEATURE_PLAN.md` | Auto-posting feature implementation |
| `context.md` | Session working context |
| `/api/.env.example` | Environment template |
| `/api/routes/api.php` | API route definitions |
| `/api/app/Console/Kernel.php` | Scheduler configuration |

---

## 📞 Support & Contact

For issues or questions:
1. Check documentation files above
2. Review logs in `storage/logs/`
3. Test with manual endpoints via curl/Postman
4. Review code comments and inline documentation

---

## 📄 License

MIT License - See LICENSE file

---

**Last Updated**: 2026-09-02  
**Status**: ✅ Production Ready | 🔄 Actively Maintained | 🚀 Ready for Scaling
