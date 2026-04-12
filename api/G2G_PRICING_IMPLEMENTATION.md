# G2G Pricing Fetch Implementation Guide

## 🎯 Goal: Fetch Product Pricing from G2G for Resale

This guide shows you **exactly** how to fetch pricing data from other G2G sellers and list products on your website.

---

## 📋 What We Built

### 1. **Enhanced G2GService** (`app/Services/Suppliers/G2GService.php`)
- ✅ `fetchProductsWithPricing()` - Gets products + pricing in one call
- ✅ `fetchBulkPricing()` - Gets pricing from multiple brands
- ✅ `getBrandsWithPricingStatus()` - Checks which brands have offers

### 2. **Laravel Command** (`app/Console/Commands/FetchG2GPricingCommand.php`)
- ✅ `php artisan g2g:fetch-pricing` - Automated pricing fetch
- ✅ Supports specific brands/services
- ✅ Progress bars and error handling

### 3. **Test Scripts**
- ✅ `test_g2g_pricing_fetch.php` - Step-by-step workflow demo
- ✅ `fetch_all_g2g_pricing.php` - Bulk fetch all pricing data

---

## 🚀 Quick Start: Get Pricing Data Now

### Step 1: Run the Test Script

```bash
cd api/
php test_g2g_pricing_fetch.php
```

**Expected Output:**
```
✅ Found 9 services
✅ Found 1000+ brands
✅ Found products for brands
❌ No pricing (because no live offers in your account)
```

### Step 2: Run Bulk Fetch (Gets ALL Available Pricing)

```bash
cd api/
php fetch_all_g2g_pricing.php
```

**This will:**
- Scan all 9 services
- Check all 1000+ brands
- Find brands with live offers
- Export data to `g2g_pricing_data.json`

---

## 💰 How Pricing Fetch Works

### The API Flow

```
1. GET /services
   ↓ Returns: service_id (e.g., "Gift Cards")

2. GET /services/{service_id}/brands
   ↓ Returns: brand_id (e.g., "Apple iTunes")

3. POST /offers/search
   Payload: { "filter": { "brand_id": "...", "status": "live" } }
   ↓ Returns: PRICING DATA! 🎉
```

### Sample Pricing Response

```json
{
  "offers": [
    {
      "product_id": "814298ea-fd9f-4741-8134-f5fef5614714",
      "retail_price": 25.00,
      "currency": "USD",
      "quantity": 100,
      "seller_name": "BestSeller123",
      "min_quantity": 1,
      "max_quantity": 50,
      "description": "Apple iTunes Gift Card"
    }
  ]
}
```

---

## 🛠️ Laravel Integration

### Method 1: Use Enhanced Service

```php
// In your controller
public function getProducts(Request $request)
{
    $connection = SupplierConnection::where('type', 'g2g')->first();
    $service = app(G2GService::class)->setConnection($connection);

    $products = $service->fetchProductsWithPricing([
        'service_id' => $request->service_id ?? '8f88b6fd-93df-4a07-b8b0-7d90b152b81f',
        'brand_id' => $request->brand_id
    ]);

    return response()->json($products);
}
```

**Response includes:**
```json
{
  "product_name": "Gift Cards > Apple iTunes > US",
  "offers": [...],
  "pricing": {
    "lowest_price": 20.00,
    "highest_price": 30.00,
    "total_stock": 500
  },
  "resale_price": 23.00,  // Your price with markup
  "profit_margin": 15.0    // 15% profit
}
```

### Method 2: Use Artisan Command

```bash
# Fetch pricing for specific brand
php artisan g2g:fetch-pricing --brand-id=8c42b2d4-6d2c-4188-931a-240d2f94183f

# Fetch pricing for service (first 10 brands)
php artisan g2g:fetch-pricing --service-id=8f88b6fd-93df-4a07-b8b0-7d90b152b81f --limit=10

# Fetch default (Gift Cards service)
php artisan g2g:fetch-pricing
```

### Method 3: Schedule Regular Updates

```php
// In app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('g2g:fetch-pricing')
             ->hourly()
             ->withoutOverlapping();
}
```

---

## 🗄️ Database Storage

### Create Table for Pricing Data

```sql
CREATE TABLE g2g_offers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    brand_id VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    product_id VARCHAR(255),
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    quantity INT,
    seller_name VARCHAR(255),
    min_quantity INT DEFAULT 1,
    max_quantity INT,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand (brand_id),
    INDEX idx_product (product_id)
);
```

