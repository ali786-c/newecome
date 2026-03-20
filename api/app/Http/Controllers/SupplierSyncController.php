<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\SupplierConnection;
use App\Models\SupplierSyncLog;
use App\Services\SupplierSyncService;
use App\Jobs\SyncSupplierPricesJob;

class SupplierSyncController extends Controller
{
    protected $syncService;

    public function __construct(SupplierSyncService $syncService)
    {
        $this->syncService = $syncService;
    }
    /**
     * List product mappings (products linked to a supplier)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::whereNotNull('supplier_id')
            ->whereNotNull('supplier_product_id')
            ->with(['category', 'supplier']);

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $paginated = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ]
        ]);
    }

    /**
     * Update sync settings for a specific product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'margin_percentage' => 'nullable|numeric|min:0',
            'auto_apply'        => 'nullable|boolean',
        ]);

        if ($request->has('margin_percentage')) {
            $product->margin_percentage = $request->margin_percentage;
        }

        if ($request->has('auto_apply')) {
            $product->auto_apply = $request->auto_apply;
        }

        $product->save();

        return response()->json([
            'message' => 'Product sync settings updated',
            'data'    => $product
        ]);
    }

    /**
     * Trigger an immediate sync for a specific product
     */
    public function sync(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        try {
            $result = $this->syncService->syncProduct($product);
            return response()->json([
                'message' => 'Product sync completed successfully',
                'data'    => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Sync failed',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trigger sync for all products of a supplier
     */
    public function syncAll(Request $request): JsonResponse
    {
        $request->validate(['supplier_id' => 'required|exists:supplier_connections,id']);
        
        try {
            SyncSupplierPricesJob::dispatch($request->supplier_id);
            
            return response()->json([
                'message' => 'Bulk sync job has been queued in the background'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to queue sync job',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent sync logs
     */
    public function logs(): JsonResponse
    {
        $logs = SupplierSyncLog::with('supplier')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json(['data' => $logs]);
    }
}
