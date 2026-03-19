<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PricingRuleController;
use App\Http\Controllers\PricingSyncController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminSettingController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ComplianceController;
use App\Http\Controllers\SyncLogController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\DiscordController;
use App\Http\Controllers\ChannelSyncController;
use App\Http\Controllers\SupplierImportController;
use App\Http\Controllers\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes — UpgraderCX
|--------------------------------------------------------------------------
| Base: /api
| Auth: Laravel Sanctum token-based (VITE_AUTH_MODE=token)
|
| Public routes: products/slug, categories/slug, blog/slug
| Authenticated: all others
| Admin: routes under /admin require role=admin
*/

/* ── Auth ── */
Route::prefix('auth')->group(function () {
    Route::post('login',            [AuthController::class, 'login']);
    Route::post('register',         [AuthController::class, 'register']);
    Route::post('forgot-password',  [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',   [AuthController::class, 'resetPassword']);
    Route::post('refresh',          [AuthController::class, 'refresh']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user',          [AuthController::class, 'user']);
        Route::post('logout',       [AuthController::class, 'logout']);
        Route::post('verify-email', [AuthController::class, 'verifyEmail']);
    });
});

/* ── Public product & category routes ── */
Route::get('products/slug/{slug}',   [ProductController::class, 'showBySlug']);
Route::get('categories/slug/{slug}', [CategoryController::class, 'showBySlug']);
Route::get('categories',             [CategoryController::class, 'index']);
Route::get('categories/{id}',        [CategoryController::class, 'show']);
Route::get('blog',                   [BlogController::class, 'index']);
Route::get('blog/{slug}',            [BlogController::class, 'showBySlug']);
Route::post('orders',                [OrderController::class, 'store']);
Route::get('status',                 fn () => response()->json(['status' => 'ok', 'timestamp' => now()]));

/* ── Authenticated routes ── */
Route::middleware('auth:sanctum')->group(function () {

    /* Products (public GET, admin POST/PUT/DELETE) */
    Route::get('products',                    [ProductController::class, 'index']);
    Route::get('products/{id}',               [ProductController::class, 'show']);
    Route::post('products/{id}/duplicate',    [ProductController::class, 'duplicate'])->middleware('role:admin');
    Route::post('products/bulk',              [ProductController::class, 'bulkAction'])->middleware('role:admin');
    Route::apiResource('products', ProductController::class)->except(['index', 'show'])->middleware('role:admin');

    /* Orders */
    Route::get('orders',                       [OrderController::class, 'index']);
    Route::get('orders/{id}',                  [OrderController::class, 'show']);
    Route::get('orders/{id}',                  [OrderController::class, 'show']);
    Route::patch('orders/{id}/status',         [OrderController::class, 'updateStatus'])->middleware('role:admin');
    Route::post('webhooks/payhub',             [OrderController::class, 'handlePayHubWebhook']);

    /* Wallet */
    Route::get('wallet/balance',               [WalletController::class, 'balance']);
    Route::get('wallet/transactions',          [WalletController::class, 'transactions']);
    Route::post('wallet/top-up',               [WalletController::class, 'topUp']);
    Route::post('wallet/spend',                [WalletController::class, 'spend']);

    /* Tickets */
    Route::get('tickets',                      [TicketController::class, 'index']);
    Route::post('tickets',                     [TicketController::class, 'store']);
    Route::get('tickets/{id}',                 [TicketController::class, 'show']);
    Route::post('tickets/{id}/reply',          [TicketController::class, 'reply']);
    Route::post('tickets/{id}/close',          [TicketController::class, 'close']);
    Route::post('tickets/{id}/reopen',         [TicketController::class, 'reopen']);

    /* Referrals */
    Route::get('referrals',                    [ReferralController::class, 'index']);
    Route::get('referrals/stats',              [ReferralController::class, 'stats']);

    /* Notifications */
    Route::get('notifications',                [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read',    [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all',      [NotificationController::class, 'markAllRead']);
    Route::get('notifications/preferences',    [NotificationController::class, 'preferences']);
    Route::put('notifications/preferences',    [NotificationController::class, 'updatePreferences']);

    /* File uploads */
    Route::post('uploads',                     [UploadController::class, 'store'])->middleware('role:admin');

    /* Pricing rules */
    Route::apiResource('pricing-rules', PricingRuleController::class)->middleware('role:admin');

    /* ── Admin routes ── */
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        /* Dashboard */
        Route::get('dashboard',                [CustomerController::class, 'adminDashboard']);

        /* Customers */
        Route::get('customers',                [CustomerController::class, 'index']);
        Route::get('customers/{id}',           [CustomerController::class, 'show']);
        Route::patch('customers/{id}',         [CustomerController::class, 'update']);
        Route::delete('customers/{id}',        [CustomerController::class, 'destroy']);
        Route::post('customers/{id}/suspend',  [CustomerController::class, 'suspend']);
        Route::post('customers/{id}/activate', [CustomerController::class, 'activate']);
        Route::get('customers/{id}/orders',    [CustomerController::class, 'orders']);
        Route::get('customers/{id}/wallet',    [CustomerController::class, 'wallet']);
        Route::post('customers/{id}/wallet/adjust', [CustomerController::class, 'adjustWallet']);

        /* Blog */
        Route::post('blog',                    [BlogController::class, 'store']);
        Route::put('blog/{id}',                [BlogController::class, 'update']);
        Route::delete('blog/{id}',             [BlogController::class, 'destroy']);
        Route::post('blog/{id}/publish',       [BlogController::class, 'publish']);
        Route::post('blog/{id}/schedule',      [BlogController::class, 'schedule']);
        Route::post('blog/{id}/submit-review', [BlogController::class, 'submitForReview']);
        Route::post('blog/{id}/approve',       [BlogController::class, 'approve']);

        /* Automation */
        Route::get('automation/rules',         [AutomationController::class, 'rules']);
        Route::post('automation/rules',        [AutomationController::class, 'createRule']);
        Route::put('automation/rules/{id}',    [AutomationController::class, 'updateRule']);
        Route::delete('automation/rules/{id}', [AutomationController::class, 'deleteRule']);
        Route::get('automation/modules',       [AutomationController::class, 'modules']);
        Route::get('automation/jobs',          [AutomationController::class, 'jobs']);
        Route::post('automation/random-post',  [AutomationController::class, 'triggerRandomPost']);
        Route::post('automation/featured-rotation', [AutomationController::class, 'triggerFeaturedRotation']);
        Route::post('automation/stock-suppression', [AutomationController::class, 'toggleStockSuppression']);

        /* Integrations */
        Route::get('integrations',             [IntegrationController::class, 'index']);
        Route::post('integrations/{id}/connect',    [IntegrationController::class, 'connect']);
        Route::post('integrations/{id}/disconnect', [IntegrationController::class, 'disconnect']);
        Route::post('integrations/{id}/test',       [IntegrationController::class, 'test']);

        /* Telegram */
        Route::get('telegram/config',          [TelegramController::class, 'getConfig']);
        Route::put('telegram/config',          [TelegramController::class, 'updateConfig']);
        Route::get('telegram/commands',        [TelegramController::class, 'commands']);
        Route::put('telegram/commands',        [TelegramController::class, 'updateCommands']);
        Route::get('telegram/permissions',     [TelegramController::class, 'permissions']);
        Route::put('telegram/permissions',     [TelegramController::class, 'updatePermissions']);
        Route::get('telegram/posts',           [TelegramController::class, 'postHistory']);
        Route::post('telegram/push',           [TelegramController::class, 'push']);

        /* Discord */
        Route::get('discord/config',           [DiscordController::class, 'getConfig']);
        Route::put('discord/config',           [DiscordController::class, 'updateConfig']);
        Route::get('discord/commands',         [DiscordController::class, 'commands']);
        Route::put('discord/commands',         [DiscordController::class, 'updateCommands']);
        Route::get('discord/permissions',      [DiscordController::class, 'permissions']);
        Route::put('discord/permissions',      [DiscordController::class, 'updatePermissions']);
        Route::get('discord/posts',            [DiscordController::class, 'postHistory']);
        Route::post('discord/push',            [DiscordController::class, 'push']);
        Route::get('discord/alerts',           [DiscordController::class, 'alerts']);
        Route::put('discord/alerts',           [DiscordController::class, 'updateAlerts']);

        /* Channel Sync */
        Route::get('channel-sync/dashboard',   [ChannelSyncController::class, 'dashboard']);
        Route::get('channel-sync/queue',       [ChannelSyncController::class, 'queue']);
        Route::get('channel-sync/failed',      [ChannelSyncController::class, 'failedJobs']);
        Route::post('channel-sync/retry/{id}', [ChannelSyncController::class, 'retry']);
        Route::get('channel-sync/health',      [ChannelSyncController::class, 'health']);
        Route::get('channel-sync/conflicts',   [ChannelSyncController::class, 'conflicts']);
        Route::post('channel-sync/resolve/{id}', [ChannelSyncController::class, 'resolveConflict']);

        /* Pricing Sync */
        Route::get('pricing-sync',             [PricingSyncController::class, 'index']);
        Route::post('pricing-sync/push',       [PricingSyncController::class, 'push']);
        Route::get('pricing-sync/conflicts',   [PricingSyncController::class, 'conflicts']);
        Route::post('pricing-sync/resolve/{id}', [PricingSyncController::class, 'resolve']);

        /* Sync Logs */
        Route::get('sync-logs',                [SyncLogController::class, 'index']);
        Route::get('sync-logs/{id}',           [SyncLogController::class, 'show']);

        /* Audit Logs */
        Route::get('audit-logs',               [AuditLogController::class, 'index']);
        Route::get('audit-logs/{id}',          [AuditLogController::class, 'show']);

        /* Compliance */
        Route::get('compliance/queue',         [ComplianceController::class, 'queue']);
        Route::get('compliance/{id}',          [ComplianceController::class, 'show']);
        Route::post('compliance/{id}/approve', [ComplianceController::class, 'approve']);
        Route::post('compliance/{id}/reject',  [ComplianceController::class, 'reject']);
        Route::post('compliance/{id}/flag',    [ComplianceController::class, 'flag']);

        /* Supplier Import */
        Route::get('supplier-connections',     [SupplierImportController::class, 'connections']);
        Route::post('supplier-connections',    [SupplierImportController::class, 'addConnection']);
        Route::delete('supplier-connections/{id}', [SupplierImportController::class, 'removeConnection']);
        Route::post('supplier-connections/{id}/test', [SupplierImportController::class, 'testConnection']);
        Route::post('supplier-connections/{id}/fetch', [SupplierImportController::class, 'fetchProducts']);
        Route::get('supplier-products',        [SupplierImportController::class, 'products']);
        Route::get('supplier-duplicates',      [SupplierImportController::class, 'duplicates']);
        Route::post('supplier-import',         [SupplierImportController::class, 'import']);
        Route::get('supplier-import-jobs',     [SupplierImportController::class, 'jobs']);

        /* Admin Settings */
        Route::get('settings',                 [AdminSettingController::class, 'index']);
        Route::put('settings',                 [AdminSettingController::class, 'update']);
    });
});
