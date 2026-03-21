> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `api\activate_pinterest.php` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in activate_pinterest.php**: File updated (external): api/activate_pinterest.php

Content summary (23 lines):
<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\PinterestConfig;

$cfg = PinterestConfig::firstOrCreate(['id' => 1]);
$config = $cfg->config ?? [];
$config['client_id'] = '1551872';
$config['client_secret'] = 'ad38dccdaa15ac56adcfe63ef16d7a41b22fe3502';
$config['access_token'] = 'pina_A
- **[what-changed] Added OAuth2 authentication — prevents null/undefined runtime crashes**: -             ]);
+                 'client_id' => $clientId,
- 
+                 'client_secret' => $clientSecret,
-         if ($response->successful()) {
+             ]);
-             $data = $response->json();
+ 
-             $this->updateConfig([
+         if ($response->successful()) {
-                 'access_token' => $data['access_token'],
+             $data = $response->json();
-                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
+             $this->updateConfig([
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+                 'access_token' => $data['access_token'],
-             ]);
+                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
-             return $data;
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         }
+             ]);
- 
+             return $data;
-         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
+         }
-         return null;
+ 
-     }
+         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
- 
+         return null;
-     /**
+     }
-      * Refresh the access token using the refresh token.
+ 
-      */
+     /**
-     public function refreshAccessToken()
+      * Refresh the access token using the refresh token.
-     {
+      */
-         $clientId = $this->getConfigValue('client_id');
+     public function refreshAccessToken()
-         $client[REDACTED]
+     {
-         $refreshToken = $this->getConfigValue('refresh_token');
+         $clientId = $this->getConfigValue('client_id');
- 
+         $client[REDACTED]
-         if (!$refreshToken) {
+         $refreshToken = $this->getConfigValue('refresh_token');
-             return null;
+ 
-         }
+         if (!$refreshToken) {
- 
+             return null;
-         $response = Http::asForm()
+         }
-             ->withBasicAuth($clientId, $clientSecret)
+ 
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+         $response = Http::asForm()
-                 'grant_type' => 'refresh_token',
+             ->withBasicAuth($clientId, $clientSecret)
-                 'refresh_token' => $refreshToken,
+             ->post('https://api.pinterest.com/v5/oauth/token', [
-             ]);
+                 'grant_type' => 'refresh_token',
- 
+                 'refresh_token' => $refreshToken,
-         if ($response->successful()) {
+             ]);
-             $data = $response->json();
+ 
-             $this->updateConfig([
+         if ($response->successful()) {
-                 'access_token' => $data['access_token'],
+             $data = $response->json();
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+             $this->updateConfig([
-             ]);
+                 'access_token' => $data['access_token'],
-             return $data['access_token'];
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         }
+             ]);
- 
+             return $data['access_token'];
-         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
+         }
-         return null;
+ 
-     }
+         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
- 
+         return null;
-     /**
+     }
-      * Get the Pinterest Boards for the authorized user.
+ 
-      */
+     /**
-     public function getBoards()
+      * Get the Pinterest Boards for the authorized user.
-     {
+      */
-         $accessToken = $this->getValidAccessToken();
+     public function getBoards()
-         if (!$accessToken) {
+     {
-             return [];
+         $accessToken = $this->getValidAccessToken();
-         }
+         if (!$accessToken) {
- 
+             return [];
-         $response = Http::withToken($accessToken)
+         }
-             ->get('https://api.pinterest.com/v5/boards');
+ 
- 
+         $response = Http::withToken($accessToken)
-         if ($response->successful()) {
+             ->get('https://api.pinterest.com/v5/boards');
-             $data = $response->json();
+ 
-             $this->config->update(['boards' => $data['items']]);
+         if ($response->successful()) {
-             return $data['items'];
+             $data = $response->json();
-         }
+             $this->config->update(['boards' => $data['items']]);
- 
+             return $data['items'];
-         Log::error('Pinterest Get Boards Failed: ' . $response->body());
+         }
-         return [];
+ 
-     }
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
- 
+         return [];
-     /**
+     }
-      * Create a new Pin on Pinterest.
+ 
-      */
+     /**
-     public function createPin(array $data)
+      * Create a new Pin on Pinterest.
-     {
+      */
-         $accessToken = $this->getValidAccessToken();
+     public function createPin(array $data)
-         if (!$accessToken) {
+     {
-             Log::error('Pinterest Create Pin Failed: No valid access token.');
+         $accessToken = $this->getValidAccessToken();
-             return null;
+         if (!$accessToken) {
-         }
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
- 
+             return null;
-         $response = Http::withToken($accessToken)
+         }
-             ->post('https://api.pinterest.com/v5/pins', [
+ 
-                 'link' => $data['link'],
+         $response = Http::withToken($accessToken)
-                 'title' => $data['title'],
+             ->post('https://api.pinterest.com/v5/pins', [
-                 'description' => $data['description'],
+                 'link' => $data['link'],
-                 'board_id' => $data['board_id'],
+                 'title' => $data['title'],
-                 'media_source' => [
+                 'description' => $data['description'],
-                     'source_type' => 'image_url',
+                 'board_id' => $data['board_id'],
-                     'url' => $data['image_url'],
+                 'media_source' => [
-                 ],
+                     'source_type' => 'image_url',
-             ]);
+                     'url' => $data['image_url'],
- 
+                 ],
-         if ($response->successful()) {
+             ]);
-             return $response->json();
+ 
-         }
+         if ($response->successful()) {
- 
+             return $response->json();
-         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+         }
-         return null;
+ 
-     }
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
- 
+         return null;
-     /**
+     }
-      * Format and send a blog post to Pinterest.
+ 
-      */
+     /**
-     public function sendBlogPost(BlogPost $post)
+      * Format and send a blog post to Pinterest.
-     {
+      */
-         $boardId = $this->getConfigValue('board_id');
+     public function sendBlogPost(BlogPost $post)
-         if (!$boardId) {
+     {
-             Log::info('Pinterest: Skipping post share (No board selected).');
+         $boardId = $this->getConfigValue('board_id');
-             return null;
+         if (!$boardId) {
-         }
+             Log::info('Pinterest: Skipping post share (No board selected).');
- 
+             return null;
-         $websiteUrl = config('app.url');
+         }
-         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+ 
-             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+         $websiteUrl = config('app.url');
-         }
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
- 
+         }
-         // Pinterest requires a public image URL.
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
-         $imageUrl = $post->image_url;
+ 
-         if (!str_starts_with($imageUrl, 'http')) {
+         // Pinterest requires a public image URL.
-             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+         $imageUrl = $post->image_url;
-         }
+         if (!str_starts_with($imageUrl, 'http')) {
- 
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
-         return $this->createPin([
+         }
-             'link' => $postUrl,
+ 
-             'title' => Str::limit($post->title, 100),
+         return $this->createPin([
-             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+             'link' => $postUrl,
-             'board_id' => $boardId,
+             'title' => Str::limit($post->title, 100),
-             'image_url' => $imageUrl,
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
-         ]);
+             'board_id' => $boardId,
-     }
+             'image_url' => $imageUrl,
- 
+         ]);
-     /**
+     }
-      * Get a valid access token (refreshes if expired).
+ 
-      */
+     /**
-     protected function getValidAccessToken()
+      * Get a valid access token (refreshes if expired).
-     {
+      */
-         $accessToken = $this->getConfigValue('access_token');
+     protected function getValidAccessToken()
-         $expiresAt = $this->getConfigValue('expires_at');
+     {
- 
+         $accessToken = $this->getConfigValue('access_token');
-         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+         $expiresAt = $this->getConfigValue('expires_at');
-             return $this->refreshAccessToken();
+ 
-         }
+         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
- 
+             return $this->refreshAccessToken();
-         return $accessToken;
+         }
-     }
+ 
- 
+         return $accessToken;
-     /* ── Helper Methods ── */
+     }
-     protected function getConfigValue(string $key, $default = null)
+     /* ── Helper Methods ── */
-     {
+ 
-         $config = $this->config->config ?? [];
+     protected function getConfigValue(string $key, $default = null)
-         return $config[$key] ?? $default;
+     {
-     }
+         $config = $this->config->config ?? [];
- 
+         return $config[$key] ?? $default;
-     protected function updateConfig(array $newData)
+     }
-     {
+ 
-         $currentConfig = $this->config->config ?? [];
+     protected function updateConfig(array $newData)
-         $this->config->update([
+     {
-             'config' => array_merge($currentConfig, $newData),
+         $currentConfig = $this->config->config ?? [];
-             'status' => 'active'
+         $this->config->update([
-         ]);
+             'config' => array_merge($currentConfig, $newData),
-     }
+             'status' => 'active'
- }
+         ]);
- 
+     }
+ }
+ 
- **[what-changed] what-changed in PinterestService.php**: -         $redirectUri = url('/api/admin/pinterest/callback');
+         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
- **[what-changed] Added OAuth2 authentication — ensures atomic multi-step database operations**: - // FIX: Moved Pay Hub webhook here and added withoutMiddleware to solve "401 Unauthenticated" error.
+ Route::post('webhooks/payhub',       [OrderController::class, 'handlePayHubWebhook'])->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, 'auth:sanctum']);
- Route::post('webhooks/payhub',       [OrderController::class, 'handlePayHubWebhook'])->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, 'auth:sanctum']);
+ 
- 
+ /* Pinterest OAuth Callback (Public) */
- /* ── Public Settings ── */
+ Route::get('admin/pinterest/callback', [PinterestController::class, 'handleCallback']);
- Route::get('settings',              [AdminSettingController::class, 'index']);
+ 
- 
+ /* ── Public Settings ── */
- /* ── Authenticated routes ── */
+ Route::get('settings',              [AdminSettingController::class, 'index']);
- Route::middleware('auth:sanctum')->group(function () {
+ 
- 
+ /* ── Authenticated routes ── */
-     /* Products (admin POST/PUT/DELETE) */
+ Route::middleware('auth:sanctum')->group(function () {
-     Route::post('products/{id}/duplicate',    [ProductController::class, 'duplicate'])->middleware('role:admin');
+ 
-     Route::post('products/bulk',              [ProductController::class, 'bulkAction'])->middleware('role:admin');
+     /* Products (admin POST/PUT/DELETE) */
-     Route::apiResource('products', ProductController::class)->except(['index', 'show'])->middleware('role:admin');
+     Route::post('products/{id}/duplicate',    [ProductController::class, 'duplicate'])->middleware('role:admin');
- 
+     Route::post('products/bulk',              [ProductController::class, 'bulkAction'])->middleware('role:admin');
-     /* Orders */
+     Route::apiResource('products', ProductController::class)->except(['index', 'show'])->middleware('role:admin');
-     Route::get('orders',                       [OrderController::class, 'index']);
+ 
-     Route::get('my-products',                 [OrderController::class, 'myProducts']);
+     /* Orders */
-     Route::get('orders/{id}',                  [OrderController::class, 'show']);
+     Route::get('orders',                       [OrderController::class, 'index']);
-     Route::get('orders/{id}',                  [OrderController::class, 'show']);
+     Route::get('my-products',                 [OrderController::class, 'myProducts']);
-     Route::patch('orders/{id}/status',         [OrderController::class, 'updateStatus'])->middleware('role:admin');
+     Route::get('orders/{id}',                  [OrderController::class, 'show']);
- 
+     Route::get('orders/{id}',                  [OrderController::class, 'show']);
-     /* Wallet */
+     Route::patch('orders/{id}/status',         [OrderController::class, 'updateStatus'])->middleware('role:admin');
-     Route::get('wallet/balance',               [WalletController::class, 'balance']);
+ 
-     Route::get('wallet/transactions',          [WalletController::class, 'transactions']);
+     /* Wallet */
-     Route::post('wallet/top-up',               [WalletController::class, 'topUp']);
+     Route::get('wallet/balance',               [WalletController::class, 'balance']);
-     Route::post('wallet/spend',                [WalletController::class, 'spend']);
+     Route::get('wallet/transactions',          [WalletController::class, 'transactions']);
- 
+     Route::post('wallet/top-up',               [WalletController::class, 'topUp']);
-     /* Tickets */
+     Route::post('wallet/spend',                [WalletController::class, 'spend']);
-     Route::get('tickets',                      [TicketController::class, 'index']);
+ 
-     Route::post('tickets',                     [TicketController::class, 'store']);
+     /* Tickets */
-     Route::get('tickets/{id}',                 [TicketController::class, 'show']);
+     Route::get('tickets',                      [TicketController::class, 'index']);
-     Route::post('tickets/{id}/reply',          [TicketController::class, 'reply']);
+     Route::post('tickets',                     [TicketController::class, 'store']);
-     Route::post('tickets/{id}/close',          [TicketController::class, 'close']);
+     Route::get('tickets/{id}',                 [TicketController::class, 'show']);
-     Route::post('tickets/{id}/reopen',         [TicketController::class, 'reopen']);
+     Route::post('tickets/{id}/reply',          [TicketController::class, 'reply']);
- 
+     Route::post('tickets/{id}/close',          [TicketController::class, 'close']);
-     /* Referrals */
+     Route::post('tickets/{id}/reopen',         [TicketController::class, 'reopen']);
-     Route::get('referrals',                    [ReferralController::class, 'index']);
+ 
-     Route::get('referrals/stats',              [ReferralController::class, 'stats']);
+     /* Referrals */
- 
+     Route::get('referrals',                    [ReferralController::class, 'index']);
-     /* Notifications */
+     Route::get('referrals/stats',              [ReferralController::class, 'stats']);
-     Route::get('notifications',                [NotificationController::class, 'index']);
+ 
-     Route::patch('notifications/{id}/read',    [NotificationController::class, 'markRead']);
+     /* Notifications */
-     Route::post('notifications/read-all',      [NotificationController::class, 'markAllRead']);
+     Route::get('notifications',                [NotificationController::class, 'index']);
-     Route::get('notifications/preferences',    [NotificationController::class, 'preferences']);
+     Route::patch('notifications/{id}/read',    [NotificationController::class, 'markRead']);
-     Route::put('notifications/preferences',    [NotificationController::class, 'updatePreferences']);
+     Route::post('notifications/read-all',      [NotificationController::class, 'markAllRead']);
- 
+     Route::get('notifications/preferences',    [NotificationController::class, 'preferences']);
-     /* File uploads */
+     Route::put('notifications/preferences',    [NotificationController::class, 'updatePreferences']);
-     Route::post('uploads',                     [UploadController::class, 'store'])->middleware('role:admin');
+ 
- 
+     /* File uploads */
-     /* Pricing rules */
+     Route::post('uploads',                     [UploadController::class, 'store'])->middleware('role:admin');
-     Route::apiResource('pricing-rules', PricingRuleController::class)->middleware('role:admin');
+ 
- 
+     /* Pricing rules */
-     /* ── Admin routes ── */
+     Route::apiResource('pricing-rules', PricingRuleController::class)->middleware('role:admin');
-     Route::middleware('role:admin')->prefix('admin')->group(function () {
+ 
- 
+     /* ── Admin routes ── */
-         /* Dashboard */
+     Route::middleware('role:admin')->prefix('admin')->group(function () {
-         Route::get('dashboard',                [CustomerController::class, 'adminDashboard']);
+ 
- 
+         /* Dashboard */
-         /* Customers */
+         Route::get('dashboard',                [CustomerController::class, 'adminDashboard']);
-         Route::get('customers',                [CustomerController::class, 'index']);
+ 
-         Route::get('customers/{id}',           [CustomerController::class, 'show']);
+         /* Customers */
-         Route::patch('customers/{id}',         [CustomerController::class, 'update']);
+         Route::get('customers',                [CustomerController::class, 'index']);
-         Route::delete('customers/{id}',        [CustomerController::class, 'destroy']);
+         Route::get('customers/{id}',           [CustomerController::class, 'show']);
-         Route::post('customers/{id}/suspend',  [CustomerController::class, 'suspend']);
+         Route::patch('customers/{id}',         [CustomerController::class, 'update']);
-         Route::post('customers/{id}/activate', [CustomerController::class, 'activate']);
+         Route::delete('customers/{id}',        [CustomerController::class, 'destroy']);
-         Route::get('customers/{id}/orders',    [CustomerController::class, 'orders']);
+         Route::post('customers/{id}/suspend',  [CustomerController::class, 'suspend']);
-         Route::get('customers/{id}/wallet',    [CustomerController::class, 'wallet']);
+         Route::post('customers/{id}/activate', [CustomerController::class, 'activate']);
-         Route::post('customers/{id}/wallet/adjust', [CustomerController::class, 'adjustWallet']);
+         Route::get('customers/{id}/orders',    [CustomerController::class, 'orders']);
- 
+         Route::get('customers/{id}/wallet',    [CustomerController::class, 'wallet']);
-         /* Blog */
+         Route::post('customers/{id}/wallet/adjust', [CustomerController::class, 'adjustWallet']);
-         Route::post('blog',                    [BlogController::class, 'store']);
+ 
-         Route::put('blog/{id}',                [BlogController::class, 'update']);
+         /* Blog */
-         Route::delete('blog/{id}',             [BlogController::class, 'destroy']);
+         Route::post('blog',                    [BlogController::class, 'store']);
-         Route::post('blog/{id}/publish',       [BlogController::class, 'publish']);
+         Route::put('blog/{id}',                [BlogController::class, 'update']);
-         Route::post('blog/{id}/schedule',      [BlogController::class, 'schedule']);
+         Route::delete('blog/{id}',             [BlogController::class, 'destroy']);
-         Route::post('blog/{id}/submit-review', [BlogController::class, 'submitForReview']);
+         Route::post('blog/{id}/publish',       [BlogController::class, 'publish']);
-         Route::post('blog/{id}/approve',       [BlogController::class, 'approve']);
+         Route::post('blog/{id}/schedule',      [BlogController::class, 'schedule']);
- 
+         Route::post('blog/{id}/submit-review', [BlogController::class, 'submitForReview']);
-         /* Automation */
+         Route::post('blog/{id}/approve',       [BlogController::class, 'approve']);
-         Route::prefix('automation')->group(function () {
+ 
-             Route::get('modules',               [AutomationController::class, 'modules']);
+         /* Automation */
-             Route::put('modules/{id}/toggle',    [AutomationController::class, 'toggleModule']);
+         Route::prefix('automation')->group(function () {
-             
+             Route::get('modules',               [AutomationController::class, 'modules']);
-             Route::prefix('random-post')->group(function () {
+             Route::put('modules/{id}/toggle',    [AutomationController::class, 'toggleModule']);
-                 Route::get('config',            [AutomationController::class, 'getRandomPostConfig']);
+             
-                 Route::put('config',            [AutomationController::class, 'updateRandomPostConfig']);
+             Route::prefix('random-post')->group(function () {
-                 Route::post('toggle',           [AutomationController::class, 'togglePause']);
+                 Route::get('config',            [AutomationController::class, 'getRandomPostConfig']);
-                 Route::get('health',            [AutomationController::class, 'getHealth']);
+                 Route::put('config',            [AutomationController::class, 'updateRandomPostConfig']);
-                 Route::get('jobs',              [AutomationController::class, 'jobs']);
+                 Route::post('toggle',           [AutomationController::class, 'togglePause']);
-                 Route::post('test',             [AutomationController::class, 'testRun']);
+                 Route::get('health',            [AutomationController::class, 'getHealth']);
-                 Route::post('jobs/{id}/retry',  [AutomationController::class, 'retryJob']);
+                 Route::get('jobs',              [AutomationController::class, 'jobs']);
-             });
+                 Route::post('test',             [AutomationController::class, 'testRun']);
- 
+                 Route::post('jobs/{id}/retry',  [AutomationController::class, 'retryJob']);
-             Route::prefix('featured-rotation')->group(function () {
+             });
-                 Route::get('config',            [AutomationController::class, 'getFeaturedConfig']);
+ 
-                 Route::put('config',            [AutomationController::class, 'updateFeaturedConfig']);
+             Route::prefix('featured-rotation')->group(function () {
-                 Route::post('trigger',          [AutomationController::class, 'triggerFeaturedRotation']);
+                 Route::get('config',            [AutomationController::class, 'getFeaturedConfig']);
-             });
+                 Route::put('config',            [AutomationController::class, 'updateFeaturedConfig']);
- 
+                 Route::post('trigger',          [AutomationController::class, 'triggerFeaturedRotation']);
-             Route::prefix('stock-suppression')->group(function () {
+             });
-                 Route::get('config',            [AutomationController::class, 'getStockConfig']);
+ 
-                 Route::put('config',            [AutomationController::class, 'updateStockConfig']);
+             Route::prefix('stock-suppression')->group(function () {
-             });
+                 Route::get('config',            [AutomationController::class, 'getStockConfig']);
- 
+                 Route::put('config',            [AutomationController::class, 'updateStockConfig']);
-             Route::prefix('import-queue')->group(function () {
+             });
-                 Route::get('/',                 [AutomationController::class, 'getImportQueue']);
+ 
-                 Route::post('{id}/approve',     [AutomationController::class, 'approveImport']);
+             Route::prefix('import-queue')->group(function () {
-                 Route::post('{id}/reject',      [AutomationController::class, 'rejectImport']);
+                 Route::get('/',                 [AutomationController::class, 'getImportQueue']);
-             });
+                 Route::post('{id}/approve',     [AutomationController::class, 'approveImport']);
- 
+                 Route::post('{id}/reject',      [AutomationController::class, 'rejectImport']);
-             Route::get('reseller/markup-preview', [AutomationController::class, 'getMarkupPreview']);
+             });
-             
+ 
-             /* Legacy Rules */
+             Route::get('reseller/markup-preview', [AutomationController::class, 'getMarkupPreview']);
-             Route::get('rules',                 [AutomationController::class, 'rules']);
+             
-             Route::post('rules',                [AutomationController::class, 'createRule']);
+             /* Legacy Rules */
-             Route::put('rules/{id}',            [AutomationController::class, 'updateRule']);
+             Route::get('rules',                 [AutomationController::class, 'rules']);
-             Route::delete('rules/{id}',         [AutomationController::class, 'deleteRule']);
+             Route::post('rules',                [AutomationController::class, 'createRule']);
-         });
+             Route::put('rules/{id}',            [AutomationController::class, 'updateRule']);
- 
+             Route::delete('rules/{id}',         [AutomationController::class, 'deleteRule']);
-         /* Integrations */
+         });
-         Route::get('integrations',             [IntegrationController::class, 'index']);
+ 
-         Route::post('integrations/{id}/connect',    [IntegrationController::class, 'connect']);
+         /* Integrations */
-         Route::post('integrations/{id}/disconnect', [IntegrationController::class, 'disconnect']);
+         Route::get('integrations',             [IntegrationController::class, 'index']);
-         Route::post('integrations/{id}/test',       [IntegrationController::class, 'test']);
+         Route::post('integrations/{id}/connect',    [IntegrationController::class, 'connect']);
- 
+         Route::post('integrations/{id}/disconnect', [IntegrationController::class, 'disconnect']);
-         /* Telegram */
+         Route::post('integrations/{id}/test',       [IntegrationController::class, 'test']);
-         Route::get('telegram/config',          [TelegramController::class, 'getConfig']);
+ 
-         Route::put('telegram/config',          [TelegramController::class, 'updateConfig']);
+         /* Telegram */
-         Route::get('telegram/commands',        [TelegramController::class, 'commands']);
+         Route::get('telegram/config',          [TelegramController::class, 'getConfig']);
-         Route::put('telegram/commands',        [TelegramController::class, 'updateCommands']);
+         Route::put('telegram/config',          [TelegramController::class, 'updateConfig']);
-         Route::get('telegram/permissions',     [TelegramController::class, 'permissions']);
+         Route::get('telegram/commands',        [TelegramController::class, 'commands']);
-         Route::put('telegram/permissions',     [TelegramController::class, 'updatePermissions']);
+         Route::put('telegram/commands',        [TelegramController::class, 'updateCommands']);
-         Route::get('telegram/posts',           [TelegramController::class, 'postHistory']);
+         Route::get('telegram/permissions',     [TelegramController::class, 'permissions']);
-         Route::post('telegram/push',           [TelegramController::class, 'push']);
+         Route::put('telegram/permissions',     [TelegramController::class, 'updatePermissions']);
- 
+         Route::get('telegram/posts',           [TelegramController::class, 'postHistory']);
-         /* Discord */
+         Route::post('telegram/push',           [TelegramController::class, 'push']);
-         Route::get('discord/config',           [DiscordController::class, 'getConfig']);
+ 
-         Route::put('discord/config',           [DiscordController::class, 'updateConfig']);
+         /* Discord */
-         Route::get('discord/commands',         [DiscordController::class, 'commands']);
+         Route::get('discord/config',           [DiscordController::class, 'getConfig']);
-         Route::put('discord/commands',         [DiscordController::class, 'updateCommands']);
+         Route::put('discord/config',           [DiscordController::class, 'updateConfig']);
-         Route::get('discord/permissions',      [DiscordController::class, 'permissions']);
+         Route::get('discord/commands',         [DiscordController::class, 'commands']);
-         Route::put('discord/permissions',      [DiscordController::class, 'updatePermissions']);
+         Route::put('discord/commands',         [DiscordController::class, 'updateCommands']);
-         Route::get('discord/posts',            [DiscordController::class, 'postHistory']);
+         Route::get('discord/permissions',      [DiscordController::class, 'permissions']);
-         Route::post('discord/push',            [DiscordController::class, 'push']);
+         Route::put('discord/permissions',      [DiscordController::class, 'updatePermissions']);
-         Route::get('discord/alerts',           [DiscordController::class, 'alerts']);
+         Route::get('discord/posts',            [DiscordController::class, 'postHistory']);
-         Route::put('discord/alerts',           [DiscordController::class, 'updateAlerts']);
+         Route::post('discord/push',            [DiscordController::class, 'push']);
- 
+         Route::get('discord/alerts',           [DiscordController::class, 'alerts']);
-         /* Pinterest */
+         Route::put('discord/alerts',           [DiscordController::class, 'updateAlerts']);
-         Route::get('pinterest/config',         [PinterestController::class, 'getConfig']);
+ 
-         Route::put('pinterest/config',         [PinterestController::class, 'updateConfig']);
+         /* Pinterest */
-         Route::get('pinterest/auth-url',       [PinterestController::class, 'getAuthUrl']);
+         Route::get('pinterest/config',         [PinterestController::class, 'getConfig']);
-         Route::get('pinterest/callback',       [PinterestController::class, 'handleCallback']);
+         Route::put('pinterest/config',         [PinterestController::class, 'updateConfig']);
-         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
+         Route::get('pinterest/auth-url',       [PinterestController::class, 'getAuthUrl']);
-         Route::post('pinterest/test',          [PinterestController::class, 'testConnection']);
+         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
- 
+         Route::post('pinterest/test',          [PinterestController::class, 'testConnection']);
-         /* Channel Sync (Frontend expected: /api/sync/...) */
+ 
-         Route::prefix('sync')->group(function () {
+         /* Channel Sync (Frontend expected: /api/sync/...) */
-             Route::get('dashboard',     [ChannelSyncController::class, 'dashboard']);
+         Route::prefix('sync')->group(function () {
-             Route::get('statuses',      [ChannelSyncController::class, 'statuses']);
+             Route::get('dashboard',     [ChannelSyncController::class, 'dashboard']);
-             Route::get('queue',         [ChannelSyncController::class, 'queue']);
+             Route::get('statuses',      [ChannelSyncController::class, 'statuses']);
-             Route::get('failed',        [ChannelSyncController::class, 'failedJobs']);
+             Route::get('queue',         [ChannelSyncController::class, 'queue']);
-             Route::post('retry/{id}',   [ChannelSyncController::class, 'retry']);
+             Route::get('failed',        [ChannelSyncController::class, 'failedJobs']);
-             Route::get('health',        [ChannelSyncController::class, 'health']);
+             Route::post('retry/{id}',   [ChannelSyncController::class, 'retry']);
-             Route::get('conflicts',     [ChannelSyncController::class, 'conflicts']);
+             Route::get('health',        [ChannelSyncController::class, 'health']);
-             Route::post('resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
+             Route::get('conflicts',     [ChannelSyncController::class, 'conflicts']);
-         });
+             Route::post('resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
- 
+         });
-         Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
+ 
-         Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
+         Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
-         Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
+         Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
-         Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
+         Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
-         Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
+         Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
-         Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
+         Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
-         Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
+         Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
- 
+         Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
-         /* Pricing & Sync */
+ 
-         Route::prefix('pricing')->group(function () {
+         /* Pricing & Sync */
-             Route::get('settings',             [PricingSyncController::class, 'settings']);
+         Route::prefix('pricing')->group(function () {
-             Route::put('settings',             [PricingSyncController::class, 'updateSettings']);
+             Route::get('settings',             [PricingSyncController::class, 'settings']);
-             Route::get('conflicts',            [PricingSyncController::class, 'conflicts']);
+             Route::put('settings',             [PricingSyncController::class, 'updateSettings']);
-             Route::post('conflicts/{id}/resolve', [PricingSyncController::class, 'resolve']);
+             Route::get('conflicts',            [PricingSyncController::class, 'conflicts']);
-             Route::get('audit-log',            [PricingSyncController::class, 'auditLog']);
+             Route::post('conflicts/{id}/resolve', [PricingSyncController::class, 'resolve']);
-             Route::post('approve/{id}',        [PricingSyncController::class, 'approve']);
+             Route::get('audit-log',            [PricingSyncController::class, 'auditLog']);
-             Route::post('reject/{id}',         [PricingSyncController::class, 'reject']);
+             Route::post('approve/{id}',        [PricingSyncController::class, 'approve']);
-         });
+             Route::post('reject/{id}',         [PricingSyncController::class, 'reject']);
-         Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
+         });
- 
+         Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
-         /* Sync Logs */
+ 
-         Route::get('sync-logs',                [SyncLogController::class, 'index']);
+         /* Sync Logs */
-         Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);
+         Route::get('sync-logs',                [SyncLogController::class, 'index']);
- 
+         Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);
-         /* Audit Logs */
+ 
-         Route::get('audit-logs',               [AuditLogController::class, 'index']);
+         /* Audit Logs */
-         Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);
+         Route::get('audit-logs',               [AuditLogController::class, 'index']);
- 
+         Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);
-         /* Compliance */
+ 
-         Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
+         /* Compliance */
-         Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
+         Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
-         Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
+         Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
-         Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
+         Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
-         Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);
+         Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
- 
+         Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);
-         /* Supplier Import (Aligned with frontend) */
+ 
-         Route::get('suppliers',                   [SupplierImportController::class, 'connections']);
+         /* Supplier Import (Aligned with frontend) */
-         Route::post('suppliers/{id}/sync',          [SupplierImportController::class, 'fetchProducts']);
+         Route::get('suppliers',                   [SupplierImportController::class, 'connections']);
-         Route::get('suppliers/{id}/products',       [SupplierImportController::class, 'products']);
+         Route::post('suppliers/{id}/sync',          [SupplierImportController::class, 'fetchProducts']);
-         Route::get('suppliers/{id}/duplicates',     [SupplierImportController::class, 'duplicates']);
+         Route::get('suppliers/{id}/products',       [SupplierImportController::class, 'products']);
-         Route::post('suppliers/import',            [SupplierImportController::class, 'import']);
+         Route::get('suppliers/{id}/duplicates',     [SupplierImportController::class, 'duplicates']);
-         Route::get('suppliers/import-jobs',        [SupplierImportController::class, 'jobs']);
+         Route::post('suppliers/import',            [SupplierImportController::class, 'import']);
-         Route::post('suppliers/import-jobs/{id}/retry', [SupplierImportController::class, 'retryJob']);
+         Route::get('suppliers/import-jobs',        [SupplierImportController::class, 'jobs']);
-         
+         Route::post('suppliers/import-jobs/{id}/retry', [SupplierImportController::class, 'retryJob']);
-         /* Supplier Sync */
+         
-         Route::prefix('supplier-sync')->group(function () {
+         /* Supplier Sync */
-             Route::get('mappings',         [SupplierSyncController::class, 'index']);
+         Route::prefix('supplier-sync')->group(function () {
-             Route::patch('mappings/{id}',  [SupplierSyncController::class, 'update']);
+             Route::get('mappings',         [SupplierSyncController::class, 'index']);
-             Route::post('mappings/{id}/sync', [SupplierSyncController::class, 'sync']);
+             Route::patch('mappings/{id}',  [SupplierSyncController::class, 'update']);
-             Route::post('sync-all',        [SupplierSyncController::class, 'syncAll']);
+             Route::post('mappings/{id}/sync', [SupplierSyncController::class, 'sync']);
-             Route::get('logs',             [SupplierSyncController::class, 'logs']);
+             Route::post('sync-all',        [SupplierSyncController::class, 'syncAll']);
-             Route::get('balances',         [SupplierSyncController::class, 'balances']);
+             Route::get('logs',             [SupplierSyncController::class, 'logs']);
-             Route::post('orders/{id}/retry-fulfillment', [SupplierSyncController::class, 'retryFulfillment']);
+             Route::get('balances',         [SupplierSyncController::class, 'balances']);
-         });
+             Route::post('orders/{id}/retry-fulfillment', [SupplierSyncController::class, 'retryFulfillment']);
- 
+         });
-         /* Admin Settings */
+ 
-         Route::get('settings',                 [AdminSettingController::class, 'index']);
+         /* Admin Settings */
-         Route::put('settings',                 [AdminSettingController::class, 'update']);
+         Route::get('settings',                 [AdminSettingController::class, 'index']);
- 
+         Route::put('settings',                 [AdminSettingController::class, 'update']);
-         /* AI Blog Automation */
+ 
-         Route::prefix('blog-automation')->group(function () {
+         /* AI Blog Automation */
-             Route::get('config',               [AdminBlogAutomationController::class, 'show']);
+         Route::prefix('blog-automation')->group(function () {
-             Route::put('config',               [AdminBlogAutomationController::class, 'update']);
+             Route::get('config',               [AdminBlogAutomationController::class, 'show']);
-             
+             Route::put('config',               [AdminBlogAutomationController::class, 'update']);
-             Route::get('telegram',             [AdminBlogAutomationController::class, 'getTelegramConfig']);
+             
-             Route::put('telegram',             [AdminBlogAutomationController::class, 'updateTelegramConfig']);
+             Route::get('telegram',             [AdminBlogAutomationController::class, 'getTelegramConfig']);
-             Route::post('telegram/test',       [AdminBlogAutomationController::class, 'testTelegram']);
+             Route::put('telegram',             [AdminBlogAutomationController::class, 'updateTelegramConfig']);
- 
+             Route::post('telegram/test',       [AdminBlogAutomationController::class, 'testTelegram']);
-             Route::get('pinterest',            [AdminBlogAutomationController::class, 'getPinterestConfig']);
+ 
-             Route::put('pinterest',            [AdminBlogAutomationController::class, 'updatePinterestConfig']);
+             Route::get('pinterest',            [AdminBlogAutomationController::class, 'getPinterestConfig']);
-             Route::post('pinterest/test',      [AdminBlogAutomationController::class, 'testPinterest']);
+             Route::put('pinterest',            [AdminBlogAutomationController::class, 'updatePinterestConfig']);
- 
+             Route::post('pinterest/test',      [AdminBlogAutomationController::class, 'testPinterest']);
-             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
+ 
-             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
+             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
-             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
+             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
-             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
+             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
-             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
+             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
-             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
+             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
-             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
+             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
-             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
+             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
-             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
+             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
-         });
+             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
- 
+         });
-         /* Products (Admin Aliases) */
+ 
-         Route::get('products',                [ProductController::class, 'index']);
+         /* Products (Admin Aliases) */
-         Route::get('products/{id}',           [ProductController::class, 'show']);
+         Route::get('products',                [ProductController::class, 'index']);
-         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
+         Route::get('products/{id}',           [ProductController::class, 'show']);
-         Route::post('products',               [ProductController::class, 'store']);
+         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
-         Route::put('products/{id}',           [ProductController::class, 'update']);
+         Route::post('products',               [ProductController::class, 'store']);
-         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
+         Route::put('products/{id}',           [ProductController::class, 'update']);
-         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
+         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
-         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
+         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
- 
+         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
-         /* Categories (Admin Aliases) */
+ 
-         Route::get('categories',              [CategoryController::class, 'index']);
+         /* Categories (Admin Aliases) */
-         Route::get('categories/{id}',         [CategoryController::class, 'show']);
+         Route::get('categories',              [CategoryController::class, 'index']);
-         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
+         Route::get('categories/{id}',         [CategoryController::class, 'show']);
-         Route::post('categories',             [CategoryController::class, 'store']);
+         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
-         Route::put('categories/{id}',         [CategoryController::class, 'update']);
+         Route::post('categories',             [CategoryController::class, 'store']);
-         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
+         Route::put('categories/{id}',         [CategoryController::class, 'update']);
- 
+         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
-         /* Orders (Admin Aliases) */
+ 
-         Route::get('orders',                  [OrderController::class, 'index']);
+         /* Orders (Admin Aliases) */
-         Route::get('orders/{id}',             [OrderController::class, 'show']);
+         Route::get('orders',                  [OrderController::class, 'index']);
-         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
+         Route::get('orders/{id}',             [OrderController::class, 'show']);
- 
+         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
-         /* Tickets (Admin Aliases) */
+ 
-         Route::get('tickets',                 [TicketController::class, 'index']);
+         /* Tickets (Admin Aliases) */
-         Route::get('tickets/{id}',            [TicketController::class, 'show']);
+         Route::get('tickets',                 [TicketController::class, 'index']);
-         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
+         Route::get('tickets/{id}',            [TicketController::class, 'show']);
-         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
+         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
-         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
+         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
-     });
+         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
- });
+     });
- 
+ });
+ 
- **[what-changed] Replaced auth Request**: -     public function handleCallback(Request $request): JsonResponse
+     public function handleCallback(Request $request)
-         $state = $request->get('state');
+         
- 
+         if (!$code) {
-         // Optional: Validate state against session
+             return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?error=no_code');
-         // if ($state !== session('pinterest_oauth_state')) { ... }
+         }
-         if (!$code) {
+         $tokens = $this->pinterestService->getTokenFromCode($code);
-             return response()->json(['message' => 'Authorization failed: No code provided.'], 400);
+         
-         }
+         if ($tokens) {
- 
+             return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?success=pinterest_connected');
-         $tokens = $this->pinterestService->getTokenFromCode($code);
+         }
-         if ($tokens) {
+ 
-             return response()->json(['message' => 'Pinterest connected successfully.']);
+         return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?error=token_exchange_failed');
-         }
+     }
-         return response()->json(['message' => 'Failed to exchange code for tokens.'], 500);
+     /**
-     }
+      * Get user boards from Pinterest.
- 
+      */
-     /**
+     public function getBoards(): JsonResponse
-      * Get user boards from Pinterest.
+     {
-      */
+         $boards = $this->pinterestService->getBoards();
-     public function getBoards(): JsonResponse
+         return response()->json(['data' => $boards]);
-     {
+     }
-         $boards = $this->pinterestService->getBoards();
+ 
-         return response()->json(['data' => $boards]);
+     /**
-     }
+      * Test the Pinterest connection by fetching boards.
- 
+      */
-     /**
+     public function testConnection(): JsonResponse
-      * Test the Pinterest connection by fetching boards.
+     {
-      */
+         $boards = $this->pinterestService->getBoards();
-     public function testConnection(): JsonResponse
+         if (!empty($boards) || count($boards) === 0) {
-     {
+             return response()->json(['success' => true, 'message' => 'Connection successful.']);
-         $boards = $this->pinterestService->getBoards();
+         }
-         if (!empty($boards) || count($boards) === 0) {
+         return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
-             return response()->json(['success' => true, 'message' => 'Connection successful.']);
+     }
-         }
+ }
-         return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
+ 
-     }
- }
- 
- **[convention] what-changed in PinterestService.php — confirmed 3x**: -         $redirectUri = rtrim(config('app.url'), '/') . '/api/admin/pinterest/callback';
+         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
- **[what-changed] what-changed in PinterestService.php**: -         $redirectUri = url('/api/admin/pinterest/callback');
+         $redirectUri = rtrim(config('app.url'), '/') . '/api/admin/pinterest/callback';
- **[what-changed] Replaced auth Http — ensures atomic multi-step database operations**: - 
+ use App\Http\Controllers\PinterestController;
- use App\Http\Controllers\ChannelSyncController;
+ 
- use App\Http\Controllers\SupplierImportController;
+ use App\Http\Controllers\ChannelSyncController;
- use App\Http\Controllers\SupplierSyncController;
+ use App\Http\Controllers\SupplierImportController;
- use App\Http\Controllers\UploadController;
+ use App\Http\Controllers\SupplierSyncController;
- 
+ use App\Http\Controllers\UploadController;
- /*
+ 
- |--------------------------------------------------------------------------
+ /*
- | API Routes — UpgraderCX
+ |--------------------------------------------------------------------------
- |--------------------------------------------------------------------------
+ | API Routes — UpgraderCX
- | Base: /api
+ |--------------------------------------------------------------------------
- | Auth: Laravel Sanctum token-based (VITE_AUTH_MODE=token)
+ | Base: /api
- |
+ | Auth: Laravel Sanctum token-based (VITE_AUTH_MODE=token)
- | Public routes: products/slug, categories/slug, blog/slug
+ |
- | Authenticated: all others
+ | Public routes: products/slug, categories/slug, blog/slug
- | Admin: routes under /admin require role=admin
+ | Authenticated: all others
- */
+ | Admin: routes under /admin require role=admin
- 
+ */
- /* ── Auth ── */
+ 
- Route::prefix('auth')->group(function () {
+ /* ── Auth ── */
-     Route::post('login',            [AuthController::class, 'login']);
+ Route::prefix('auth')->group(function () {
-     Route::post('register',         [AuthController::class, 'register']);
+     Route::post('login',            [AuthController::class, 'login']);
-     Route::post('forgot-password',  [AuthController::class, 'forgotPassword']);
+     Route::post('register',         [AuthController::class, 'register']);
-     Route::post('reset-password',   [AuthController::class, 'resetPassword']);
+     Route::post('forgot-password',  [AuthController::class, 'forgotPassword']);
-     Route::post('refresh',          [AuthController::class, 'refresh']);
+     Route::post('reset-password',   [AuthController::class, 'resetPassword']);
- 
+     Route::post('refresh',          [AuthController::class, 'refresh']);
-     Route::middleware('auth:sanctum')->group(function () {
+ 
-         Route::get('user',          [AuthController::class, 'user']);
+     Route::middleware('auth:sanctum')->group(function () {
-         Route::post('logout',       [AuthController::class, 'logout']);
+         Route::get('user',          [AuthController::class, 'user']);
-         Route::post('verify-email', [AuthController::class, 'verifyEmail']);
+         Route::post('logout',       [AuthController::class, 'logout']);
-     });
+         Route::post('verify-email', [AuthController::class, 'verifyEmail']);
- });
+     });
- 
+ });
- /* ── Public product & category routes ── */
+ 
- Route::get('products/slug/{slug}',   [ProductController::class, 'showBySlug']);
+ /* ── Public product & category routes ── */
- Route::get('categories/slug/{slug}', [CategoryController::class, 'showBySlug']);
+ Route::get('products/slug/{slug}',   [ProductController::class, 'showBySlug']);
- Route::get('categories',             [CategoryController::class, 'index']);
+ Route::get('categories/slug/{slug}', [CategoryController::class, 'showBySlug']);
- Route::get('categories/{id}',        [CategoryController::class, 'show']);
+ Route::get('categories',             [CategoryController::class, 'index']);
- 
+ Route::get('categories/{id}',        [CategoryController::class, 'show']);
- Route::get('products',               [ProductController::class, 'index']);
+ 
- Route::get('products/{id}',          [ProductController::class, 'show']);
+ Route::get('products',               [ProductController::class, 'index']);
- Route::get('blog',                   [BlogController::class, 'index']);
+ Route::get('products/{id}',          [ProductController::class, 'show']);
- Route::get('blog/{slug}',            [BlogController::class, 'showBySlug']);
+ Route::get('blog',                   [BlogController::class, 'index']);
- Route::post('orders',                [OrderController::class, 'store']);
+ Route::get('blog/{slug}',            [BlogController::class, 'showBySlug']);
- Route::get('status',                 fn () => response()->json(['status' => 'ok', 'timestamp' => now()]));
+ Route::post('orders',                [OrderController::class, 'store']);
- // FIX: Moved Pay Hub webhook here and added withoutMiddleware to solve "401 Unauthenticated" error.
+ Route::get('status',                 fn () => response()->json(['status' => 'ok', 'timestamp' => now()]));
- Route::post('webhooks/payhub',       [OrderController::class, 'handlePayHubWebhook'])->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, 'auth:sanctum']);
+ // FIX: Moved Pay Hub webhook here and added withoutMiddleware to solve "401 Unauthenticated" error.
- 
+ Route::post('webhooks/payhub',       [OrderController::class, 'handlePayHubWebhook'])->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, 'auth:sanctum']);
- /* ── Public Settings ── */
+ 
- Route::get('settings',              [AdminSettingController::class, 'index']);
+ /* ── Public Settings ── */
- 
+ Route::get('settings',              [AdminSettingController::class, 'index']);
- /* ── Authenticated routes ── */
+ 
- Route::middleware('auth:sanctum')->group(function () {
+ /* ── Authenticated routes ── */
- 
+ Route::middleware('auth:sanctum')->group(function () {
-     /* Products (admin POST/PUT/DELETE) */
+ 
-     Route::post('products/{id}/duplicate',    [ProductController::class, 'duplicate'])->middleware('role:admin');
+     /* Products (admin POST/PUT/DELETE) */
-     Route::post('products/bulk',              [ProductController::class, 'bulkAction'])->middleware('role:admin');
+     Route::post('products/{id}/duplicate',    [ProductController::class, 'duplicate'])->middleware('role:admin');
-     Route::apiResource('products', ProductController::class)->except(['index', 'show'])->middleware('role:admin');
+     Route::post('products/bulk',              [ProductController::class, 'bulkAction'])->middleware('role:admin');
- 
+     Route::apiResource('products', ProductController::class)->except(['index', 'show'])->middleware('role:admin');
-     /* Orders */
+ 
-     Route::get('orders',                       [OrderController::class, 'index']);
+     /* Orders */
-     Route::get('my-products',                 [OrderController::class, 'myProducts']);
+     Route::get('orders',                       [OrderController::class, 'index']);
-     Route::get('orders/{id}',                  [OrderController::class, 'show']);
+     Route::get('my-products',                 [OrderController::class, 'myProducts']);
-     Route::patch('orders/{id}/status',         [OrderController::class, 'updateStatus'])->middleware('role:admin');
+     Route::get('orders/{id}',                  [OrderController::class, 'show']);
- 
+     Route::patch('orders/{id}/status',         [OrderController::class, 'updateStatus'])->middleware('role:admin');
-     /* Wallet */
+ 
-     Route::get('wallet/balance',               [WalletController::class, 'balance']);
+     /* Wallet */
-     Route::get('wallet/transactions',          [WalletController::class, 'transactions']);
+     Route::get('wallet/balance',               [WalletController::class, 'balance']);
-     Route::post('wallet/top-up',               [WalletController::class, 'topUp']);
+     Route::get('wallet/transactions',          [WalletController::class, 'transactions']);
-     Route::post('wallet/spend',                [WalletController::class, 'spend']);
+     Route::post('wallet/top-up',               [WalletController::class, 'topUp']);
- 
+     Route::post('wallet/spend',                [WalletController::class, 'spend']);
-     /* Tickets */
+ 
-     Route::get('tickets',                      [TicketController::class, 'index']);
+     /* Tickets */
-     Route::post('tickets',                     [TicketController::class, 'store']);
+     Route::get('tickets',                      [TicketController::class, 'index']);
-     Route::get('tickets/{id}',                 [TicketController::class, 'show']);
+     Route::post('tickets',                     [TicketController::class, 'store']);
-     Route::post('tickets/{id}/reply',          [TicketController::class, 'reply']);
+     Route::get('tickets/{id}',                 [TicketController::class, 'show']);
-     Route::post('tickets/{id}/close',          [TicketController::class, 'close']);
+     Route::post('tickets/{id}/reply',          [TicketController::class, 'reply']);
-     Route::post('tickets/{id}/reopen',         [TicketController::class, 'reopen']);
+     Route::post('tickets/{id}/close',          [TicketController::class, 'close']);
- 
+     Route::post('tickets/{id}/reopen',         [TicketController::class, 'reopen']);
-     /* Referrals */
+ 
-     Route::get('referrals',                    [ReferralController::class, 'index']);
+     /* Referrals */
-     Route::get('referrals/stats',              [ReferralController::class, 'stats']);
+     Route::get('referrals',                    [ReferralController::class, 'index']);
- 
+     Route::get('referrals/stats',              [ReferralController::class, 'stats']);
-     /* Notifications */
+ 
-     Route::get('notifications',                [NotificationController::class, 'index']);
+     /* Notifications */
-     Route::patch('notifications/{id}/read',    [NotificationController::class, 'markRead']);
+     Route::get('notifications',                [NotificationController::class, 'index']);
-     Route::post('notifications/read-all',      [NotificationController::class, 'markAllRead']);
+     Route::patch('notifications/{id}/read',    [NotificationController::class, 'markRead']);
-     Route::get('notifications/preferences',    [NotificationController::class, 'preferences']);
+     Route::post('notifications/read-all',      [NotificationController::class, 'markAllRead']);
-     Route::put('notifications/preferences',    [NotificationController::class, 'updatePreferences']);
+     Route::get('notifications/preferences',    [NotificationController::class, 'preferences']);
- 
+     Route::put('notifications/preferences',    [NotificationController::class, 'updatePreferences']);
-     /* File uploads */
+ 
-     Route::post('uploads',                     [UploadController::class, 'store'])->middleware('role:admin');
+     /* File uploads */
- 
+     Route::post('uploads',                     [UploadController::class, 'store'])->middleware('role:admin');
-     /* Pricing rules */
+ 
-     Route::apiResource('pricing-rules', PricingRuleController::class)->middleware('role:admin');
+     /* Pricing rules */
- 
+     Route::apiResource('pricing-rules', PricingRuleController::class)->middleware('role:admin');
-     /* ── Admin routes ── */
+ 
-     Route::middleware('role:admin')->prefix('admin')->group(function () {
+     /* ── Admin routes ── */
- 
+     Route::middleware('role:admin')->prefix('admin')->group(function () {
-         /* Dashboard */
+ 
-         Route::get('dashboard',                [CustomerController::class, 'adminDashboard']);
+         /* Dashboard */
- 
+         Route::get('dashboard',                [CustomerController::class, 'adminDashboard']);
-         /* Customers */
+ 
-         Route::get('customers',                [CustomerController::class, 'index']);
+         /* Customers */
-         Route::get('customers/{id}',           [CustomerController::class, 'show']);
+         Route::get('customers',                [CustomerController::class, 'index']);
-         Route::patch('customers/{id}',         [CustomerController::class, 'update']);
+         Route::get('customers/{id}',           [CustomerController::class, 'show']);
-         Route::delete('customers/{id}',        [CustomerController::class, 'destroy']);
+         Route::patch('customers/{id}',         [CustomerController::class, 'update']);
-         Route::post('customers/{id}/suspend',  [CustomerController::class, 'suspend']);
+         Route::delete('customers/{id}',        [CustomerController::class, 'destroy']);
-         Route::post('customers/{id}/activate', [CustomerController::class, 'activate']);
+         Route::post('customers/{id}/suspend',  [CustomerController::class, 'suspend']);
-         Route::get('customers/{id}/orders',    [CustomerController::class, 'orders']);
+         Route::post('customers/{id}/activate', [CustomerController::class, 'activate']);
-         Route::get('customers/{id}/wallet',    [CustomerController::class, 'wallet']);
+         Route::get('customers/{id}/orders',    [CustomerController::class, 'orders']);
-         Route::post('customers/{id}/wallet/adjust', [CustomerController::class, 'adjustWallet']);
+         Route::get('customers/{id}/wallet',    [CustomerController::class, 'wallet']);
- 
+         Route::post('customers/{id}/wallet/adjust', [CustomerController::class, 'adjustWallet']);
-         /* Blog */
+ 
-         Route::post('blog',                    [BlogController::class, 'store']);
+         /* Blog */
-         Route::put('blog/{id}',                [BlogController::class, 'update']);
+         Route::post('blog',                    [BlogController::class, 'store']);
-         Route::delete('blog/{id}',             [BlogController::class, 'destroy']);
+         Route::put('blog/{id}',                [BlogController::class, 'update']);
-         Route::post('blog/{id}/publish',       [BlogController::class, 'publish']);
+         Route::delete('blog/{id}',             [BlogController::class, 'destroy']);
-         Route::post('blog/{id}/schedule',      [BlogController::class, 'schedule']);
+         Route::post('blog/{id}/publish',       [BlogController::class, 'publish']);
-         Route::post('blog/{id}/submit-review', [BlogController::class, 'submitForReview']);
+         Route::post('blog/{id}/schedule',      [BlogController::class, 'schedule']);
-         Route::post('blog/{id}/approve',       [BlogController::class, 'approve']);
+         Route::post('blog/{id}/submit-review', [BlogController::class, 'submitForReview']);
- 
+         Route::post('blog/{id}/approve',       [BlogController::class, 'approve']);
-         /* Automation */
+ 
-         Route::prefix('automation')->group(function () {
+         /* Automation */
-             Route::get('modules',               [AutomationController::class, 'modules']);
+         Route::prefix('automation')->group(function () {
-             Route::put('modules/{id}/toggle',    [AutomationController::class, 'toggleModule']);
+             Route::get('modules',               [AutomationController::class, 'modules']);
-             
+             Route::put('modules/{id}/toggle',    [AutomationController::class, 'toggleModule']);
-             Route::prefix('random-post')->group(function () {
+             
-                 Route::get('config',            [AutomationController::class, 'getRandomPostConfig']);
+             Route::prefix('random-post')->group(function () {
-                 Route::put('config',            [AutomationController::class, 'updateRandomPostConfig']);
+                 Route::get('config',            [AutomationController::class, 'getRandomPostConfig']);
-                 Route::post('toggle',           [AutomationController::class, 'togglePause']);
+                 Route::put('config',            [AutomationController::class, 'updateRandomPostConfig']);
-                 Route::get('health',            [AutomationController::class, 'getHealth']);
+                 Route::post('toggle',           [AutomationController::class, 'togglePause']);
-                 Route::get('jobs',              [AutomationController::class, 'jobs']);
+                 Route::get('health',            [AutomationController::class, 'getHealth']);
-                 Route::post('test',             [AutomationController::class, 'testRun']);
+                 Route::get('jobs',              [AutomationController::class, 'jobs']);
-                 Route::post('jobs/{id}/retry',  [AutomationController::class, 'retryJob']);
+                 Route::post('test',             [AutomationController::class, 'testRun']);
-             });
+                 Route::post('jobs/{id}/retry',  [AutomationController::class, 'retryJob']);
- 
+             });
-             Route::prefix('featured-rotation')->group(function () {
+ 
-                 Route::get('config',            [AutomationController::class, 'getFeaturedConfig']);
+             Route::prefix('featured-rotation')->group(function () {
-                 Route::put('config',            [AutomationController::class, 'updateFeaturedConfig']);
+                 Route::get('config',            [AutomationController::class, 'getFeaturedConfig']);
-                 Route::post('trigger',          [AutomationController::class, 'triggerFeaturedRotation']);
+                 Route::put('config',            [AutomationController::class, 'updateFeaturedConfig']);
-             });
+                 Route::post('trigger',          [AutomationController::class, 'triggerFeaturedRotation']);
- 
+             });
-             Route::prefix('stock-suppression')->group(function () {
+ 
-                 Route::get('config',            [AutomationController::class, 'getStockConfig']);
+             Route::prefix('stock-suppression')->group(function () {
-                 Route::put('config',            [AutomationController::class, 'updateStockConfig']);
+                 Route::get('config',            [AutomationController::class, 'getStockConfig']);
-             });
+                 Route::put('config',            [AutomationController::class, 'updateStockConfig']);
- 
+             });
-             Route::prefix('import-queue')->group(function () {
+ 
-                 Route::get('/',                 [AutomationController::class, 'getImportQueue']);
+             Route::prefix('import-queue')->group(function () {
-                 Route::post('{id}/approve',     [AutomationController::class, 'approveImport']);
+                 Route::get('/',                 [AutomationController::class, 'getImportQueue']);
-                 Route::post('{id}/reject',      [AutomationController::class, 'rejectImport']);
+                 Route::post('{id}/approve',     [AutomationController::class, 'approveImport']);
-             });
+                 Route::post('{id}/reject',      [AutomationController::class, 'rejectImport']);
- 
+             });
-             Route::get('reseller/markup-preview', [AutomationController::class, 'getMarkupPreview']);
+ 
-             
+             Route::get('reseller/markup-preview', [AutomationController::class, 'getMarkupPreview']);
-             /* Legacy Rules */
+             
-             Route::get('rules',                 [AutomationController::class, 'rules']);
+             /* Legacy Rules */
-             Route::post('rules',                [AutomationController::class, 'createRule']);
+             Route::get('rules',                 [AutomationController::class, 'rules']);
-             Route::put('rules/{id}',            [AutomationController::class, 'updateRule']);
+             Route::post('rules',                [AutomationController::class, 'createRule']);
-             Route::delete('rules/{id}',         [AutomationController::class, 'deleteRule']);
+             Route::put('rules/{id}',            [AutomationController::class, 'updateRule']);
-         });
+             Route::delete('rules/{id}',         [AutomationController::class, 'deleteRule']);
- 
+         });
-         /* Integrations */
+ 
-         Route::get('integrations',             [IntegrationController::class, 'index']);
+         /* Integrations */
-         Route::post('integrations/{id}/connect',    [IntegrationController::class, 'connect']);
+         Route::get('integrations',             [IntegrationController::class, 'index']);
-         Route::post('integrations/{id}/disconnect', [IntegrationController::class, 'disconnect']);
+         Route::post('integrations/{id}/connect',    [IntegrationController::class, 'connect']);
-         Route::post('integrations/{id}/test',       [IntegrationController::class, 'test']);
+         Route::post('integrations/{id}/disconnect', [IntegrationController::class, 'disconnect']);
- 
+         Route::post('integrations/{id}/test',       [IntegrationController::class, 'test']);
-         /* Telegram */
+ 
-         Route::get('telegram/config',          [TelegramController::class, 'getConfig']);
+         /* Telegram */
-         Route::put('telegram/config',          [TelegramController::class, 'updateConfig']);
+         Route::get('telegram/config',          [TelegramController::class, 'getConfig']);
-         Route::get('telegram/commands',        [TelegramController::class, 'commands']);
+         Route::put('telegram/config',          [TelegramController::class, 'updateConfig']);
-         Route::put('telegram/commands',        [TelegramController::class, 'updateCommands']);
+         Route::get('telegram/commands',        [TelegramController::class, 'commands']);
-         Route::get('telegram/permissions',     [TelegramController::class, 'permissions']);
+         Route::put('telegram/commands',        [TelegramController::class, 'updateCommands']);
-         Route::put('telegram/permissions',     [TelegramController::class, 'updatePermissions']);
+         Route::get('telegram/permissions',     [TelegramController::class, 'permissions']);
-         Route::get('telegram/posts',           [TelegramController::class, 'postHistory']);
+         Route::put('telegram/permissions',     [TelegramController::class, 'updatePermissions']);
-         Route::post('telegram/push',           [TelegramController::class, 'push']);
+         Route::get('telegram/posts',           [TelegramController::class, 'postHistory']);
- 
+         Route::post('telegram/push',           [TelegramController::class, 'push']);
-         /* Discord */
+ 
-         Route::get('discord/config',           [DiscordController::class, 'getConfig']);
+         /* Discord */
-         Route::put('discord/config',           [DiscordController::class, 'updateConfig']);
+         Route::get('discord/config',           [DiscordController::class, 'getConfig']);
-         Route::get('discord/commands',         [DiscordController::class, 'commands']);
+         Route::put('discord/config',           [DiscordController::class, 'updateConfig']);
-         Route::put('discord/commands',         [DiscordController::class, 'updateCommands']);
+         Route::get('discord/commands',         [DiscordController::class, 'commands']);
-         Route::get('discord/permissions',      [DiscordController::class, 'permissions']);
+         Route::put('discord/commands',         [DiscordController::class, 'updateCommands']);
-         Route::put('discord/permissions',      [DiscordController::class, 'updatePermissions']);
+         Route::get('discord/permissions',      [DiscordController::class, 'permissions']);
-         Route::get('discord/posts',            [DiscordController::class, 'postHistory']);
+         Route::put('discord/permissions',      [DiscordController::class, 'updatePermissions']);
-         Route::post('discord/push',            [DiscordController::class, 'push']);
+         Route::get('discord/posts',            [DiscordController::class, 'postHistory']);
-         Route::get('discord/alerts',           [DiscordController::class, 'alerts']);
+         Route::post('discord/push',            [DiscordController::class, 'push']);
-         Route::put('discord/alerts',           [DiscordController::class, 'updateAlerts']);
+         Route::get('discord/alerts',           [DiscordController::class, 'alerts']);
- 
+         Route::put('discord/alerts',           [DiscordController::class, 'updateAlerts']);
-         /* Pinterest */
+ 
-         Route::get('pinterest/config',         [PinterestController::class, 'getConfig']);
+         /* Pinterest */
-         Route::put('pinterest/config',         [PinterestController::class, 'updateConfig']);
+         Route::get('pinterest/config',         [PinterestController::class, 'getConfig']);
-         Route::get('pinterest/auth-url',       [PinterestController::class, 'getAuthUrl']);
+         Route::put('pinterest/config',         [PinterestController::class, 'updateConfig']);
-         Route::get('pinterest/callback',       [PinterestController::class, 'handleCallback']);
+         Route::get('pinterest/auth-url',       [PinterestController::class, 'getAuthUrl']);
-         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
+         Route::get('pinterest/callback',       [PinterestController::class, 'handleCallback']);
-         Route::post('pinterest/test',          [PinterestController::class, 'testConnection']);
+         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
- 
+         Route::post('pinterest/test',          [PinterestController::class, 'testConnection']);
-         /* Channel Sync (Frontend expected: /api/sync/...) */
+ 
-         Route::prefix('sync')->group(function () {
+         /* Channel Sync (Frontend expected: /api/sync/...) */
-             Route::get('dashboard',     [ChannelSyncController::class, 'dashboard']);
+         Route::prefix('sync')->group(function () {
-             Route::get('statuses',      [ChannelSyncController::class, 'statuses']);
+             Route::get('dashboard',     [ChannelSyncController::class, 'dashboard']);
-             Route::get('queue',         [ChannelSyncController::class, 'queue']);
+             Route::get('statuses',      [ChannelSyncController::class, 'statuses']);
-             Route::get('failed',        [ChannelSyncController::class, 'failedJobs']);
+             Route::get('queue',         [ChannelSyncController::class, 'queue']);
-             Route::post('retry/{id}',   [ChannelSyncController::class, 'retry']);
+             Route::get('failed',        [ChannelSyncController::class, 'failedJobs']);
-             Route::get('health',        [ChannelSyncController::class, 'health']);
+             Route::post('retry/{id}',   [ChannelSyncController::class, 'retry']);
-             Route::get('conflicts',     [ChannelSyncController::class, 'conflicts']);
+             Route::get('health',        [ChannelSyncController::class, 'health']);
-             Route::post('resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
+             Route::get('conflicts',     [ChannelSyncController::class, 'conflicts']);
-         });
+             Route::post('resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
- 
+         });
-         Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
+ 
-         Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
+         Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
-         Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
+         Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
-         Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
+         Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
-         Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
+         Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
-         Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
+         Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
-         Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
+         Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
- 
+         Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
-         /* Pricing & Sync */
+ 
-         Route::prefix('pricing')->group(function () {
+         /* Pricing & Sync */
-             Route::get('settings',             [PricingSyncController::class, 'settings']);
+         Route::prefix('pricing')->group(function () {
-             Route::put('settings',             [PricingSyncController::class, 'updateSettings']);
+             Route::get('settings',             [PricingSyncController::class, 'settings']);
-             Route::get('conflicts',            [PricingSyncController::class, 'conflicts']);
+             Route::put('settings',             [PricingSyncController::class, 'updateSettings']);
-             Route::post('conflicts/{id}/resolve', [PricingSyncController::class, 'resolve']);
+             Route::get('conflicts',            [PricingSyncController::class, 'conflicts']);
-             Route::get('audit-log',            [PricingSyncController::class, 'auditLog']);
+             Route::post('conflicts/{id}/resolve', [PricingSyncController::class, 'resolve']);
-             Route::post('approve/{id}',        [PricingSyncController::class, 'approve']);
+             Route::get('audit-log',            [PricingSyncController::class, 'auditLog']);
-             Route::post('reject/{id}',         [PricingSyncController::class, 'reject']);
+             Route::post('approve/{id}',        [PricingSyncController::class, 'approve']);
-         });
+             Route::post('reject/{id}',         [PricingSyncController::class, 'reject']);
-         Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
+         });
- 
+         Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
-         /* Sync Logs */
+ 
-         Route::get('sync-logs',                [SyncLogController::class, 'index']);
+         /* Sync Logs */
-         Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);
+         Route::get('sync-logs',                [SyncLogController::class, 'index']);
- 
+         Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);
-         /* Audit Logs */
+ 
-         Route::get('audit-logs',               [AuditLogController::class, 'index']);
+         /* Audit Logs */
-         Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);
+         Route::get('audit-logs',               [AuditLogController::class, 'index']);
- 
+         Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);
-         /* Compliance */
+ 
-         Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
+         /* Compliance */
-         Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
+         Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
-         Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
+         Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
-         Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
+         Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
-         Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);
+         Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
- 
+         Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);
-         /* Supplier Import (Aligned with frontend) */
+ 
-         Route::get('suppliers',                   [SupplierImportController::class, 'connections']);
+         /* Supplier Import (Aligned with frontend) */
-         Route::post('suppliers/{id}/sync',          [SupplierImportController::class, 'fetchProducts']);
+         Route::get('suppliers',                   [SupplierImportController::class, 'connections']);
-         Route::get('suppliers/{id}/products',       [SupplierImportController::class, 'products']);
+         Route::post('suppliers/{id}/sync',          [SupplierImportController::class, 'fetchProducts']);
-         Route::get('suppliers/{id}/duplicates',     [SupplierImportController::class, 'duplicates']);
+         Route::get('suppliers/{id}/products',       [SupplierImportController::class, 'products']);
-         Route::post('suppliers/import',            [SupplierImportController::class, 'import']);
+         Route::get('suppliers/{id}/duplicates',     [SupplierImportController::class, 'duplicates']);
-         Route::get('suppliers/import-jobs',        [SupplierImportController::class, 'jobs']);
+         Route::post('suppliers/import',            [SupplierImportController::class, 'import']);
-         Route::post('suppliers/import-jobs/{id}/retry', [SupplierImportController::class, 'retryJob']);
+         Route::get('suppliers/import-jobs',        [SupplierImportController::class, 'jobs']);
-         
+         Route::post('suppliers/import-jobs/{id}/retry', [SupplierImportController::class, 'retryJob']);
-         /* Supplier Sync */
+         
-         Route::prefix('supplier-sync')->group(function () {
+         /* Supplier Sync */
-             Route::get('mappings',         [SupplierSyncController::class, 'index']);
+         Route::prefix('supplier-sync')->group(function () {
-             Route::patch('mappings/{id}',  [SupplierSyncController::class, 'update']);
+             Route::get('mappings',         [SupplierSyncController::class, 'index']);
-             Route::post('mappings/{id}/sync', [SupplierSyncController::class, 'sync']);
+             Route::patch('mappings/{id}',  [SupplierSyncController::class, 'update']);
-             Route::post('sync-all',        [SupplierSyncController::class, 'syncAll']);
+             Route::post('mappings/{id}/sync', [SupplierSyncController::class, 'sync']);
-             Route::get('logs',             [SupplierSyncController::class, 'logs']);
+             Route::post('sync-all',        [SupplierSyncController::class, 'syncAll']);
-             Route::get('balances',         [SupplierSyncController::class, 'balances']);
+             Route::get('logs',             [SupplierSyncController::class, 'logs']);
-             Route::post('orders/{id}/retry-fulfillment', [SupplierSyncController::class, 'retryFulfillment']);
+             Route::get('balances',         [SupplierSyncController::class, 'balances']);
-         });
+             Route::post('orders/{id}/retry-fulfillment', [SupplierSyncController::class, 'retryFulfillment']);
- 
+         });
-         /* Admin Settings */
+ 
-         Route::get('settings',                 [AdminSettingController::class, 'index']);
+         /* Admin Settings */
-         Route::put('settings',                 [AdminSettingController::class, 'update']);
+         Route::get('settings',                 [AdminSettingController::class, 'index']);
- 
+         Route::put('settings',                 [AdminSettingController::class, 'update']);
-         /* AI Blog Automation */
+ 
-         Route::prefix('blog-automation')->group(function () {
+         /* AI Blog Automation */
-             Route::get('config',               [AdminBlogAutomationController::class, 'show']);
+         Route::prefix('blog-automation')->group(function () {
-             Route::put('config',               [AdminBlogAutomationController::class, 'update']);
+             Route::get('config',               [AdminBlogAutomationController::class, 'show']);
-             
+             Route::put('config',               [AdminBlogAutomationController::class, 'update']);
-             Route::get('telegram',             [AdminBlogAutomationController::class, 'getTelegramConfig']);
+             
-             Route::put('telegram',             [AdminBlogAutomationController::class, 'updateTelegramConfig']);
+             Route::get('telegram',             [AdminBlogAutomationController::class, 'getTelegramConfig']);
-             Route::post('telegram/test',       [AdminBlogAutomationController::class, 'testTelegram']);
+             Route::put('telegram',             [AdminBlogAutomationController::class, 'updateTelegramConfig']);
- 
+             Route::post('telegram/test',       [AdminBlogAutomationController::class, 'testTelegram']);
-             Route::get('pinterest',            [AdminBlogAutomationController::class, 'getPinterestConfig']);
+ 
-             Route::put('pinterest',            [AdminBlogAutomationController::class, 'updatePinterestConfig']);
+             Route::get('pinterest',            [AdminBlogAutomationController::class, 'getPinterestConfig']);
-             Route::post('pinterest/test',      [AdminBlogAutomationController::class, 'testPinterest']);
+             Route::put('pinterest',            [AdminBlogAutomationController::class, 'updatePinterestConfig']);
- 
+             Route::post('pinterest/test',      [AdminBlogAutomationController::class, 'testPinterest']);
-             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
+ 
-             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
+             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
-             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
+             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
-             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
+             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
-             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
+             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
-             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
+             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
-             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
+             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
-             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
+             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
-             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
+             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
-         });
+             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
- 
+         });
-         /* Products (Admin Aliases) */
+ 
-         Route::get('products',                [ProductController::class, 'index']);
+         /* Products (Admin Aliases) */
-         Route::get('products/{id}',           [ProductController::class, 'show']);
+         Route::get('products',                [ProductController::class, 'index']);
-         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
+         Route::get('products/{id}',           [ProductController::class, 'show']);
-         Route::post('products',               [ProductController::class, 'store']);
+         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
-         Route::put('products/{id}',           [ProductController::class, 'update']);
+         Route::post('products',               [ProductController::class, 'store']);
-         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
+         Route::put('products/{id}',           [ProductController::class, 'update']);
-         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
+         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
-         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
+         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
- 
+         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
-         /* Categories (Admin Aliases) */
+ 
-         Route::get('categories',              [CategoryController::class, 'index']);
+         /* Categories (Admin Aliases) */
-         Route::get('categories/{id}',         [CategoryController::class, 'show']);
+         Route::get('categories',              [CategoryController::class, 'index']);
-         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
+         Route::get('categories/{id}',         [CategoryController::class, 'show']);
-         Route::post('categories',             [CategoryController::class, 'store']);
+         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
-         Route::put('categories/{id}',         [CategoryController::class, 'update']);
+         Route::post('categories',             [CategoryController::class, 'store']);
-         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
+         Route::put('categories/{id}',         [CategoryController::class, 'update']);
- 
+         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
-         /* Orders (Admin Aliases) */
+ 
-         Route::get('orders',                  [OrderController::class, 'index']);
+         /* Orders (Admin Aliases) */
-         Route::get('orders/{id}',             [OrderController::class, 'show']);
+         Route::get('orders',                  [OrderController::class, 'index']);
-         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
+         Route::get('orders/{id}',             [OrderController::class, 'show']);
- 
+         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
-         /* Tickets (Admin Aliases) */
+ 
-         Route::get('tickets',                 [TicketController::class, 'index']);
+         /* Tickets (Admin Aliases) */
-         Route::get('tickets/{id}',            [TicketController::class, 'show']);
+         Route::get('tickets',                 [TicketController::class, 'index']);
-         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
+         Route::get('tickets/{id}',            [TicketController::class, 'show']);
-         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
+         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
-         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
+         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
-     });
+         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
- });
+     });
- 
+ });
+ 
- **[what-changed] Updated API endpoint Route**: -             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
+             Route::get('pinterest',            [AdminBlogAutomationController::class, 'getPinterestConfig']);
-             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
+             Route::put('pinterest',            [AdminBlogAutomationController::class, 'updatePinterestConfig']);
-             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
+             Route::post('pinterest/test',      [AdminBlogAutomationController::class, 'testPinterest']);
-             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
+ 
-             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
+             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
-             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
+             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
-             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
+             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
-             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
+             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
-         });
+             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
- 
+             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
-         /* Products (Admin Aliases) */
+             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
-         Route::get('products',                [ProductController::class, 'index']);
+             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
-         Route::get('products/{id}',           [ProductController::class, 'show']);
+             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
-         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
+         });
-         Route::post('products',               [ProductController::class, 'store']);
+ 
-         Route::put('products/{id}',           [ProductController::class, 'update']);
+         /* Products (Admin Aliases) */
-         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
+         Route::get('products',                [ProductController::class, 'index']);
-         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
+         Route::get('products/{id}',           [ProductController::class, 'show']);
-         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
+         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
- 
+         Route::post('products',               [ProductController::class, 'store']);
-         /* Categories (Admin Aliases) */
+         Route::put('products/{id}',           [ProductController::class, 'update']);
-         Route::get('categories',              [CategoryController::class, 'index']);
+         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
-         Route::get('categories/{id}',         [CategoryController::class, 'show']);
+         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
-         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
+         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
-         Route::post('categories',             [CategoryController::class, 'store']);
+ 
-         Route::put('categories/{id}',         [CategoryController::class, 'update']);
+         /* Categories (Admin Aliases) */
-         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
+         Route::get('categories',              [CategoryController::class, 'index']);
- 
+         Route::get('categories/{id}',         [CategoryController::class, 'show']);
-         /* Orders (Admin Aliases) */
+         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
-         Route::get('orders',                  [OrderController::class, 'index']);
+         Route::post('categories',             [CategoryController::class, 'store']);
-         Route::get('orders/{id}',             [OrderController::class, 'show']);
+         Route::put('categories/{id}',         [CategoryController::class, 'update']);
-         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
+         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
-         /* Tickets (Admin Aliases) */
+         /* Orders (Admin Aliases) */
-         Route::get('tickets',                 [TicketController::class, 'index']);
+         Route::get('orders',                  [OrderController::class, 'index']);
-         Route::get('tickets/{id}',            [TicketController::class, 'show']);
+         Route::get('orders/{id}',             [OrderController::class, 'show']);
-         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
+         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
-         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
+ 
-         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
+         /* Tickets (Admin Aliases) */
-     });
+         Route::get('tickets',                 [TicketController::class, 'index']);
- });
+         Route::get('tickets/{id}',            [TicketController::class, 'show']);
- 
+         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
+         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
+         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
+     });
+ });
+ 
- **[what-changed] Replaced auth Services — prevents null/undefined runtime crashes**: - use App\Services\TelegramService;
+ use App\Services\PinterestService;
- use Illuminate\Http\Request;
+ use Illuminate\Support\Facades\Cache;
- use Illuminate\Http\JsonResponse;
+ use Illuminate\Support\Facades\Log;
- use Illuminate\Support\Facades\Cache;
+ 
- 
+ class AdminBlogAutomationController extends Controller
- class AdminBlogAutomationController extends Controller
+ {
- {
+     public function show(): JsonResponse
-     public function show(): JsonResponse
+     {
-     {
+         $config = BlogAutomationConfig::firstOrCreate([], [
-         $config = BlogAutomationConfig::firstOrCreate([], [
+             'posts_per_day' => 1,
-             'posts_per_day' => 1,
+             'mode' => 'draft',
-             'mode' => 'draft',
+             'default_tone' => 'professional',
-             'default_tone' => 'professional',
+             'model_text' => 'gemini-2.5-flash',
-             'model_text' => 'gemini-2.5-flash',
+             'model_image' => 'gemini-3.1-flash-image-preview',
-             'model_image' => 'gemini-3.1-flash-image-preview',
+             'is_enabled' => false,
-             'is_enabled' => false,
+         ]);
-         ]);
+ 
- 
+         return response()->json(['data' => $config]);
-         return response()->json(['data' => $config]);
+     }
-     }
+ 
- 
+     public function update(Request $request): JsonResponse
-     public function update(Request $request): JsonResponse
+     {
-     {
+         $config = BlogAutomationConfig::first();
-         $config = BlogAutomationConfig::first();
+ 
- 
+         $data = $request->validate([
-         $data = $request->validate([
+             'posts_per_day' => 'sometimes|integer|min:1|max:24',
-             'posts_per_day' => 'sometimes|integer|min:1|max:24',
+             'mode'          => 'sometimes|in:auto,draft',
-             'mode'          => 'sometimes|in:auto,draft',
+             'default_tone'  => 'sometimes|string|max:255',
-             'default_tone'  => 'sometimes|string|max:255',
+             'model_text'    => 'sometimes|string|max:255',
-             'model_text'    => 'sometimes|string|max:255',
+             'model_image'   => 'sometimes|string|max:255',
-             'model_image'   => 'sometimes|string|max:255',
+             'is_enabled'    => 'sometimes|boolean',
-             'is_enabled'    => 'sometimes|boolean',
+         ]);
-         ]);
+ 
- 
+         if ($config) {
-         if ($config) {
+             $config->update($data);
-             $config->update($data);
+         } else {
-         } else {
+             $config = BlogAutomationConfig::create($data);
-             $config = BlogAutomationConfig::create($data);
+         }
-         }
+ 
- 
+         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
-         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
+     }
-     }
+ 
- 
+     public function trigger()
-     public function trigger()
+     {
-     {
+         // Increase time limit for this request (AI takes ~60s)
-         // Increase time limit for this request (AI takes ~60s)
+         set_time_limit(0);
-         set_time_limit(0);
+         ignore_user_abort(true);
-         ignore_user_abort(true);
+ 
- 
+         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
-         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
+         $keyword = BlogKeyword::where('status', 'active')
-         $keyword = BlogKeyword::where('status', 'active')
+             ->orderBy('last_used_at', 'asc')
-             ->orderBy('last_used_at', 'asc')
+             ->first();
-             ->first();
+ 
- 
+         if (!$keyword) {
-         if (!$keyword) {
+             return response()->json(['message' => 'No active keywords found.'], 400);
-             return response()->json(['message' => 'No active keywords found.'], 400);
+         }
-         }
+ 
- 
+         // Update usage tracking BEFORE dispatch to prevent race conditions
-         // Update usage tracking BEFORE dispatch to prevent race conditions
+         $keyword->update([
-         $keyword->update([
+             'last_used_at' => now(),
-             'last_used_at' => now(),
+             'usage_count' => ($keyword->usage_count ?? 0) + 1
-             'usage_count' => ($keyword->usage_count ?? 0) + 1
+         ]);
-         ]);
+ 
- 
+         // Set initial status
-         // Set initial status
+         Cache::put('ai_blog_generation_status', [
-         Cache::put('ai_blog_generation_status', [
+             'active' => true,
-             'active' => true,
+             'message' => 'Engine Warming Up...',
-             'message' => 'Engine Warming Up...',
+             'percentage' => 5,
-             'percentage' => 5,
+             'last_updated' => now()->toISOString()
-             'last_updated' => now()->toISOString()
+         ], 300);
-         ], 300);
+ 
- 
+         // Run it IMMEDIATELY for manual clicks
-         // Run it IMMEDIATELY for manual clicks
+         // dispatchSync will run it in the current request
-         // dispatchSync will run it in the current request
+         GenerateAIBlogJob::dispatchSync($keyword);
-         GenerateAIBlogJob::dispatchSync($keyword);
+ 
- 
+         return response()->json(['message' => 'AI Blog Generation completed.']);
-         return response()->json(['message' => 'AI Blog Generation completed.']);
+     }
-     }
+ 
- 
+     public function status()
-     public function status()
+     {
-     {
+         $status = Cache::get('ai_blog_generation_status', [
-         $status = Cache::get('ai_blog_generation_status', [
+             'active' => false,
-             'active' => false,
+             'message' => 'Idle',
-             'message' => 'Idle',
+             'percentage' => 0
-             'percentage' => 0
+         ]);
-         ]);
+ 
- 
+         return response()->json($status);
-         return response()->json($status);
+     }
-     }
+ 
- 
+     public function getTelegramConfig(): JsonResponse
-     public function getTelegramConfig(): JsonResponse
+     {
-     {
+         return response()->json([
-         return response()->json([
+             'data' => [
-             'data' => [
+                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
-                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
+                 'token'   => Setting::getValue('telegram_bot_token', ''),
-                 'token'   => Setting::getValue('telegram_bot_token', ''),
+                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
-                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
+             ]
-             ]
+         ]);
-         ]);
+     }
-     }
+ 
- 
+     public function updateTelegramConfig(Request $request): JsonResponse
-     public function updateTelegramConfig(Request $request): JsonResponse
+     {
-     {
+         $request->validate([
-         $request->validate([
+             'enabled' => 'required|boolean',
-             'enabled' => 'required|boolean',
+             'token'   => 'nullable|string',
-             'token'   => 'nullable|string',
+             'channel_id' => 'nullable|string',
-             'channel_id' => 'nullable|string',
+         ]);
-         ]);
+ 
- 
+         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
-         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
+         Setting::setValue('telegram_bot_token', $request->token);
-         Setting::setValue('telegram_bot_token', $request->token);
+         Setting::setValue('telegram_channel_id', $request->channel_id);
-         Setting::setValue('telegram_channel_id', $request->channel_id);
+ 
- 
+         return response()->json(['message' => 'Telegram configuration updated.']);
-         return response()->json(['message' => 'Telegram configuration updated.']);
+     }
-     }
+ 
- 
+     public function testTelegram(Request $request): JsonResponse
-     public function testTelegram(Request $request): JsonResponse
+     {
-     {
+         $service = new TelegramService();
-         $service = new TelegramService();
+         $result = $service->sendTestMessage();
-         $result = $service->sendTestMessage();
+ 
- 
+         if (isset($result['ok']) && $result['ok']) {
-         if (isset($result['ok']) && $result['ok']) {
+             return response()->json(['message' => 'Test message sent successfully!']);
-             return response()->json(['message' => 'Test message sent successfully!']);
+         }
-         }
+ 
- 
+         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
-         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
+         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
-         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
+ 
- 
+         return response()->json([
-         return response()->json([
+             'message' => 'Telegram Test Failed: ' . $error,
-             'message' => 'Telegram Test Failed: ' . $error,
+             'details' => $result
-             'details' => $result
+         ], 400);
-         ], 400);
+     }
-     }
+ 
- 
+     public function sendPostToTelegram(int $id): JsonResponse
-     public function sendPostToTelegram(int $id): JsonResponse
+     {
-     {
+         $post = \App\Models\BlogPost::findOrFail($id);
-         $post = \App\Models\BlogPost::findOrFail($id);
+         $service = new TelegramService();
-         $service = new TelegramService();
+         $success = $service->sendBlogPost($post);
-         $success = $service->sendBlogPost($post);
+ 
- 
+         if ($success) {
-         if ($success) {
+             return response()->json(['message' => 'Blog post sent to Telegram!']);
-             return response()->json(['message' => 'Blog post sent to Telegram!']);
+         }
-         }
+ 
- 
+         return response()->json([
-         return response()->json([
+             'message' => 'Failed to send to Telegram. Check automation logs.',
-             'message' => 'Failed to send to Telegram. Check automation logs.',
+         ], 400);
-         ], 400);
+     }
-     }
+ 
- }
+     public function getPinterestConfig(): JsonResponse
- 
+     {
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         $data = $config->config ?? [];
+         
+         return response()->json([
+             'data' => [
+                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
+                 'connected' => $config->status === 'active',
+                 'selected_board_id' => $data['board_id'] ?? null,
+                 'boards' => $config->boards ?? []
+             ]
+         ]);
+     }
+ 
+     public function updatePinterestConfig(Request $request): JsonResponse
+     {
+         $request->validate([
+             'enabled' => 'required|boolean',
+             'board_id' => 'nullable|string',
+         ]);
+ 
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         $current = $config->config ?? [];
+         $current['auto_post_enabled'] = $request->enabled;
+         if ($request->has('board_id')) {
+             $current['board_id'] = $request->board_id;
+         }
+ 
+         $config->update(['config' => $current]);
+ 
+         return response()->json(['message' => 'Pinterest configuration updated.']);
+     }
+ 
+     public function testPinterest(): JsonResponse
+     {
+         $service = new PinterestService();
+         $boards = $service->getBoards();
+ 
+         if (!empty($boards)) {
+             return response()->json(['message' => 'Connection successful! Boards synchronized.']);
+         }
+ 
+         return response()->json([
+             'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
+         ], 400);
+     }
+ 
+     public function sendPostToPinterest(int $id): JsonResponse
+     {
+         $post = \App\Models\BlogPost::findOrFail($id);
+         $service = new PinterestService();
+         $result = $service->sendBlogPost($post);
+ 
+         if ($result && isset($result['id'])) {
+             return response()->json(['message' => 'Blog post shared on Pinterest!']);
+         }
+ 
+         return response()->json([
+             'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
+         ], 400);
+     }
+ }
+ 
- **[discovery] discovery in GenerateAIBlogJob.php**: File updated (external): api/app/Jobs/GenerateAIBlogJob.php

