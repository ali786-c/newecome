# 📋 Auto-Post Products Feature - Implementation Plan

**Status**: Partially Implemented - Needs Scheduling & Settings UI  
**Created**: 2026-09-02  
**Priority**: HIGH

---

## 🎯 Feature Overview

Automatically post products to Discord and Telegram channels at random intervals when:
1. **New Product Added** - Immediately post to channels
2. **Product Updated** - Post if price/stock changed
3. **Random Interval** - Post random eligible products on schedule

---

## ✅ Current Implementation Status

### Already Built Components

#### 1. **Database Schema** ✅
- Product model has fields:
  - `telegram_enabled` (boolean)
  - `discord_enabled` (boolean)
  - `random_post_eligible` (boolean)

#### 2. **Services** ✅
- **DiscordService.php**
  - `sendBlogPost()` - Blog posts
  - `sendProductPost($product, $trigger)` - Products with triggers: `new`, `update`, `random`, `manual`
  
- **TelegramService.php**
  - `sendBlogPost()` - Blog posts
  - `sendProductPost($product, $trigger)` - Products with triggers: `new`, `update`, `random`, `manual`

#### 3. **Observer** ✅
- **ProductObserver.php**
  - Triggers on product creation → calls `sendProductPost('new')`
  - Triggers on product update (price/stock changes) → calls `sendProductPost('update')`

#### 4. **Job** ✅
- **PostRandomProductJob.php**
  - Selects random eligible product
  - Sends to Discord & Telegram with `'random'` trigger
  - Respects eligibility conditions (in_stock, image_required, etc.)

---

## ❌ What Needs to Be Done

### Phase 1: Scheduling (CRITICAL)
- [ ] **Console Kernel** (`app/Console/Kernel.php`)
  - Schedule `PostRandomProductJob` at configurable intervals
  - Default: Every 2 hours (adjustable via Settings)

### Phase 2: Configuration & Settings
- [ ] **Setting Model Fields** (add to database/migration)
  ```
  automation_random_post_enabled (boolean)
  automation_random_post_interval (string: 'hourly', '2hours', '4hours', '6hours', 'daily')
  discord_product_webhook_url (string)
  telegram_product_enabled (boolean)
  telegram_product_channel_id (string)
  telegram_bot_token (string)
  ```

- [ ] **Admin Settings Controller** - UI to configure:
  - Enable/disable random posting
  - Set interval (hourly, 2h, 4h, 6h, daily)
  - Discord webhook URL
  - Telegram channel settings
  - Eligibility conditions (stock required, image required)

### Phase 3: Product Management UI
- [ ] **Product Controller** - Expose flags:
  - `telegram_enabled`
  - `discord_enabled`
  - `random_post_eligible`

- [ ] **React Frontend** - Product form:
  - Checkboxes for Telegram/Discord/Random posting
  - Show preview of how it will appear

### Phase 4: Testing & Monitoring
- [ ] **Test Cases**
  - Test PostRandomProductJob with products
  - Test ProductObserver triggers
  - Test Discord webhook delivery
  - Test Telegram API calls

- [ ] **Logging** (already present in automation channel)
  - Verify logs show posting activity

- [ ] **Manual Testing Endpoint**
  - Optional: `/api/admin/automation/test-post` to manually trigger posting

### Phase 5: Documentation
- [ ] Update README.md with:
  - Feature explanation
  - Configuration steps
  - Troubleshooting guide

---

## 🔧 Implementation Tasks

### Task 1: Create Database Migration
**File**: `database/migrations/XXXX_XX_XX_XXXXXX_add_product_posting_fields.php`
```php
Schema::table('products', function (Blueprint $table) {
    $table->boolean('telegram_enabled')->default(false);
    $table->boolean('discord_enabled')->default(false);
    $table->boolean('random_post_eligible')->default(false);
});
```

### Task 2: Create Settings Migration
**File**: `database/migrations/XXXX_XX_XX_XXXXXX_add_automation_settings.php`
```php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->longText('value')->nullable();
    $table->string('type')->default('string');
    $table->timestamps();
});
```

### Task 3: Update Kernel.php
**File**: `app/Console/Kernel.php`
```php
protected function schedule(Schedule $schedule)
{
    $schedule->job(new PostRandomProductJob)
        ->everyTwoHours()
        ->withoutOverlapping()
        ->onFailure(function () {
            // Log failure
        });
}
```

### Task 4: Create Admin Settings API
**File**: `app/Http/Controllers/AdminSettingController.php`
- `GET /api/admin/settings/automation` - Get automation settings
- `PUT /api/admin/settings/automation` - Update automation settings
- `POST /api/admin/automation/test-post` - Test run

