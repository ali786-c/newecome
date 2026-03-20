<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SupplierConnection;
use App\Models\SupplierSyncLog;
use App\Services\Suppliers\SupplierServiceFactory;
use Exception;
use Illuminate\Support\Facades\Log;

class SupplierSyncService
{
    /**
     * Sync a single product's price and details from its supplier
     */
    public function syncProduct(Product $product): array
    {
        if (!$product->supplier_id || !$product->supplier_product_id) {
            throw new Exception("Product #{$product->id} is not mapped to a supplier.");
        }

        $supplier = SupplierConnection::findOrFail($product->supplier_id);
        $service = SupplierServiceFactory::make($supplier);

        try {
            $details = $service->getProductDetails($product->supplier_product_id);
            
            // Extract latest cost (min price)
            $newCost = $details['minRecipientDenomination'] ?? ($details['fixedRecipientDenominations'][0] ?? null);
            
            if ($newCost === null) {
                throw new Exception("Could not retrieve cost price from supplier.");
            }

            $oldPrice = $product->price;
            $product->cost_price = $newCost;
            
            // Calculate new selling price based on margin
            $margin = $product->margin_percentage ?? 0;
            $newPrice = $newCost * (1 + $margin / 100);
            
            // Only update if auto_apply is on OR if we just want to save the new cost
            $product->price = $newPrice;
            $product->last_sync_at = now();
            $product->save();

            return [
                'success' => true,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'cost' => $newCost,
            ];

        } catch (Exception $e) {
            Log::error("Supplier Sync Failed for Product #{$product->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sync all products for a specific supplier
     */
    public function syncAll(int $supplierId): array
    {
        $products = Product::where('supplier_id', $supplierId)
            ->whereNotNull('supplier_product_id')
            ->get();

        $synced = 0;
        $failed = 0;
        $errors = [];

        foreach ($products as $product) {
            try {
                $this->syncProduct($product);
                $synced++;
            } catch (Exception $e) {
                $failed++;
                $errors[] = "Product #{$product->id}: " . $e->getMessage();
            }
        }

        // Log to SupplierSyncLog
        SupplierSyncLog::create([
            'supplier_id' => $supplierId,
            'status'      => $failed > 0 ? 'partial' : 'success',
            'items_synced' => $synced,
            'items_failed' => $failed,
            'details'     => ['errors' => $errors],
        ]);

        return [
            'synced' => $synced,
            'failed' => $failed,
            'errors' => $errors
        ];
    }
}