Content summary (98 lines):
<?php

namespace App\Jobs;

use App\Models\BlogKeyword;
use App\Models\BlogPost;
use App\Models\BlogAutomationConfig;
use App\Services\AIBloggingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class GenerateAIBlogJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queue
- **[what-changed] what-changed in PinterestController.php**: File updated (external): api/app/Http/Controllers/PinterestController.php

Content summary (125 lines):
<?php

namespace App\Http\Controllers;

use App\Models\PinterestConfig;
use App\Services\PinterestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PinterestController extends Controller
{
    protected $pinterestService;

    public function __construct(PinterestService $pinterestService)
    {
        $this->pinterestService = $pinterestService;
    }

    /**
     * Get the Pinterest configuration.
     */
    public function ge
- **[what-changed] Replaced auth Pinterest — prevents null/undefined runtime crashes**: -      * Get a valid access token (refreshes if expired).
+      * Get the Pinterest Boards for the authorized user.
-     protected function getValidAccessToken()
+     public function getBoards()
-         $accessToken = $this->getConfigValue('access_token');
+         $accessToken = $this->getValidAccessToken();
-         $expiresAt = $this->getConfigValue('expires_at');
+         if (!$accessToken) {
- 
+             return [];
-         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+         }
-             return $this->refreshAccessToken();
+ 
-         }
+         $response = Http::withToken($accessToken)
- 
+             ->get('https://api.pinterest.com/v5/boards');
-         return $accessToken;
+ 
-     }
+         if ($response->successful()) {
- 
+             $data = $response->json();
-     /* ── Helper Methods ── */
+             $this->config->update(['boards' => $data['items']]);
- 
+             return $data['items'];
-     protected function getConfigValue(string $key, $default = null)
+         }
-     {
+ 
-         $config = $this->config->config ?? [];
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
-         return $config[$key] ?? $default;
+         return [];
-     protected function updateConfig(array $newData)
+     /**
-     {
+      * Create a new Pin on Pinterest.
-         $currentConfig = $this->config->config ?? [];
+      */
-         $this->config->update([
+     public function createPin(array $data)
-             'config' => array_merge($currentConfig, $newData),
+     {
-             'status' => 'active'
+         $accessToken = $this->getValidAccessToken();
-         ]);
+         if (!$accessToken) {
-     }
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
- }
+             return null;
- 
+         }
+ 
+         $response = Http::withToken($accessToken)
+             ->post('https://api.pinterest.com/v5/pins', [
+                 'link' => $data['link'],
+                 'title' => $data['title'],
+                 'description' => $data['description'],
+                 'board_id' => $data['board_id'],
+                 'media_source' => [
+                     'source_type' => 'image_url',
+                     'url' => $data['image_url'],
+                 ],
+             ]);
+ 
+         if ($response->successful()) {
+             return $response->json();
+         }
+ 
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+         return null;
+     }
+ 
+     /**
+      * Format and send a blog post to Pinterest.
+      */
+     public function sendBlogPost(BlogPost $post)
+     {
+         $boardId = $this->getConfigValue('board_id');
+         if (!$boardId) {
+             Log::info('Pinterest: Skipping post share (No board selected).');
+             return null;
+         }
+ 
+         $websiteUrl = config('app.url');
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+         }
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+ 
+         // Pinterest requires a public image URL.
+         $imageUrl = $post->image_url;
+         if (!str_starts_with($imageUrl, 'http')) {
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+         }
+ 
+         return $this->createPin([
+             'link' => $postUrl,
+             'title' => Str::limit($post->title, 100),
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+             'board_id' => $boardId,
+             'image_url' => $imageUrl,
+         ]);
+     }
+ 
+     /**
+      * Get a valid access token (refreshes if expired).
+      */
+     protected function getValidAccessToken()
+     {
+         $accessToken = $this->getConfigValue('access_token');
+         $expiresAt = $this->getConfigValue('expires_at');
+ 
+         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+             return $this->refreshAccessToken();
+         }
+ 
+         return $accessToken;
+     }
+ 
+     /* ── Helper Methods ── */
+ 
+     protected function getConfigValue(string $key, $default = null)
+     {
+         $config = $this->config->config ?? [];
+         return $config[$key] ?? $default;
+     }
+ 
+     protected function updateConfig(array $newData)
+     {
+         $currentConfig = $this->config->config ?? [];
+         $this->config->update([
+             'config' => array_merge($currentConfig, $newData),
+             'status' => 'active'
+         ]);
+     }
+ }
+ 
- **[what-changed] what-changed in PinterestService.php**: File updated (external): api/app/Services/PinterestService.php