### Task 5: Update Discord/Telegram Services
**Already done!** Just ensure:
- Config reading works correctly
- Error handling is robust
- Logging is comprehensive

### Task 6: Update React Frontend
**Files to modify**:
- Product form - Add posting checkboxes
- Admin panel - Add automation settings form
- Settings component - Display current config

### Task 7: Create Tests
**Files to create**:
- `tests/Feature/PostRandomProductJobTest.php`
- `tests/Feature/ProductObserverTest.php`
- `tests/Unit/DiscordServiceTest.php`
- `tests/Unit/TelegramServiceTest.php`

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTO-POST FLOW                         │
└─────────────────────────────────────────────────────────────┘

EVENT 1: New Product Created
  ↓
Product.created() → ProductObserver.created()
  ↓
DiscordService.sendProductPost($product, 'new')
TelegramService.sendProductPost($product, 'new')
  ↓
Check: telegram_enabled, discord_enabled
Check: discord_enabled → Discord Config exists?
Check: telegram_enabled → Telegram Config exists?
  ↓
POST to Discord Webhook / Telegram API
  ↓
Log in automation channel


EVENT 2: Product Updated (Price/Stock)
  ↓
Product.updated() → ProductObserver.updated()
  ↓
Check: wasChanged('price') || wasChanged('stock_status')
  ↓
DiscordService.sendProductPost($product, 'update')
TelegramService.sendProductPost($product, 'update')
  ↓
[Same flow as above]


EVENT 3: Random Product Posting (Scheduled)
  ↓
Laravel Scheduler (every 2 hours)
  ↓
Dispatch PostRandomProductJob
  ↓
Get Settings: automation_random_post config
  ↓
Query Products WHERE:
  - status = 'active'
  - random_post_eligible = true
  - (optional) stock_status = 'in_stock'
  - (optional) image_url IS NOT NULL
  ↓
Select one at random
  ↓
DiscordService.sendProductPost($product, 'random')
TelegramService.sendProductPost($product, 'random')
  ↓
Log result

```

---

## 🔌 API Endpoints (To Create)

### Admin Automation Settings
```
GET    /api/admin/settings/automation
       Returns: { enabled, interval, eligibility, channels_config }

PUT    /api/admin/settings/automation
       Body: { enabled, interval, eligibility }
       Updates all automation settings

POST   /api/admin/automation/test-post
       Manually trigger random product post
       Returns: { success, product_id, message }

POST   /api/admin/automation/test-discord
       Test Discord webhook connectivity
       Returns: { success, message }

POST   /api/admin/automation/test-telegram
       Test Telegram bot connectivity
       Returns: { success, message }
```

---

## 📋 Configuration Example

```json
{
  "automation_random_post": {
    "enabled": true,
    "interval": "2hours",
    "eligibility": {
      "require_in_stock": true,
      "require_image": false,
      "only_featured": false
    },
    "channels": {
      "discord": {
        "enabled": true,
        "webhook_url": "https://..."
      },
      "telegram": {
        "enabled": true,
        "channel_id": "-1001234567890",
        "bot_token": "123:ABC..."
      }
    }
  }
}
```

---

## 🚀 Implementation Priority Order

1. **Kernel Scheduling** (Highest) - Nothing works without this
2. **Settings Migration** - Store config
3. **Admin API** - Configure the feature
4. **React Frontend** - User interface
5. **Testing** - Ensure reliability
6. **Documentation** - Help & troubleshooting

---

## 📝 Testing Checklist

- [ ] Job dispatches successfully
- [ ] Random product selection works
- [ ] Discord webhook sends successfully
- [ ] Telegram API sends successfully
- [ ] ProductObserver triggers on create
- [ ] ProductObserver triggers on update
- [ ] Settings can be configured via admin
- [ ] Settings persist across restarts
- [ ] Error handling doesn't crash job
- [ ] Logs are comprehensive

---

## 🔗 Related Files

**Services**:
- `/api/app/Services/DiscordService.php` ✅
- `/api/app/Services/TelegramService.php` ✅

**Models**:
- `/api/app/Models/Product.php` ✅
- `/api/app/Models/Setting.php` (needs update)
- `/api/app/Models/DiscordConfig.php` ✅

**Jobs**:
- `/api/app/Jobs/PostRandomProductJob.php` ✅

**Observers**:
- `/api/app/Observers/ProductObserver.php` ✅

**Controllers**:
- `/api/app/Http/Controllers/AdminSettingController.php` (needs update)
- `/api/app/Http/Controllers/ProductController.php` (needs update)

**Console**:
- `/api/app/Console/Kernel.php` (needs update)

**Migrations**:
- Create migration for product posting fields
- Create migration for automation settings

---

**Next Step**: Start with Kernel.php scheduling and Settings migration.

