> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `api\verify_discord.php` (Domain: **Generic Logic**)

### 🔴 Generic Logic Gotchas
- **⚠️ GOTCHA: Replaced auth Route — ensures atomic multi-step database operations**: -     Route::post('products/bulk',              [ProductController::class, 'bulkAction'])->middleware('role:admin');
+     Route::post('products/{id}/discord',      [ProductController::class, 'sendToDiscord'])->middleware('role:admin');
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
-         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
+         Route::get('pinterest/auth-url',       [PinterestController::class, 'getAuthUrl']);
-         Route::post('pinterest/save-manual-token', [PinterestController::class, 'saveManualToken']);
+         Route::get('pinterest/boards',         [PinterestController::class, 'getBoards']);
-         Route::post('pinterest/test',          [PinterestController::class, 'testConnection']);
+         Route::post('pinterest/save-manual-token', [PinterestController::class, 'saveManualToken']);
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
-             Route::get('discord',              [AdminBlogAutomationController::class, 'getDiscordConfig']);
+ 
-             Route::put('discord',              [AdminBlogAutomationController::class, 'updateDiscordConfig']);
+             Route::get('discord',              [AdminBlogAutomationController::class, 'getDiscordConfig']);
-             Route::post('discord/test',        [AdminBlogAutomationController::class, 'testDiscord']);
+             Route::put('discord',              [AdminBlogAutomationController::class, 'updateDiscordConfig']);
- 
+             Route::post('discord/test',        [AdminBlogAutomationController::class, 'testDiscord']);
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
-             Route::post('discord/send/{id}',   [AdminBlogAutomationController::class, 'sendPostToDiscord']);
+             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
-         });
+             Route::post('discord/send/{id}',   [AdminBlogAutomationController::class, 'sendPostToDiscord']);
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

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in verify_discord.php**: -     'category_id' => 1,
+     'random_post_eligible' => true,
-     'compliance_status' => 'approved'
+     'category_id' => 1,
- ]);
+     'compliance_status' => 'approved'
- 
+ ]);
- echo "Product Created: ID {$product->id}\n";
+ 
- 
+ echo "Product Created: ID {$product->id}\n";
- echo "\n--- Testing Product Update Trigger ---\n";
+ 
- $product->price = 89.99;
+ echo "\n--- Testing Product Update Trigger ---\n";
- $product->save();
+ $product->price = 89.99;
- echo "Product Updated: Price changed to 89.99\n";
+ $product->save();
- 
+ echo "Product Updated: Price changed to 89.99\n";
- echo "\n--- Testing Random Post Job ---\n";
+ 
- \App\Jobs\PostRandomProductJob::dispatchSync();
+ echo "\n--- Testing Random Post Job ---\n";
- echo "Random Post Job Dispatched Successfully.\n";
+ \App\Jobs\PostRandomProductJob::dispatchSync();
- 
+ echo "Random Post Job Dispatched Successfully.\n";
- echo "\n--- DONE ---\n";
+ 
- echo "Check storage/logs/laravel.log for Discord service output.\n";
+ echo "\n--- DONE ---\n";
- 
+ echo "Check storage/logs/laravel.log for Discord service output.\n";
+ 
- **[what-changed] what-changed in verify_discord.php**: File updated (external): api/verify_discord.php

Content summary (58 lines):
<?php