Content summary (142 lines):
<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\PinterestConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PinterestService
{
    protected $config;

    public function __construct()
    {
        $this->config = PinterestConfig::firstOrCreate(['id' => 1]);
    }

    /**
     * Get the Pinterest Authorization URL.
     */
    public function getAuthUrl()
    {
        $clientId = $this->getConfigValue('cl
- **[what-changed] Replaced auth Pinterest**: -         /* Channel Sync (Frontend expected: /api/sync/...) */
+         /* Pinterest */
-         Route::prefix('sync')->group(function () {
+         Route::get('pinterest/config',         [PinterestController::class, 'getConfig']);
-             Route::get('dashboard',     [ChannelSyncController::class, 'dashboard']);
+         Route::put('pinterest/config',         [PinterestController::class, 'updateConfig']);
-             Route::get('statuses',      [ChannelSyncController::class, 'statuses']);
+         Route::get('pinterest/auth-url',       [PinterestController::class, 'getAuthUrl']);
-             Route::get('queue',         [ChannelSyncController::class, 'queue']);
+         Route::get('pinterest/callback',       [PinterestController::class, 'handleCallback']);
-             Route::get('failed',        [ChannelSyncController::class, 'failedJobs']);
+         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
-             Route::post('retry/{id}',   [ChannelSyncController::class, 'retry']);
+         Route::post('pinterest/test',          [PinterestController::class, 'testConnection']);
-             Route::get('health',        [ChannelSyncController::class, 'health']);
+ 
-             Route::get('conflicts',     [ChannelSyncController::class, 'conflicts']);
+         /* Channel Sync (Frontend expected: /api/sync/...) */
-             Route::post('resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
+         Route::prefix('sync')->group(function () {
-         });
+             Route::get('dashboard',     [ChannelSyncController::class, 'dashboard']);
- 
+             Route::get('statuses',      [ChannelSyncController::class, 'statuses']);
-         Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
+             Route::get('queue',         [ChannelSyncController::class, 'queue']);
-         Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
+             Route::get('failed',        [ChannelSyncController::class, 'failedJobs']);
-         Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
+             Route::post('retry/{id}',   [ChannelSyncController::class, 'retry']);
-         Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
+             Route::get('health',        [ChannelSyncController::class, 'health']);
-         Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
+             Route::get('conflicts',     [ChannelSyncController::class, 'conflicts']);
-         Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
+             Route::post('resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
-         Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
+         });
-         /* Pricing & Sync */
+         Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
-         Route::prefix('pricing')->group(function () {
+         Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
-             Route::get('settings',             [PricingSyncController::class, 'settings']);
+         Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
-             Route::put('settings',             [PricingSyncController::class, 'updateSettings']);
+         Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
-             Route::get('conflicts',            [PricingSyncController::class, 'conflicts']);
+         Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
-             Route::post('conflicts/{id}/resolve', [PricingSyncController::class, 'resolve']);
+         Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
-             Route::get('audit-log',            [PricingSyncController::class, 'auditLog']);
+         Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);
-             Route::post('approve/{id}',        [PricingSyncController::class, 'approve']);
+ 
-             Route::post('reject/{id}',         [PricingSyncController::class, 'reject']);
+         /* Pricing & Sync */
-         });
+         Route::prefix('pricing')->group(function () {
-         Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
+             Route::get('settings',             [PricingSyncController::class, 'settings']);
- 
+             Route::put('settings',             [PricingSyncController::class, 'updateSettings']);
-         /* Sync Logs */
+             Route::get('conflicts',            [PricingSyncController::class, 'conflicts']);
-         Route::get('sync-logs',                [SyncLogController::class, 'index']);
+             Route::post('conflicts/{id}/resolve', [PricingSyncController::class, 'resolve']);
-         Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);
+             Route::get('audit-log',            [PricingSyncController::class, 'auditLog']);
- 
+             Route::post('approve/{id}',        [PricingSyncController::class, 'approve']);
-         /* Audit Logs */
+             Route::post('reject/{id}',         [PricingSyncController::class, 'reject']);
-         Route::get('audit-logs',               [AuditLogController::class, 'index']);
+         });
-         Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);
+         Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
-         /* Compliance */
+         /* Sync Logs */
-         Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
+         Route::get('sync-logs',                [SyncLogController::class, 'index']);
-         Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
+         Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);
-         Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
+ 
-         Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
+         /* Audit Logs */
-         Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);
+         Route::get('audit-logs',               [AuditLogController::class, 'index']);
- 
+         Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);
-         /* Supplier Import (Aligned with frontend) */
+ 
-         Route::get('suppliers',                   [SupplierImportController::class, 'connections']);
+         /* Compliance */
-         Route::post('suppliers/{id}/sync',          [SupplierImportController::class, 'fetchProducts']);
+         Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
-         Route::get('suppliers/{id}/products',       [SupplierImportController::class, 'products']);
+         Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
-         Route::get('suppliers/{id}/duplicates',     [SupplierImportController::class, 'duplicates']);
+         Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
-         Route::post('suppliers/import',            [SupplierImportController::class, 'import']);
+         Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
-         Route::get('suppliers/import-jobs',        [SupplierImportController::class, 'jobs']);
+         Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);
-         Route::post('suppliers/import-jobs/{id}/retry', [SupplierImportController::class, 'retryJob']);
+ 
-         
+         /* Supplier Import (Aligned with frontend) */
-         /* Supplier Sync */
+         Route::get('suppliers',                   [SupplierImportController::class, 'connections']);
-         Route::prefix('supplier-sync')->group(function () {
+         Route::post('suppliers/{id}/sync',          [SupplierImportController::class, 'fetchProducts']);
-             Route::get('mappings',         [SupplierSyncController::class, 'index']);
+         Route::get('suppliers/{id}/products',       [SupplierImportController::class, 'products']);
-             Route::patch('mappings/{id}',  [SupplierSyncController::class, 'update']);
+         Route::get('suppliers/{id}/duplicates',     [SupplierImportController::class, 'duplicates']);
-             Route::post('mappings/{id}/sync', [SupplierSyncController::class, 'sync']);
+         Route::post('suppliers/import',            [SupplierImportController::class, 'import']);
-             Route::post('sync-all',        [SupplierSyncController::class, 'syncAll']);
+         Route::get('suppliers/import-jobs',        [SupplierImportController::class, 'jobs']);
-             Route::get('logs',             [SupplierSyncController::class, 'logs']);
+         Route::post('suppliers/import-jobs/{id}/retry', [SupplierImportController::class, 'retryJob']);
-             Route::get('balances',         [SupplierSyncController::class, 'balances']);
+         
-             Route::post('orders/{id}/retry-fulfillment', [SupplierSyncController::class, 'retryFulfillment']);
+         /* Supplier Sync */
-         });
+         Route::prefix('supplier-sync')->group(function () {
- 
+             Route::get('mappings',         [SupplierSyncController::class, 'index']);
-         /* Admin Settings */
+             Route::patch('mappings/{id}',  [SupplierSyncController::class, 'update']);
-         Route::get('settings',                 [AdminSettingController::class, 'index']);
+             Route::post('mappings/{id}/sync', [SupplierSyncController::class, 'sync']);
-         Route::put('settings',                 [AdminSettingController::class, 'update']);
+             Route::post('sync-all',        [SupplierSyncController::class, 'syncAll']);
- 
+             Route::get('logs',             [SupplierSyncController::class, 'logs']);
-         /* AI Blog Automation */
+             Route::get('balances',         [SupplierSyncController::class, 'balances']);
-         Route::prefix('blog-automation')->group(function () {
+             Route::post('orders/{id}/retry-fulfillment', [SupplierSyncController::class, 'retryFulfillment']);
-             Route::get('config',               [AdminBlogAutomationController::class, 'show']);
+         });
-             Route::put('config',               [AdminBlogAutomationController::class, 'update']);
+ 
-             
+         /* Admin Settings */
-             Route::get('telegram',             [AdminBlogAutomationController::class, 'getTelegramConfig']);
+         Route::get('settings',                 [AdminSettingController::class, 'index']);
-             Route::put('telegram',             [AdminBlogAutomationController::class, 'updateTelegramConfig']);
+         Route::put('settings',                 [AdminSettingController::class, 'update']);
-             Route::post('telegram/test',       [AdminBlogAutomationController::class, 'testTelegram']);
+ 
- 
+         /* AI Blog Automation */
-             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
+         Route::prefix('blog-automation')->group(function () {
-             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
+             Route::get('config',               [AdminBlogAutomationController::class, 'show']);
-             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
+             Route::put('config',               [AdminBlogAutomationController::class, 'update']);
-             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
+             
-             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
+             Route::get('telegram',             [AdminBlogAutomationController::class, 'getTelegramConfig']);
-             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
+             Route::put('telegram',             [AdminBlogAutomationController::class, 'updateTelegramConfig']);
-             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
+             Route::post('telegram/test',       [AdminBlogAutomationController::class, 'testTelegram']);
-             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
+ 
-         });
+             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
- 
+             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
-         /* Products (Admin Aliases) */
+             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
-         Route::get('products',                [ProductController::class, 'index']);
+             Route::put('keywords/{id}',        [AdminBlogKeywordController::class, 'update']);
-         Route::get('products/{id}',           [ProductController::class, 'show']);
+             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
-         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
+             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
-         Route::post('products',               [ProductController::class, 'store']);
+             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
-         Route::put('products/{id}',           [ProductController::class, 'update']);
+             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
-         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
+         });
-         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
+ 
-         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
+         /* Products (Admin Aliases) */
- 
+         Route::get('products',                [ProductController::class, 'index']);
-         /* Categories (Admin Aliases) */
+         Route::get('products/{id}',           [ProductController::class, 'show']);
-         Route::get('categories',              [CategoryController::class, 'index']);
+         Route::get('products/slug/{slug}',    [ProductController::class, 'showBySlug']);
-         Route::get('categories/{id}',         [CategoryController::class, 'show']);
+         Route::post('products',               [ProductController::class, 'store']);
-         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
+         Route::put('products/{id}',           [ProductController::class, 'update']);
-         Route::post('categories',             [CategoryController::class, 'store']);
+         Route::delete('products/{id}',        [ProductController::class, 'destroy']);
-         Route::put('categories/{id}',         [CategoryController::class, 'update']);
+         Route::post('products/{id}/duplicate', [ProductController::class, 'duplicate']);
-         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
+         Route::post('products/bulk',          [ProductController::class, 'bulkAction']);
-         /* Orders (Admin Aliases) */
+         /* Categories (Admin Aliases) */
-         Route::get('orders',                  [OrderController::class, 'index']);
+         Route::get('categories',              [CategoryController::class, 'index']);
-         Route::get('orders/{id}',             [OrderController::class, 'show']);
+         Route::get('categories/{id}',         [CategoryController::class, 'show']);
-         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
+         Route::get('categories/slug/{slug}',  [CategoryController::class, 'showBySlug']);
- 
+         Route::post('categories',             [CategoryController::class, 'store']);
-         /* Tickets (Admin Aliases) */
+         Route::put('categories/{id}',         [CategoryController::class, 'update']);
-         Route::get('tickets',                 [TicketController::class, 'index']);
+         Route::delete('categories/{id}',      [CategoryController::class, 'destroy']);
-         Route::get('tickets/{id}',            [TicketController::class, 'show']);
+ 
-         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
+         /* Orders (Admin Aliases) */
-         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
+         Route::get('orders',                  [OrderController::class, 'index']);
-         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
+         Route::get('orders/{id}',             [OrderController::class, 'show']);
-     });
+         Route::patch('orders/{id}/status',    [OrderController::class, 'updateStatus']);
- });
+ 
- 
+         /* Tickets (Admin Aliases) */
+         Route::get('tickets',                 [TicketController::class, 'index']);
+         Route::get('tickets/{id}',            [TicketController::class, 'show']);
+         Route::post('tickets/{id}/reply',     [TicketController::class, 'reply']);
+         Route::post('tickets/{id}/status',    [TicketController::class, 'updateStatus']);
+         Route::post('tickets/{id}/close',     [TicketController::class, 'close']);
+     });
+ });
+ 
