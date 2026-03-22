<?php

namespace App\Console\Commands;

use App\Models\SupplierConnection;
use App\Models\SupplierProduct;
use App\Models\SupplierSyncLog;
use App\Services\Suppliers\SupplierServiceFactory;
use Illuminate\Console\Command;
use Exception;

class SyncSupplierProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-supplier-products 
                            {--supplier= : Specific supplier ID to sync} 
                            {--mode=full : Sync mode (incremental or full)}
                            {--limit= : Limit total pages to fetch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and cache all products from active suppliers into the local database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $supplierId = $this->option('supplier');
        $mode       = $this->option('mode') ?: 'full';
        $limit      = $this->option('limit');
        
        $query = SupplierConnection::where('is_active', true);

        if ($supplierId) {
            $query->where('id', $supplierId);
        }

        $suppliers = $query->get();

        if ($suppliers->isEmpty()) {
            $this->warn("No active suppliers found to sync.");
            return;
        }

        foreach ($suppliers as $supplier) {
            $lockKey = "sync_supplier_{$supplier->id}";
            $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 3600);

            if (!$lock->get()) {
                $this->warn("Sync already in progress for supplier: {$supplier->name}. Skipping.");
                continue;
            }

            $this->info("Syncing products for supplier: {$supplier->name} ({$supplier->type}) [Mode: {$mode}]");
            
            try {
                $service = app(SupplierServiceFactory::class)->make($supplier);
                $page = 1; 
                $syncedCount = 0;
                $failedCount = 0;
                
                $maxPagesToFetch = ($mode === 'incremental') ? 3 : ($limit ?: 1000);

                do {
                    $this->comment("Fetching page {$page} of max {$maxPagesToFetch}...");
                    $response = $service->fetchProducts($page, 200);
                    
                    $products = $response['content'] ?? $response['docs'] ?? $response['data'] ?? $response;
                    if (!is_array($products)) $products = [];
                    
                    $totalPages = $response['totalPages'] ?? $response['total_pages'] ?? 1;

                    if (empty($products)) {
                        $this->info("No more products found on page {$page}.");
                        break;
                    }

                    foreach ($products as $p) {
                        try {
                            $formatted = $service->formatProductData($p);

                            SupplierProduct::updateOrCreate(
                                [
                                    'connection_id' => $supplier->id,
                                    'external_id'   => $p['productId'] ?? $p['id'] ?? $p['external_id'] ?? null,
                                ],
                                [
                                    'name'        => $formatted['name'],
                                    'description' => $formatted['description'],
                                    'price'       => $formatted['price'],
                                    'category'    => $formatted['category'],
                                    'image_url'   => $formatted['image_url'] ?? null,
                                    'data'        => $formatted['data'],
                                    'status'      => $formatted['status'] ?? 'available',
                                    'last_sync_at' => now(),
                                ]
                            );
                            $syncedCount++;
                        } catch (Exception $innerEx) {
                            $this->error("Failed to sync product ID " . ($p['productId'] ?? 'unknown') . ": " . $innerEx->getMessage());
                            $failedCount++;
                        }
                    }

                    if ($page >= $maxPagesToFetch || $page >= $totalPages) {
                        break;
                    }

                    $page++;
                } while (true);

                SupplierSyncLog::create([
                    'supplier_id' => $supplier->id,
                    'status'      => $failedCount > 0 ? ($syncedCount > 0 ? 'partial' : 'failed') : 'success',
                    'items_synced' => $syncedCount,
                    'items_failed' => $failedCount,
                    'details'     => [
                        'message' => "Sync [{$mode}] completed successfully.",
                        'mode'    => $mode,
                        'pages'   => $page
                    ],
                ]);

                $this->info("Successfully synced {$syncedCount} products for {$supplier->name}.");

            } catch (Exception $e) {
                $this->error("Critical error syncing supplier {$supplier->name}: " . $e->getMessage());
                
                SupplierSyncLog::create([
                    'supplier_id' => $supplier->id,
                    'status'      => 'failed',
                    'items_synced' => 0,
                    'items_failed' => 0,
                    'details'     => ['error' => $e->getMessage(), 'mode' => $mode],
                ]);
            } finally {
                $lock->release();
            }
        }

        $this->info("Sync process finished.");
    }
}
