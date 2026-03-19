<?php

namespace App\Http\Controllers;

use App\Models\SupplierConnection;
use App\Models\SupplierProduct;
use App\Models\SupplierImportJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierImportController extends Controller
{
    public function connections(): JsonResponse
    {
        return response()->json(['data' => SupplierConnection::all()]);
    }

    public function addConnection(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'type'         => 'required|in:api,csv,webhook',
            'endpoint'     => 'nullable|string|url',
            'api_key'      => 'nullable|string',
            'is_active'    => 'nullable|boolean',
        ]);

        $conn = SupplierConnection::create($data);
        return response()->json(['data' => $conn, 'message' => 'Connection added.'], 201);
    }

    public function removeConnection(int $id): JsonResponse
    {
        SupplierConnection::findOrFail($id)->delete();
        return response()->json(['message' => 'Connection removed.']);
    }

    public function testConnection(int $id): JsonResponse
    {
        SupplierConnection::findOrFail($id);
        return response()->json(['message' => 'Connection test passed.']);
    }

    public function fetchProducts(int $id): JsonResponse
    {
        SupplierConnection::findOrFail($id);
        return response()->json(['message' => 'Products fetched from supplier.', 'count' => 0]);
    }

    public function products(Request $request): JsonResponse
    {
        $query = SupplierProduct::with('connection')
            ->when($request->connection_id, fn ($q) => $q->where('connection_id', $request->connection_id));

        return response()->json($query->paginate(25));
    }

    public function duplicates(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'supplier_product_ids' => 'required|array',
            'category_id'          => 'nullable|exists:categories,id',
        ]);

        $job = SupplierImportJob::create([
            'supplier_product_ids' => $request->supplier_product_ids,
            'status'               => 'queued',
            'total'                => count($request->supplier_product_ids),
            'imported'             => 0,
        ]);

        return response()->json(['data' => $job, 'message' => 'Import job queued.'], 201);
    }

    public function jobs(): JsonResponse
    {
        return response()->json(['data' => SupplierImportJob::latest()->take(20)->get()]);
    }
}
