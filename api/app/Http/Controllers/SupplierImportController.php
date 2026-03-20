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
        $connections = SupplierConnection::all()->map(function ($conn) {
            return [
                'id'                 => $conn->id,
                'name'               => $conn->name,
                'provider'           => $conn->type,
                'status'             => $conn->is_active ? 'connected' : 'disconnected',
                'last_synced_at'     => $conn->updated_at->toISOString(),
                'products_available' => SupplierProduct::where('connection_id', $conn->id)->count(),
                'api_url'            => $conn->endpoint,
                'created_at'         => $conn->created_at->toISOString(),
                'updated_at'         => $conn->updated_at->toISOString(),
            ];
        });

        return response()->json(['data' => $connections]);
    }

    /**
     * List cached products from a specific supplier.
     */
    public function products(int $id, Request $request): JsonResponse
    {
        $query = SupplierProduct::where('connection_id', $id)
            ->when($request->search, fn ($q) => $q->where('name', 'like', '%' . $request->search . '%'))
            ->when($request->category, fn ($q) => $q->where('category', $request->category));

        $paginated = $query->paginate($request->get('per_page', 25));

        // Format for frontend
        $items = collect($paginated->items())->map(function ($sp) {
            return [
                'id'                => (string) $sp->id,
                'supplier_id'       => $sp->connection_id,
                'external_id'       => (string) $sp->external_id,
                'name'              => $sp->name,
                'description'       => $sp->description,
                'supplier_price'    => (float) $sp->price,
                'supplier_currency' => 'USD',
                'category_name'     => $sp->category,
                'image_url'         => $sp->data['logoUrls'][0] ?? $sp->data['image_url'] ?? null,
                'stock_status'      => 'in_stock',
                'attributes'        => (object) ($sp->data ?: []),
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ]
        ]);
    }

    /**
     * Fetch latest products from a supplier.
     */
    public function fetchProducts(int $id): JsonResponse
    {
        SupplierConnection::findOrFail($id);
        
        Artisan::call('app:sync-supplier-products', ['--supplier' => $id]);
        
        $count = SupplierProduct::where('connection_id', $id)->count();
        
        return response()->json([
            'data' => [
                'products_fetched' => $count
            ],
            'message' => 'Synchronization complete.'
        ]);
    }

    /**
     * Import products (Bulk or single).
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:supplier_products,id',
            'products.*.status' => 'nullable|string',
            'products.*.compliance_status' => 'nullable|string',
            'global_status' => 'nullable|string',
            'global_compliance' => 'nullable|string',
            'global_category_id' => 'nullable|string',
            'global_markup_value' => 'nullable|numeric',
            'global_markup_type' => 'nullable|string',
        ]);

        $importedCount = 0;
        $supplierId = null;

        // Global settings from request
        $globalStatus = $request->get('global_status', 'draft');
        $globalCompliance = $request->get('global_compliance', 'pending_review');
        $globalMarkupValue = $request->get('global_markup_value', 50);
        $globalMarkupType = $request->get('global_markup_type', 'percentage');
        $globalCategoryId = $request->get('global_category_id'); // can be 'auto' or a number

        foreach ($request->get('products') as $item) {
            $sp = SupplierProduct::findOrFail($item['product_id']);
            $supplierId = $sp->connection_id;
            
            // Check if already imported
            $exists = Product::where('supplier_id', $sp->connection_id)
                ->where('supplier_product_id', $sp->external_id)
                ->exists();

            if ($exists) continue;

            // Category Logic
            $targetCategoryId = $item['category_id'] ?? $globalCategoryId;
            if ($targetCategoryId === 'auto') {
                if (!empty($sp->category)) {
                    $category = Category::firstOrCreate(
                        ['name' => $sp->category],
                        ['slug' => Str::slug($sp->category)]
                    );
                    $targetCategoryId = $category->id;
                } else {
                    $targetCategoryId = null;
                }
            }

            $margin = $item['markup_value'] ?? $globalMarkupValue;
            $marginType = $item['markup_type'] ?? $globalMarkupType;
            
            if ($marginType === 'percentage') {
                $salePrice = floatval($sp->price) * (1 + (floatval($margin) / 100));
            } else {
                $salePrice = floatval($sp->price) + floatval($margin);
            }

            Product::create([
                'name'                => $item['custom_name'] ?? $sp->name,
                'slug'                => Str::slug($item['custom_name'] ?? $sp->name) . '-' . Str::random(5),
                'description'         => $item['custom_description'] ?? $sp->description ?? ($sp->name . ' product'),
                'price'               => (float) $salePrice,
                'cost_price'          => (float) $sp->price,
                'margin_percentage'   => (float) $margin,
                'category_id'         => $targetCategoryId,
                'status'              => $item['status'] ?? $globalStatus,
                'compliance_status'   => $item['compliance_status'] ?? $globalCompliance,
                'supplier_id'         => $sp->connection_id,
                'supplier_product_id' => $sp->external_id,
                'stock_status'        => $sp->stock_status ?? 'in_stock',
                'last_sync_at'        => now(),
                'image_url'           => $sp->data['logoUrls'][0] ?? $sp->data['image_url'] ?? null,
            ]);
            $importedCount++;
        }

        if ($supplierId) {
            SupplierSyncLog::create([
                'supplier_id' => $supplierId,
                'status' => 'completed',
                'items_synced' => $importedCount,
                'details' => ['type' => 'manual_import', 'message' => "Imported {$importedCount} selected products."]
            ]);
        }

        return response()->json([
            'data' => [
                'status' => 'completed',
                'products_imported' => $importedCount
            ],
            'message' => "Imported {$importedCount} products successfully."
        ]);
    }

    /**
     * List duplicates (placeholder).
     */
    public function duplicates(int $id): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    /**
     * List import jobs (based on sync logs).
     */
    public function jobs(): JsonResponse
    {
        $jobs = SupplierSyncLog::with('supplier')->latest()->take(50)->get()->map(function ($log) {
            $isImport = ($log->details['type'] ?? '') === 'manual_import';
            return [
                'id'                => $log->id,
                'supplier_id'       => $log->supplier_id,
                'supplier_name'     => $log->supplier->name ?? 'Unknown',
                'products_fetched'  => $isImport ? 0 : $log->items_synced,
                'products_imported' => $isImport ? $log->items_synced : 0,
                'products_skipped'  => 0,
                'duplicates_found'  => 0,
                'status'            => $log->status,
                'error_details'     => $log->status === 'failed' ? [$log->details['message'] ?? 'Unknown error'] : [],
                'created_at'        => $log->created_at->toISOString(),
                'type'              => $isImport ? 'import' : 'sync',
            ];
        });

        return response()->json(['data' => $jobs]);
    }
}
