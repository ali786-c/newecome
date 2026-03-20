<?php

namespace App\Http\Controllers;

use App\Models\SupplierConnection;
use App\Models\SupplierProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class SupplierImportController extends Controller
{
    /**
     * List all supplier connections.
     */
    public function connections(): JsonResponse
    {
        return response()->json(['data' => SupplierConnection::all()]);
    }

    /**
     * List cached products from suppliers.
     */
    public function products(Request $request): JsonResponse
    {
        $query = SupplierProduct::with('connection')
            ->when($request->connection_id, fn ($q) => $q->where('connection_id', $request->connection_id))
            ->when($request->search, fn ($q) => $q->where('name', 'like', '%' . $request->search . '%'))
            ->when($request->category, fn ($q) => $q->where('category', $request->category));

        return response()->json($query->paginate($request->get('per_page', 25)));
    }

    /**
     * Import a single product or bulk import.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'supplier_product_id' => 'required|exists:supplier_products,id',
            'margin_percentage'   => 'nullable|numeric|min:0',
            'category_id'          => 'nullable|exists:categories,id',
        ]);

        $sp = SupplierProduct::findOrFail($request->supplier_product_id);
        
        // Check if already imported
        $existing = Product::where('supplier_id', $sp->connection_id)
            ->where('supplier_product_id', $sp->external_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Product already imported.', 'product' => $existing], 422);
        }

        $margin = $request->get('margin_percentage', 10);
        $costPrice = $sp->price;
        $salePrice = $costPrice * (1 + ($margin / 100));

        $product = Product::create([
            'name'                => $sp->name,
            'slug'                => Str::slug($sp->name) . '-' . Str::random(5),
            'description'         => $sp->description,
            'price'               => $salePrice,
            'cost_price'          => $costPrice,
            'margin_percentage'   => $margin,
            'supplier_id'         => $sp->connection_id,
            'supplier_product_id' => $sp->external_id,
            'category_id'         => $request->category_id,
            'status'              => 'draft',
            'stock_status'        => 'in_stock',
            'compliance_status'   => 'pending_review',
            'image_url'           => $sp->data['logoUrls'][0] ?? null, // Extract logo from Reloadly data if available
        ]);

        return response()->json([
            'message' => 'Product imported successfully.',
            'product' => $product
        ]);
    }

    /**
     * Fetch latest products from a supplier (triggers sync command logic).
     */
    public function fetchProducts(int $id): JsonResponse
    {
        $conn = SupplierConnection::findOrFail($id);
        
        // In a real scenario, this would trigger the Artisan command or a Job
        // For now, we return a message suggesting to run the command or we could use Artisan::call
        \Illuminate\Support\Facades\Artisan::call('app:sync-supplier-products', ['--supplier' => $id]);
        
        return response()->json(['message' => 'Sync task started in background.']);
    }
}
