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
    protected $factory;

    public function __construct(SupplierServiceFactory $factory)
    {
        $this->factory = $factory;
    }

    /**
     * Sync a single product's price and details from its supplier
     */
    public function syncProduct(Product $product): array
    {
        if (!$product->supplier_id || !$product->supplier_product_id) {
            throw new Exception("Product #{$product->id} is not mapped to a supplier.");
        }

        $supplier = SupplierConnection::findOrFail($product->supplier_id);
        $service = $this->factory->make($supplier);

        try {
            $details = $service->getProductDetails($product->supplier_product_id);
            
            // Extract cost based on supplier type
            $newCost = null;
            $newStock = null;

            if ($supplier->type === 'reloadly') {
                $newCost = $details['minRecipientDenomination'] ?? ($details['fixedRecipientDenominations'][0] ?? null);
            } elseif ($supplier->type === 'g2g') {
                // G2G details might come from a separate offer search in the service
                // For now, if details are just metadata, we try to fetch offers if service supports it
                if (method_exists($service, 'getOffers') && !empty($details['brand_id'])) {
                    $offers = $service->getOffers($details['brand_id']);
                    if (!empty($offers)) {
                        $newCost = $offers[0]['unit_price'] ?? null;
                        $newStock = $offers[0]['available_qty'] ?? null;
                    }
                }
            } else {
                // Generic fallback
                $newCost = $details['cost'] ?? $details['price'] ?? null;
                $newStock = $details['stock'] ?? $details['quantity'] ?? null;
            }
            
            if ($newCost === null) {
                throw new Exception("Could not retrieve cost price from supplier response.");
            }

            $oldPrice = $product->price;
            $product->cost_price = $newCost;
            
            if ($newStock !== null) {
                $product->stock = $newStock;
                $product->status = $newStock > 0 ? 'available' : 'out_of_stock';
            }
            
            // Calculate new selling price based on margin
            $margin = $product->margin_percentage ?? 0;
            $newPrice = $newCost * (1 + $margin / 100);
            
            $product->price = $newPrice;
            $product->last_sync_at = now();
            $product->save();

            return [
                'success' => true,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'cost' => $newCost,
                'stock' => $newStock
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
