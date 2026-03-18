# 📋 UpgraderCX SaaS - Pay Hub Integration Roadmap

This document describes the exact changes needed in the **UpgraderCX SaaS** codebase to link it with the **Pay Hub** at `https://www.linkpaypro.online`.

---

## 1. Webhook Configuration
**When adding a new merchant in Pay Hub, use this URL:**
👉 `http://upgradercx.com/api/webhooks/payhub`

---

## 2. Backend Changes (Laravel)

### Step A: Configuration (`.env`)
Add these at the end of your SaaS `.env` file:
```env
PAYHUB_CLIENT_ID=hub_c825b76cbdd2f4f0
PAYHUB_CLIENT_SECRET=your_secret_here
PAYHUB_API_URL=https://www.linkpaypro.online/api
```

### Step B: Database & Route
1.  **Route**: Add this in `routes/api.php`:
    ```php
    Route::post('/webhooks/payhub', [App\Http\Controllers\OrderController::class, 'handlePayHubWebhook']);
    ```
2.  **CSRF**: Ensure this route is excluded from CSRF (in `bootstrap/app.php` for Laravel 11).

### Step C: Update Order Creation (`OrderController.php`)
Modify the `store()` method to call Pay Hub:

```php
// Inside OrderController.php @ store()
// After order is created ($order->id exists)

$payload = [
    'order_id' => (string)$order->id,
    'amount' => (float)$order->total,
    'currency' => 'EUR', // match your system
    'customer_email' => auth()->user()->email,
    'success_url' => 'http://upgradercx.com/orders',
    'cancel_url' => 'http://upgradercx.com/checkout',
];

// 1. Sort and Sign
ksort($payload);
$dataString = http_build_query($payload);
$signature = hash_hmac('sha256', $dataString, env('PAYHUB_CLIENT_SECRET'));

// 2. Call Pay Hub
$response = Http::withHeaders([
    'X-Client-ID' => env('PAYHUB_CLIENT_ID'),
    'X-Signature' => $signature,
])->post(env('PAYHUB_API_URL') . '/checkout/create', $payload);

$result = $response->json();

if ($result['success']) {
    return response()->json([
        'checkout_url' => $result['checkout_url'],
        'message' => 'Redirecting to payment gateway...'
    ]);
}
```

---

## 3. Frontend Changes (React)

### Step A: Update Checkout Logic (`Checkout.tsx`)
In the `handlePay` function, you must handle the `checkout_url` returned from your backend:

```typescript
// Inside Checkout.tsx @ handlePay()
const response = await api.post('/orders', { items, paymentMethod: 'payhub' });

if (response.data.checkout_url) {
    // Redirect the user to Pay Hub
    window.location.href = response.data.checkout_url;
}
```

---

## 4. Verification Check
1.  **Order Created**: User selects products -> SaaS creates order -> SaaS calls Pay Hub.
2.  **Selection**: User sees `linkpaypro.online` selection page (Stripe/Crypto/Cardlink).
3.  **Payment**: User pays on chosen gateway.
4.  **Confirmation**: Pay Hub calls `http://upgradercx.com/api/webhooks/payhub`.
5.  **Finalization**: Your `handlePayHubWebhook` method validates the signature and sets order to `completed`.

---
*Follow these steps to complete the link between your systems.*
