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
                    
                    $products = $response['content'] ?? [];
                    $totalPages = $response['totalPages'] ?? 1;

                    if (empty($products)) {
                        break;
                    }

                    foreach ($products as $p) {
                        try {
                            // Extract the minimum price from FIXED or RANGE denominations
                            $minPrice = $p['minRecipientDenomination'] ?? ($p['fixedRecipientDenominations'][0] ?? 0);

                            // Update or Create the cached product
                            SupplierProduct::updateOrCreate(
                                [
                                    'connection_id' => $supplier->id,
                                    'external_id'   => $p['productId'] ?? $p['id'],
                                ],
                                [
                                    'name'        => $p['productName'] ?? $p['name'] ?? 'N/A',
                                    'description' => is_array($p['redeemInstruction'] ?? null) ? ($p['redeemInstruction']['concise'] ?? null) : null,
                                    'price'       => $minPrice,
                                    'category'    => $p['category']['name'] ?? $p['categoryName'] ?? 'General',
                                    'data'        => $p, // Store full raw data
                                    'status'      => 'available',
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