use App\Models\Product;
use App\Models\Setting;
use App\Services\DiscordService;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Testing Settings Persistence ---\n";
$config = [
    'enabled' => true,
    'frequency' => 'twice_daily',
    'automation_new_product_post' => true,
    'automation_product_update_no
- **[what-changed] Replaced auth Error — prevents null/undefined runtime crashes**: - $token = "[REDACTED]";
+ $token = $_GET['token'] ?? '';
- $boardId = "1114992888936092227";
+ $boardId = $_GET['board_id'] ?? '1114992888936092227';
- $cfg = PinterestConfig::firstOrCreate(['id' => 1]);
+ if (empty($token)) {
- $currentConfig = $cfg->config ?? [];
+     die("Error: Please provide a token. Example: ?token=pina_...");
- 
+ }
- $cfg->update([
+ 
-     'config' => array_merge($currentConfig, [
+ $cfg = PinterestConfig::firstOrCreate(['id' => 1]);
-         'access_token' => $token,
+ $currentConfig = $cfg->config ?? [];
-         'board_id' => $boardId,
+ 
-         'expires_at' => null
+ $cfg->update([
-     ]),
+     'config' => array_merge($currentConfig, [
-     'status' => 'active'
+         'access_token' => $token,
- ]);
+         'board_id' => $boardId,
- 
+         'expires_at' => null
- echo "<h1>SUCCESS!</h1>";
+     ]),
- echo "<p>Pinterest Access Token and Board ID have been manually set in the database.</p>";
+     'status' => 'active'
- echo "<p><b>Token:</b> " . substr($token, 0, 10) . "...</p>";
+ ]);
- echo "<p><b>Board ID:</b> $boardId</p>";
+ 
- echo "<hr><p>Ab aap wapis admin panel mein ja kar 'Test' button check karein. <b>Is file ko foran delete kar dein security ke liye.</b></p>";
+ echo "<h1>SUCCESS!</h1>";
- 
+ echo "<p>Pinterest Access Token and Board ID have been manually set in the database.</p>";
+ echo "<p><b>Token:</b> " . substr($token, 0, 10) . "...</p>";
+ echo "<p><b>Board ID:</b> $boardId</p>";
+ echo "<hr><p>Ab aap wapis admin panel mein ja kar 'Test' button check karein. <b>Is file ko foran delete kar dein security ke liye.</b></p>";
+ 
- **[what-changed] what-changed in set_pinterest_token.php**: File updated (external): api/set_pinterest_token.php

Content summary (31 lines):
<?php
// set_pinterest_token.php

use App\Models\PinterestConfig;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = "[REDACTED]";
$boardId = "1114992888936092227";

$cfg = PinterestConfig::firstOrCreate(['id' => 1]);
$currentConfig = $cfg->config ?? [];

$cfg->update([
    'config' =
- **[what-changed] what-changed in pinterest_diagnostic.php**: File updated (external): api/pinterest_diagnostic.php

Content summary (49 lines):
<?php
// pinterest_diagnostic.php

use App\Models\PinterestConfig;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>Pinterest Integration Diagnostic</h1>";

$configs = PinterestConfig::all();
echo "<h2>Database Records (Total: " . $configs->count() . ")</h2>";

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
$config['access_token'] = '[REDACTED]';
- **[what-changed] what-changed in ProductController.php**: File updated (external): api/app/Http/Controllers/ProductController.php

Content summary (170 lines):
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'supplier'])
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('slug', 'like', "%{$request->
- **[what-changed] what-changed in SupplierImportController.php**: File updated (external): api/app/Http/Controllers/SupplierImportController.php

Content summary (231 lines):
<?php

namespace App\Http\Controllers;

use App\Models\SupplierConnection;
use App\Models\SupplierProduct;
use App\Models\Product;
use App\Models\SupplierSyncLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;

class SupplierImportController extends Controller
{
    /**
     * List all supplier connections.
     */
    public function connections(): JsonResponse
    {
        $connections
- **[discovery] discovery in console.php**: - 
+ Schedule::command('product:random-post')->dailyAt('10:00');
- Artisan::command('supplier:sync-prices', function () {
+ Schedule::command('product:random-post')->dailyAt('20:00');
-     $suppliers = \App\Models\SupplierConnection::where('is_active', true)->get();
+ 
-     foreach ($suppliers as $supplier) {
+ Artisan::command('product:random-post', function () {
-         \App\Jobs\SyncSupplierPricesJob::dispatch($supplier->id);
+     \App\Jobs\PostRandomProductJob::dispatch(app(\App\Services\DiscordService::class));
-         $this->info("Dispatched sync job for supplier: {$supplier->name}");
+     $this->info("Handled random product post job.");
-     }
+ })->purpose('Post a random eligible product to Discord');
- })->purpose('Sync prices for all active suppliers');
+ 
- 
+ Artisan::command('supplier:sync-prices', function () {
- Artisan::command('fulfill:retry {order_id}', function ($order_id) {
+     $suppliers = \App\Models\SupplierConnection::where('is_active', true)->get();
-     echo "Retrying fulfillment for Order #{$order_id}...\n";
+     foreach ($suppliers as $supplier) {
-     $service = app(\App\Services\OrderFulfillmentService::class);
+         \App\Jobs\SyncSupplierPricesJob::dispatch($supplier->id);
-     $order = \App\Models\Order::find($order_id);
+         $this->info("Dispatched sync job for supplier: {$supplier->name}");
-     if (!$order) {
+     }
-         echo "Order not found.\n";
+ })->purpose('Sync prices for all active suppliers');
-         return;
+ 
-     }
+ Artisan::command('fulfill:retry {order_id}', function ($order_id) {
-     $result = $service->fulfill($order);
+     echo "Retrying fulfillment for Order #{$order_id}...\n";
-     echo "Result Status: {$result['status']}\n";
+     $service = app(\App\Services\OrderFulfillmentService::class);
- })->purpose('Retry fulfillment for a specific order');
+     $order = \App\Models\Order::find($order_id);
- 
+     if (!$order) {
+         echo "Order not found.\n";
+         return;
+     }
+     $result = $service->fulfill($order);
+     echo "Result Status: {$result['status']}\n";
+ })->purpose('Retry fulfillment for a specific order');
+ 
- **[convention] convention in AutomationController.php**: File updated (external): api/app/Http/Controllers/AutomationController.php

Content summary (217 lines):
<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AutomationController extends Controller
{
    public function rules(Request $request): JsonResponse
    {
        $rules = AutomationRule::orderBy('name')->get();
        return response()->json(['data' => $rules]);
    }

    public function createRule(Request $request): JsonResponse
    {
        $data = $request->validate([
      
- **[what-changed] what-changed in AppServiceProvider.php**: File updated (external): api/app/Providers/AppServiceProvider.php

Content summary (26 lines):
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\Order::observe(\App\Observers\OrderObserver::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
    }
}

- **[what-changed] Updated your database schema — prevents null/undefined runtime crashes**: - use App\Models\DiscordConfig;
+ use App\Models\Product;
- use Illuminate\Support\Facades\Http;
+ use App\Models\DiscordConfig;
- use Illuminate\Support\Facades\Log;
+ use Illuminate\Support\Facades\Http;
- use Illuminate\Support\Str;
+ use Illuminate\Support\Facades\Log;
- 
+ use Illuminate\Support\Str;
- class DiscordService
+ 
- {
+ class DiscordService
-     /**
+ {
-      * Send a blog post to the configured Discord webhook.
+     /**
-      *
+      * Send a blog post to the configured Discord webhook.
-      * @param BlogPost $post
+      *
-      * @return bool
+      * @param BlogPost $post
-      */
+      * @return bool
-     public function sendBlogPost(BlogPost $post)
+      */
-     {
+     public function sendBlogPost(BlogPost $post)
-         $configModel = DiscordConfig::first();
+     {
-         $config = $configModel?->config ?? [];
+         $configModel = DiscordConfig::first();
-         
+         $config = $configModel?->config ?? [];
-         $enabled = ($config['auto_post_enabled'] ?? false) == true;
+         
-         $webhookUrl = $config['webhook_url'] ?? null;
+         $enabled = ($config['auto_post_enabled'] ?? false) == true;
- 
+         $webhookUrl = $config['webhook_url'] ?? null;
-         if (!$enabled || !$webhookUrl) {
+ 
-             Log::channel('automation')->info('Discord: Skipping post share (disabled or missing webhook URL).');
+         if (!$enabled || !$webhookUrl) {
-             return false;
+             Log::channel('automation')->info('Discord: Skipping post share (disabled or missing webhook URL).');
-         }
+             return false;
- 
+         }
-         try {
+ 
-             $websiteUrl = config('app.url');
+         try {
-             
+             $websiteUrl = config('app.url');
-             // If APP_URL points to /api, we need the parent directory for frontend links
+             
-             if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+             // If APP_URL points to /api, we need the parent directory for frontend links
-                 $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+             if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-             }
+                 $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
- 
+             }
-             $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+ 
-             $imageUrl = $post->image_url;
+             $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
- 
+             $imageUrl = $post->image_url;
-             // Ensure full URL for image
+ 
-             if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
+             // Ensure full URL for image
-                 $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+             if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
-             }
+                 $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
- 
+             }
-             $payload = [
+ 
-                 'username' => 'UpgraderCX Bot',
+             $payload = [
-                 'embeds' => [
+                 'username' => 'UpgraderCX Bot',
-                     [
+                 'embeds' => [
-                         'title' => "🚀 New Article: " . strip_tags($post->title),
+                     [
-                         'description' => strip_tags($post->excerpt ?? ''),
+                         'title' => "🚀 New Article: " . strip_tags($post->title),
-                         'url' => $postUrl,
+                         'description' => strip_tags($post->excerpt ?? ''),
-                         'color' => 5814783, // Elegant Purple (#58B9FF is 5814783 in dec)
+                         'url' => $postUrl,
-                         'image' => [
+                         'color' => 5814783, // Elegant Purple (#58B9FF is 5814783 in dec)
-                             'url' => $imageUrl
+                         'image' => [
-                         ],
+                             'url' => $imageUrl
-                         'footer' => [
+                         ],
-                             'text' => 'Read more on UpgraderCX',
+                         'footer' => [
-                             'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
+                             'text' => 'Read more on UpgraderCX',
-                         ],
+                             'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
-                         'timestamp' => now()->toISOString()
+                         ],
-                     ]
+                         'timestamp' => now()->toISOString()
-                 ]
+                     ]
-             ];
+                 ]
- 
+             ];
-             $response = Http::withoutVerifying()
+ 
-                 ->timeout(10)
+             $response = Http::withoutVerifying()
-                 ->post($webhookUrl, $payload);
+                 ->timeout(10)
- 
+                 ->post($webhookUrl, $payload);
-             if ($response->successful()) {
+ 
-                 Log::channel('automation')->info("Discord: Post successfully shared: {$post->title}");
+             if ($response->successful()) {
-                 return true;
+                 Log::channel('automation')->info("Discord: Post successfully shared: {$post->title}");
-             }
+                 return true;
- 
+             }
-             Log::channel('automation')->error("Discord Webhook Error: " . $response->body());
+ 
-             return false;
+             Log::channel('automation')->error("Discord Webhook Error: " . $response->body());
- 
+             return false;
-         } catch (\Exception $e) {
+ 
-             Log::channel('automation')->error("Discord Service Exception: " . $e->getMessage());
+         } catch (\Exception $e) {
-             return false;
+             Log::channel('automation')->error("Discord Service Exception: " . $e->getMessage());
-         }
+             return false;
-     }
+         }
- 
+     }
-     /**
+ 
-      * Send a simple test message to verify connectivity.
+     /**
-      */
+      * Send a product to the configured Discord webhook.
-     public function sendTestMessage($message = "Hello from your UpgraderCX AI Blogging Engine! 🚀")
+      *
-     {
+      * @param Product $product
-         $configModel = DiscordConfig::first();
+      * @param string $trigger (new, update, random, manual)
-         $webhookUrl = $configModel?->config['webhook_url'] ?? null;
+      * @return bool
- 
+      */
-         if (!$webhookUrl) {
+     public function sendProductPost(Product $product, string $trigger = 'new')
-             return [
+     {
-                 'ok' => false,
+         $configModel = DiscordConfig::first();
-                 'description' => "Missing Webhook URL configuration."
+         $config = $configModel?->config ?? [];
-             ];
+         
-         }
+         $enabled = ($config['auto_post_enabled'] ?? false) == true;
- 
+         $webhookUrl = $config['webhook_url'] ?? null;
-         try {
+ 
-             $payload = [
+         if (!$webhookUrl) {
-                 'content' => $message,
+             Log::channel('automation')->info('Discord Product: Missing webhook URL.');
-                 'username' => 'UpgraderCX Tester'
+             return false;
-             ];
+         }
-             $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);
+         try {
- 
+             $websiteUrl = config('app.url');
-             if ($response->successful()) {
+             if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-                 return ['ok' => true, 'description' => 'Test message sent successfully!'];
+                 $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
-             return [
+             $productUrl = rtrim($websiteUrl, '/') . '/products/' . $product->slug;
-                 'ok' => false,
+             $imageUrl = $product->image_url;
-                 'description' => 'Discord Error: ' . $response->body()
+ 
-             ];
+             if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
-         } catch (\Exception $e) {
+                 $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
-             return [
+             }
-                 'ok' => false,
+ 
-                 'description' => 'Connection Error: ' . $e->getMessage()
+             $headlines = [
-             ];
+                 'new'    => "🚀 **New Arrival!**",
-         }
+                 'update' => "🔄 **Product Updated!**",
-     }
+                 'random' => "🎲 **Today's Featured Deal!**",
- }
+                 'manual' => "📢 **Featured Product!**",
- 
+             ];
+ 
+             $headline = $headlines[$trigger] ?? "🛒 **Featured Product!**";
+ 
+             $payload = [
+                 'username' => 'UpgraderCX Bot',
+                 'embeds' => [
+                     [
+                         'title' => $headline . " " . $product->name,
+                         'description' => strip_tags($product->short_description ?? $product->description ?? ''),
+                         'url' => $productUrl,
+                         'color' => 5814783,
+                         'fields' => [
+                             [
+                                 'name' => 'Price',
+                                 'value' => '**$' . number_format($product->price, 2) . '**' . ($product->compare_price ? ' ~~$' . number_format($product->compare_price, 2) . '~~' : ''),
+                                 'inline' => true
+                             ],
+                             [
+                                 'name' => 'Availability',
+                                 'value' => $product->stock_status === 'in_stock' ? '✅ In Stock' : ($product->stock_status === 'limited' ? '⚠️ Limited Stock' : '❌ Out of Stock'),
+                                 'inline' => true
+                             ],
+                             [
+                                 'name' => 'Category',
+                                 'value' => $product->category?->name ?? 'Digital Service',
+                                 'inline' => true
+                             ]
+                         ],
+                         'image' => [
+                             'url' => $imageUrl
+                         ],
+                         'footer' => [
+                             'text' => 'Shop now on UpgraderCX',
+                             'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
+                         ],
+                         'timestamp' => now()->toISOString()
+                     ]
+                 ]
+             ];
+ 
+             $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);
+ 
+             if ($response->successful()) {
+                 Log::channel('automation')->info("Discord Product: Shared successfully: {$product->name} (Trigger: {$trigger})");
+                 return true;
+             }
+ 
+             Log::channel('automation')->error("Discord Product Webhook Error: " . $response->body());
+             return false;
+ 
+         } catch (\Exception $e) {
+             Log::channel('automation')->error("Discord Product Service Exception: " . $e->getMessage());
+             return false;
+         }
+     }
+ 
+     /**
+      * Send a simple test message to verify connectivity.
+      */
+     public function sendTestMessage($message = "Hello from your UpgraderCX AI Blogging Engine! 🚀")
+     {
+         $configModel = DiscordConfig::first();
+         $webhookUrl = $configModel?->config['webhook_url'] ?? null;
+ 
+         if (!$webhookUrl) {
+             return [
+                 'ok' => false,
+                 'description' => "Missing Webhook URL configuration."
+             ];
+         }
+ 
+         try {
+             $payload = [
+                 'content' => $message,
+                 'username' => 'UpgraderCX Tester'
+             ];
+ 
+             $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);
+ 
+             if ($response->successful()) {
+                 return ['ok' => true, 'description' => 'Test message sent successfully!'];
+             }
+ 
+             return [
+                 'ok' => false,
+                 'description' => 'Discord Error: ' . $response->body()
+             ];
+         } catch (\Exception $e) {
+             return [
+                 'ok' => false,
+                 'description' => 'Connection Error: ' . $e->getMessage()
+             ];
+         }
+     }
+ }
+ 
- **[convention] Updated API endpoint Route — confirmed 3x**: -             Route::get('keywords',             [AdminBlogKeywordController::class, 'index']);
+             Route::get('discord',              [AdminBlogAutomationController::class, 'getDiscordConfig']);
-             Route::post('keywords',            [AdminBlogKeywordController::class, 'store']);
+             Route::put('discord',              [AdminBlogAutomationController::class, 'updateDiscordConfig']);
-             Route::post('keywords/bulk',       [AdminBlogKeywordController::class, 'bulkStore']);
+             Route::post('discord/test',        [AdminBlogAutomationController::class, 'testDiscord']);
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
-             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
+             Route::delete('keywords/{id}',     [AdminBlogKeywordController::class, 'destroy']);
-         });
+             Route::post('trigger',             [AdminBlogAutomationController::class, 'trigger']);
- 
+             Route::get('status',               [AdminBlogAutomationController::class, 'status']);
-         /* Products (Admin Aliases) */
+             Route::post('telegram/send/{id}',  [AdminBlogAutomationController::class, 'sendPostToTelegram']);
-         Route::get('products',                [ProductController::class, 'index']);
+             Route::post('pinterest/send/{id}', [AdminBlogAutomationController::class, 'sendPostToPinterest']);
-         Route::get('products/{id}',           [ProductController::class, 'show']);
+             Route::post('discord/send/{id}',   [AdminBlogAutomationController::class, 'sendPostToDiscord']);
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
- **[what-changed] Replaced auth Services — prevents null/undefined runtime crashes**: - use Illuminate\Support\Facades\Cache;
+ use App\Services\TelegramService;
- use Illuminate\Support\Facades\Log;
+ use App\Services\DiscordService;
- 
+ use App\Models\DiscordConfig;
- class AdminBlogAutomationController extends Controller
+ use Illuminate\Http\Request;
- {
+ use Illuminate\Http\JsonResponse;
-     public function show(): \Illuminate\Http\JsonResponse
+ use Illuminate\Support\Facades\Cache;
-     {
+ use Illuminate\Support\Facades\Log;
-         $config = BlogAutomationConfig::firstOrCreate([], [
+ 
-             'posts_per_day' => 1,
+ class AdminBlogAutomationController extends Controller
-             'mode' => 'draft',
+ {
-             'default_tone' => 'professional',
+     public function show(): \Illuminate\Http\JsonResponse
-             'model_text' => 'gemini-2.5-flash',
+     {
-             'model_image' => 'gemini-3.1-flash-image-preview',
+         $config = BlogAutomationConfig::firstOrCreate([], [
-             'is_enabled' => false,
+             'posts_per_day' => 1,
-         ]);
+             'mode' => 'draft',
- 
+             'default_tone' => 'professional',
-         return response()->json(['data' => $config]);
+             'model_text' => 'gemini-2.5-flash',
-     }
+             'model_image' => 'gemini-3.1-flash-image-preview',
- 
+             'is_enabled' => false,
-     public function update(Request $request): JsonResponse
+         ]);
-     {
+ 
-         $config = BlogAutomationConfig::first();
+         return response()->json(['data' => $config]);
- 
+     }
-         $data = $request->validate([
+ 
-             'posts_per_day' => 'sometimes|integer|min:1|max:24',
+     public function update(Request $request): JsonResponse
-             'mode'          => 'sometimes|in:auto,draft',
+     {
-             'default_tone'  => 'sometimes|string|max:255',
+         $config = BlogAutomationConfig::first();
-             'model_text'    => 'sometimes|string|max:255',
+ 
-             'model_image'   => 'sometimes|string|max:255',
+         $data = $request->validate([
-             'is_enabled'    => 'sometimes|boolean',
+             'posts_per_day' => 'sometimes|integer|min:1|max:24',
-         ]);
+             'mode'          => 'sometimes|in:auto,draft',
- 
+             'default_tone'  => 'sometimes|string|max:255',
-         if ($config) {
+             'model_text'    => 'sometimes|string|max:255',
-             $config->update($data);
+             'model_image'   => 'sometimes|string|max:255',
-         } else {
+             'is_enabled'    => 'sometimes|boolean',
-             $config = BlogAutomationConfig::create($data);
+         ]);
-         }
+ 
- 
+         if ($config) {
-         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
+             $config->update($data);
-     }
+         } else {
- 
+             $config = BlogAutomationConfig::create($data);
-     public function trigger()
+         }
-     {
+ 
-         // Increase time limit for this request (AI takes ~60s)
+         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
-         set_time_limit(0);
+     }
-         ignore_user_abort(true);
+ 
- 
+     public function trigger()
-         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
+     {
-         $keyword = BlogKeyword::where('status', 'active')
+         // Increase time limit for this request (AI takes ~60s)
-             ->orderBy('last_used_at', 'asc')
+         set_time_limit(0);
-             ->first();
+         ignore_user_abort(true);
-         if (!$keyword) {
+         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
-             return response()->json(['message' => 'No active keywords found.'], 400);
+         $keyword = BlogKeyword::where('status', 'active')
-         }
+             ->orderBy('last_used_at', 'asc')
- 
+             ->first();
-         // Update usage tracking BEFORE dispatch to prevent race conditions
+ 
-         $keyword->update([
+         if (!$keyword) {
-             'last_used_at' => now(),
+             return response()->json(['message' => 'No active keywords found.'], 400);
-             'usage_count' => ($keyword->usage_count ?? 0) + 1
+         }
-         ]);
+ 
- 
+         // Update usage tracking BEFORE dispatch to prevent race conditions
-         // Set initial status
+         $keyword->update([
-         Cache::put('ai_blog_generation_status', [
+             'last_used_at' => now(),
-             'active' => true,
+             'usage_count' => ($keyword->usage_count ?? 0) + 1
-             'message' => 'Engine Warming Up...',
+         ]);
-             'percentage' => 5,
+ 
-             'last_updated' => now()->toISOString()
+         // Set initial status
-         ], 300);
+         Cache::put('ai_blog_generation_status', [
- 
+             'active' => true,
-         // Run it IMMEDIATELY for manual clicks
+             'message' => 'Engine Warming Up...',
-         // dispatchSync will run it in the current request
+             'percentage' => 5,
-         GenerateAIBlogJob::dispatchSync($keyword);
+             'last_updated' => now()->toISOString()
- 
+         ], 300);
-         return response()->json(['message' => 'AI Blog Generation completed.']);
+ 
-     }
+         // Run it IMMEDIATELY for manual clicks
- 
+         // dispatchSync will run it in the current request
-     public function status()
+         GenerateAIBlogJob::dispatchSync($keyword);
-     {
+ 
-         $status = Cache::get('ai_blog_generation_status', [
+         return response()->json(['message' => 'AI Blog Generation completed.']);
-             'active' => false,
+     }
-             'message' => 'Idle',
+ 
-             'percentage' => 0
+     public function status()
-         ]);
+     {
- 
+         $status = Cache::get('ai_blog_generation_status', [
-         return response()->json($status);
+             'active' => false,
-     }
+             'message' => 'Idle',
- 
+             'percentage' => 0
-     public function getTelegramConfig(): JsonResponse
+         ]);
-     {
+ 
-         return response()->json([
+         return response()->json($status);
-             'data' => [
+     }
-                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
+ 
-                 'token'   => Setting::getValue('telegram_bot_token', ''),
+     public function getTelegramConfig(): JsonResponse
-                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
+     {
-             ]
+         return response()->json([
-         ]);
+             'data' => [
-     }
+                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
- 
+                 'token'   => Setting::getValue('telegram_bot_token', ''),
-     public function updateTelegramConfig(Request $request): JsonResponse
+                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
-     {
+             ]
-         $request->validate([
+         ]);
-             'enabled' => 'required|boolean',
+     }
-             'token'   => 'nullable|string',
+ 
-             'channel_id' => 'nullable|string',
+     public function updateTelegramConfig(Request $request): JsonResponse
-         ]);
+     {
- 
+         $request->validate([
-         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
+             'enabled' => 'required|boolean',
-         Setting::setValue('telegram_bot_token', $request->token);
+             'token'   => 'nullable|string',
-         Setting::setValue('telegram_channel_id', $request->channel_id);
+             'channel_id' => 'nullable|string',
- 
+         ]);
-         return response()->json(['message' => 'Telegram configuration updated.']);
+ 
-     }
+         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
- 
+         Setting::setValue('telegram_bot_token', $request->token);
-     public function testTelegram(Request $request): JsonResponse
+         Setting::setValue('telegram_channel_id', $request->channel_id);
-     {
+ 
-         $service = new TelegramService();
+         return response()->json(['message' => 'Telegram configuration updated.']);
-         $result = $service->sendTestMessage();
+     }
-         if (isset($result['ok']) && $result['ok']) {
+     public function testTelegram(Request $request): JsonResponse
-             return response()->json(['message' => 'Test message sent successfully!']);
+     {
-         }
+         $service = new TelegramService();
- 
+         $result = $service->sendTestMessage();
-         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
+ 
-         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
+         if (isset($result['ok']) && $result['ok']) {
- 
+             return response()->json(['message' => 'Test message sent successfully!']);
-         return response()->json([
+         }
-             'message' => 'Telegram Test Failed: ' . $error,
+ 
-             'details' => $result
+         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
-         ], 400);
+         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
-     }
+ 
- 
+         return response()->json([
-     public function sendPostToTelegram(int $id): JsonResponse
+             'message' => 'Telegram Test Failed: ' . $error,
-     {
+             'details' => $result
-         $post = \App\Models\BlogPost::findOrFail($id);
+         ], 400);
-         $service = new TelegramService();
+     }
-         $success = $service->sendBlogPost($post);
+ 
- 
+     public function sendPostToTelegram(int $id): JsonResponse
-         if ($success) {
+     {
-             return response()->json(['message' => 'Blog post sent to Telegram!']);
+         $post = \App\Models\BlogPost::findOrFail($id);
-         }
+         $service = new TelegramService();
- 
+         $success = $service->sendBlogPost($post);
-         return response()->json([
+ 
-             'message' => 'Failed to send to Telegram. Check automation logs.',
+         if ($success) {
-         ], 400);
+             return response()->json(['message' => 'Blog post sent to Telegram!']);
-     }
+         }
-     public function getPinterestConfig(): JsonResponse
+         return response()->json([
-     {
+             'message' => 'Failed to send to Telegram. Check automation logs.',
-         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         ], 400);
-         $data = $config->config ?? [];
+     }
-         
+ 
-         return response()->json([
+     public function getPinterestConfig(): JsonResponse
-             'data' => [
+     {
-                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
-                 'connected' => $config->status === 'active',
+         $data = $config->config ?? [];
-                 'selected_board_id' => $data['board_id'] ?? null,
+         
-                 'boards' => $config->boards ?? []
+         return response()->json([
-             ]
+             'data' => [
-         ]);
+                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
-     }
+                 'connected' => $config->status === 'active',
- 
+                 'selected_board_id' => $data['board_id'] ?? null,
-     public function updatePinterestConfig(Request $request): JsonResponse
+                 'boards' => $config->boards ?? []
-     {
+             ]
-         $request->validate([
+         ]);
-             'enabled' => 'required|boolean',
+     }
-             'board_id' => 'nullable|string',
+ 
-         ]);
+     public function updatePinterestConfig(Request $request): JsonResponse
- 
+     {
-         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         $request->validate([
-         $current = $config->config ?? [];
+             'enabled' => 'required|boolean',
-         $current['auto_post_enabled'] = $request->enabled;
+             'board_id' => 'nullable|string',
-         if ($request->has('board_id')) {
+         ]);
-             $current['board_id'] = $request->board_id;
+ 
-         }
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
- 
+         $current = $config->config ?? [];
-         $config->update(['config' => $current]);
+         $current['auto_post_enabled'] = $request->enabled;
- 
+         if ($request->has('board_id')) {
-         return response()->json(['message' => 'Pinterest configuration updated.']);
+             $current['board_id'] = $request->board_id;
-     }
+         }
-     public function testPinterest(): \Illuminate\Http\JsonResponse
+         $config->update(['config' => $current]);
-     {
+ 
-         $service = new PinterestService();
+         return response()->json(['message' => 'Pinterest configuration updated.']);
-         $boards = $service->getBoards();
+     }
-         if (!empty($boards)) {
+     public function testPinterest(): \Illuminate\Http\JsonResponse
-             return response()->json(['message' => 'Connection successful! Boards synchronized.']);
+     {
-         }
+         $service = new PinterestService();
- 
+         $boards = $service->getBoards();
-         return response()->json([
+ 
-             'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
+         if (!empty($boards)) {
-         ], 400);
+             return response()->json(['message' => 'Connection successful! Boards synchronized.']);
-     }
+         }
-     public function sendPostToPinterest(int $id): \Illuminate\Http\JsonResponse
+         return response()->json([
-     {
+             'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
-         $post = \App\Models\BlogPost::findOrFail($id);
+         ], 400);
-         $service = new PinterestService();
+     }
-         $result = $service->sendBlogPost($post);
+ 
- 
+     public function sendPostToPinterest(int $id): \Illuminate\Http\JsonResponse
-         if ($result && isset($result['id'])) {
+     {
-             return response()->json(['message' => 'Blog post shared on Pinterest!']);
+         $post = \App\Models\BlogPost::findOrFail($id);
-         }
+         $service = new PinterestService();
- 
+         $result = $service->sendBlogPost($post);
-         return response()->json([
+ 
-             'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
+         if ($result && isset($result['id'])) {
-         ], 400);
+             return response()->json(['message' => 'Blog post shared on Pinterest!']);
-     }
+         }
- }
+ 
- 
+         return response()->json([
+             'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
+         ], 400);
+     }
+ 
+     public function getDiscordConfig(): JsonResponse
+     {
+         $config = DiscordConfig::firstOrCreate(['id' => 1]);
+         $data = $config->config ?? [];
+         
+         return response()->json([
+             'data' => [
+                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
+                 'webhook_url' => $data['webhook_url'] ?? '',
+             ]
+         ]);
+     }
+ 
+     public function updateDiscordConfig(Request $request): JsonResponse
+     {
+         $request->validate([
+             'enabled' => 'required|boolean',
+             'webhook_url' => 'nullable|url',
+         ]);
+ 
+         $config = DiscordConfig::firstOrCreate(['id' => 1]);
+         $current = $config->config ?? [];
+         $current['auto_post_enabled'] = $request->enabled;
+         $current['webhook_url'] = $request->webhook_url;
+ 
+         $config->update(['config' => $current]);
+ 
+         return response()->json(['message' => 'Discord configuration updated.']);
+     }
+ 
+     public function testDiscord(): JsonResponse
+     {
+         $service = new DiscordService();
+         $result = $service->sendTestMessage();
+ 
+         if ($result['ok']) {
+             return response()->json(['message' => 'Test message sent to Discord!']);
+         }
+ 
+         return response()->json([
+             'message' => 'Discord Test Failed: ' . $result['description'],
+         ], 400);
+     }
+ 
+     public function sendPostToDiscord(int $id): JsonResponse
+     {
+         $post = \App\Models\BlogPost::findOrFail($id);
+         $service = new DiscordService();
+         $success = $service->sendBlogPost($post);
+ 
+         if ($success) {
+             return response()->json(['message' => 'Blog post shared on Discord!']);
+         }
+ 
+         return response()->json([
+             'message' => 'Failed to share on Discord. Check automation logs.',
+         ], 400);
+     }
+ }
+ 