### Update Command to Store Data

In `FetchG2GPricingCommand.php`, replace the log line with:

```php
\DB::table('g2g_offers')->updateOrInsert(
    [
        'brand_id' => $brandId,
        'product_id' => $data['product_id']
    ],
    $data
);
```

---

## 🌐 Frontend Integration

### API Endpoint

```php
// routes/api.php
Route::get('/g2g/products', [G2GController::class, 'getProducts']);
```

### Controller Method

```php
public function getProducts(Request $request)
{
    $offers = \DB::table('g2g_offers')
        ->when($request->brand_id, fn($q) => $q->where('brand_id', $request->brand_id))
        ->when($request->min_price, fn($q) => $q->where('price', '>=', $request->min_price))
        ->paginate(20);

    return response()->json($offers);
}
```

### Frontend Display

```javascript
// Fetch and display products
fetch('/api/g2g/products')
  .then(res => res.json())
  .then(data => {
    data.data.forEach(offer => {
      const markup = offer.price * 1.15; // 15% profit
      // Display: offer.brand_name, markup price, offer.quantity
    });
  });
```

---

## 📊 Understanding the Data

### What Each Field Means

| Field | Description | Use Case |
|-------|-------------|----------|
| `retail_price` | Seller's price | Your cost |
| `quantity` | Stock available | Inventory check |
| `seller_name` | Who is selling | Trust indicator |
| `min_quantity` | Minimum order | Purchase rules |
| `currency` | Price currency | Conversion needed |
| `product_id` | G2G product ID | For ordering |

### Pricing Strategy

```php
// In your service
$cost = $offer['retail_price'];
$shipping = 2.00;  // Your shipping cost
$fee = $cost * 0.05;  // 5% platform fee
$profit = $cost * 0.20;  // 20% profit margin

$salePrice = $cost + $shipping + $fee + $profit;
// Customer pays: $salePrice
// You profit: $profit per sale
```

---

## 🔄 Automated Updates

### Cron Job (Linux/Windows)

```bash
# Add to crontab (Linux)
0 * * * * cd /path/to/project/api && php artisan g2g:fetch-pricing

# Windows Task Scheduler
# Program: php.exe
# Arguments: artisan g2g:fetch-pricing
# Schedule: Every hour
```

### Queue Job for Performance

```php
// Create job
php artisan make:job FetchG2GPricing

// Dispatch
FetchG2GPricing::dispatch();
```

---

## 🎯 Real-World Example

### Scenario: Sell Apple iTunes Cards

1. **Fetch Data:**
   ```bash
   php artisan g2g:fetch-pricing --brand-id=8c42b2d4-6d2c-4188-931a-240d2f94183f
   ```

2. **Database Result:**
   ```
   brand_name: Apple iTunes
   price: 25.00 USD
   quantity: 100
   seller_name: TrustedSeller
   ```

3. **Your Website Price:**
   - Cost: $25.00
   - Your Price: $29.00 (15% markup)
   - Profit: $4.00 per card

4. **When Customer Buys:**
   - You buy from G2G for $25
   - Customer pays you $29
   - You ship/deliver the code
   - Profit: $4 per transaction

---

## 🚨 Important Notes

### Rate Limiting
- G2G API has rate limits
- Add delays between requests: `sleep(1)`
- Use queues for bulk operations

### Data Freshness
- Pricing changes frequently
- Update every 1-2 hours
- Cache data for performance

### Error Handling
```php
try {
    $offers = $service->getOffers($brandId);
} catch (\Exception $e) {
    Log::error('G2G API Error', ['error' => $e->getMessage()]);
    // Fallback to cached data
}
```

### Legal Compliance
- ✅ You're reselling legitimate products
- ✅ G2G handles delivery/verification
- ✅ You're just the marketplace

---

## 🎉 You're Ready!

**You now have everything needed to:**

1. ✅ Fetch pricing from other G2G sellers
2. ✅ Store data in your database
3. ✅ Display products on your website
4. ✅ Set your own markup/prices
5. ✅ Automate updates
6. ✅ Handle orders through G2G

**Next Steps:**
1. Run `php fetch_all_g2g_pricing.php` to get current data
2. Set up database table
3. Create frontend to display products
4. Test a purchase flow
5. Go live! 🚀

---

*This system turns you into a G2G reseller marketplace!* 💰