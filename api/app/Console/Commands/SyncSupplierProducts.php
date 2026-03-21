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
    protected $signature = 'app:sync-supplier-products {--supplier= : Specific supplier ID to sync}';

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
            $this->info("Syncing products for supplier: {$supplier->name} ({$supplier->type})");
            
            try {
                $service = app(SupplierServiceFactory::class)->make($supplier);
                $page = 0; // Reloadly is 0-indexed
                $syncedCount = 0;
                $failedCount = 0;

                do {
                    $this->comment("Fetching page " . ($page + 1) . "...");
                    $response = $service->fetchProducts($page, 200);
                    
                    // Standardize product array and total pages based on provider response
                    $products = $response['content'] ?? $response['docs'] ?? $response['data'] ?? $response;
                    if (!is_array($products)) $products = [];
                    
                    $totalPages = $response['totalPages'] ?? $response['total_pages'] ?? 1;

                    if (empty($products)) {
                        break;
                    }

                    foreach ($products as $p) {
                        try {
                            $formatted = $service->formatProductData($p);

                            // Update or Create the cached product
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

                    $page++;
                } while ($page <= $totalPages);

                // Log the sync result
                SupplierSyncLog::create([
                    'supplier_id' => $supplier->id,
                    'status'      => $failedCount > 0 ? ($syncedCount > 0 ? 'partial' : 'failed') : 'success',
                    'items_synced' => $syncedCount,
                    'items_failed' => $failedCount,
                    'details'     => ['message' => 'Sync completed successfully.'],
                ]);

                $this->info("Successfully synced {$syncedCount} products for {$supplier->name}.");

            } catch (Exception $e) {
                $this->error("Critical error syncing supplier {$supplier->name}: " . $e->getMessage());
                
                $logData = [
                    'supplier_id' => $supplier->id,
                    'status'      => 'failed',
                    'items_synced' => 0,
                    'items_failed' => 0,
                    'details'     => ['error' => $e->getMessage()],
                ];
                $this->error("About to create log with: " . json_encode($logData));
                SupplierSyncLog::create($logData);
            }
        }

        $this->info("Sync process finished.");
    }
}
