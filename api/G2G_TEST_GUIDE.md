# G2G API Integration Test Guide

## Overview

This guide helps you test whether:
1. ✅ Your G2G account has API access
2. ✅ Authentication/signature generation is working
3. ✅ Products can be fetched
4. ✅ Pricing/offers are available

---

## Setup Instructions

### Step 1: Create `.env` File

Copy `.env.g2g.example` to `.env`:

```bash
cp .env.g2g.example .env
```

### Step 2: Update Credentials

Edit `.env` and add your credentials:

```env
G2G_API_KEY=YOUR_API_KEY_HERE
G2G_USER_ID=YOUR_USER_ID_HERE
G2G_SECRET_KEY=YOUR_SECRET_KEY_HERE
```

**Credentials provided to you:**
- API Key: `M3GYBHGRMHULXK7JWFJVNGY7UNSOHXTB`
- User ID: `5215028`
- Secret Key: `SEH1oIbuGb4SdkAruiqIg2zHvVUyrwDhyG8zBIGXFm9`

---

## Running the Test

### Option 1: CLI (Recommended)

```bash
cd api/
php test_g2g_api.php
```

### Option 2: Laravel Artisan (if integrated)

```bash
php artisan tinker
require 'test_g2g_api.php';
$tester = new G2GApiTester();
$tester->runFullTest();
```

---

## Test Results Interpretation

### ✅ All Tests Passed

```
✅ Account Access: SUCCESSFUL
✅ Found X services
✅ Found X brands
✅ Found X products
✅ Found X offers with pricing
💰 Pricing Status: ✅ AVAILABLE
```

**Meaning:** Your account has full API access and can fetch products with pricing.

---

### ⚠️ Offers/Pricing Not Found

```
❌ Failed to fetch pricing/offers
⚠️ Pricing Status: NO OFFERS FOUND
```

**Possible Reasons:**
1. **No live offers for this brand** – G2G may not have inventory for the selected brand
2. **Account inventory issue** – Your G2G account may not have stock set up
3. **API permission missing** – Contact G2G support to enable offer search

**Solution:** 
- Check G2G account dashboard for live inventory
- Try a different brand (e.g., Apple iTunes, PSN)

---

### ❌ Account Access Test Failed

```
❌ Account Access: FAILED
Response: Unauthorized / Invalid credentials
```

**Possible Reasons:**
1. **Invalid credentials** – API key or user ID is wrong
2. **Signature generation failure** – HMAC-SHA256 calculation is incorrect
3. **API key not activated** – Key not enabled in G2G dashboard

**Solution:**
- Verify credentials in `.env` file
- Re-generate API key from G2G dashboard
- Contact G2G support

---

## What Each Test Does

| Test | Purpose | Expected Result |
|------|---------|-----------------|
| **Account Access** | Verify credentials & GET /store | 200 OK or 400 (account exists) |
| **Get Services** | List available services (Gift Cards, etc.) | 200 OK + service list |
| **Get Brands** | Get brands within a service | 200 OK + brand list |
| **Get Products** | Fetch products for a brand | 200 OK + product list |
| **Get Pricing** | Search offers to get retail prices | 200 OK + offer list with prices |

---

## Sample API Workflow

```
1. GET /services 
   ↓ Returns: service_id (e.g., Gift Cards)
   
2. GET /services/{service_id}/brands
   ↓ Returns: brand_id (e.g., Apple iTunes)
   
3. GET /products?service_id=X&brand_id=Y
   ↓ Returns: product_id, product_name, region
   
4. POST /offers/search (with brand_id)
   ↓ Returns: retail_price, quantity, status
```

---

## Understanding G2G Authentication

G2G uses HMAC-SHA256 signature authentication:

```
Canonical String = /v2/{endpoint} + api_key + user_id + timestamp
Signature = HMAC-SHA256(Canonical String, secret_key)
```

**Headers Required:**
```
g2g-api-key: YOUR_API_KEY
g2g-userid: YOUR_USER_ID
g2g-timestamp: CURRENT_TIME_IN_MS (expires in 5 min)
g2g-signature: GENERATED_HASH
```

Test script auto-generates these headers. ✅

---

## Troubleshooting

### Issue: "Missing G2G credentials"

**Fix:** Ensure `.env` file exists and has:
```env
G2G_API_KEY=...
G2G_USER_ID=...
G2G_SECRET_KEY=...
```

### Issue: "cURL error: SSL certificate problem"

**Fix:** Script uses `CURLOPT_SSL_VERIFYPEER = false` for testing. Production should verify SSL.

### Issue: Status 401 / Invalid Signature

**Fix:** Verify:
1. Secret key is correct (copy from G2G dashboard exactly)
2. Timestamp is in milliseconds (current time * 1000)
3. API key and user ID match

### Issue: Status 400 / Bad Request

**Fix:** May be normal for some endpoints (e.g., `/store`). Check error message in response.

---

## Integration with Your Laravel Service

The test script matches the logic in `app/Services/Suppliers/G2GService.php`:

```php
// Test script uses same signature generation
$canonicalString = "/v2" . $basePath . $apiKey . $userId . $timestamp;
$signature = hash_hmac('sha256', $canonicalString, $secretKey);

// Same as:
// app/Services/Suppliers/G2GService.php::getHeaders()
```

If test passes, your service code is correct. ✅

---

## Next Steps

Once tests pass:

1. **Verify Live Inventory:** Check G2G dashboard for products with pricing
2. **Test Product Fetch in Laravel:**
   ```bash
   php artisan tinker
   >>> $service = app(\App\Services\Suppliers\G2GService::class);
   >>> $service->setConnection($connection)->fetchProducts();
   ```
3. **Monitor Logs:**
   ```bash
   tail -f storage/logs/laravel.log | grep G2G
   ```

---

## Support

- **G2G API Docs:** https://open-api.g2g.com/docs
- **Test Script:** `/api/test_g2g_api.php`
- **Service Class:** `/api/app/Services/Suppliers/G2GService.php`

