<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'supplier'])
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('slug', 'like', "%{$request->search}%"))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->sort_by, fn ($q) => $q->orderBy($request->sort_by, $request->sort_dir ?? 'asc'));

        $paginator = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last'  => $paginator->url($paginator->lastPage()),
                'prev'  => $paginator->previousPageUrl(),
                'next'  => $paginator->nextPageUrl(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json(['data' => $product]);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $product = Product::with('category')->where('slug', $slug)->firstOrFail();
        return response()->json(['data' => $product]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                 => 'required|string|max:255',
            'slug'                 => 'nullable|string|unique:products,slug',
            'description'          => 'required|string',
            'short_description'    => 'nullable|string|max:500',
            'price'                => 'required|numeric|min:0',
            'compare_price'        => 'nullable|numeric|min:0',
            'discount_label'       => 'nullable|string|max:50',
            'category_id'          => 'required|exists:categories,id',
            'tags'                 => 'nullable|array',
            'status'               => 'nullable|in:active,draft,archived',
            'stock_status'         => 'nullable|in:in_stock,out_of_stock,limited',
            'image_url'            => 'nullable|string|url',
            'telegram_enabled'     => 'nullable|boolean',
            'discord_enabled'      => 'nullable|boolean',
            'random_post_eligible' => 'nullable|boolean',
            'compliance_status'    => 'nullable|in:approved,pending_review,flagged,rejected',
            'internal_notes'       => 'nullable|string',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $product = Product::create($data);

        AuditLog::record('product_created', $product, auth()->user());

        return response()->json(['data' => $product->load('category'), 'message' => 'Product created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $old = $product->toArray();

        $data = $request->validate([
            'name'                 => 'sometimes|string|max:255',
            'slug'                 => "sometimes|string|unique:products,slug,{$id}",
            'description'          => 'sometimes|string',
            'short_description'    => 'nullable|string|max:500',
            'price'                => 'sometimes|numeric|min:0',
            'compare_price'        => 'nullable|numeric|min:0',
            'discount_label'       => 'nullable|string|max:50',
            'category_id'          => 'sometimes|exists:categories,id',
            'tags'                 => 'nullable|array',
            'status'               => 'sometimes|in:active,draft,archived',
            'stock_status'         => 'sometimes|in:in_stock,out_of_stock,limited',
            'image_url'            => 'nullable|string|url',
            'telegram_enabled'     => 'nullable|boolean',
            'discord_enabled'      => 'nullable|boolean',
            'random_post_eligible' => 'nullable|boolean',
            'compliance_status'    => 'nullable|in:approved,pending_review,flagged,rejected',
            'internal_notes'       => 'nullable|string',
        ]);

        $product->update($data);
        AuditLog::record('product_updated', $product, auth()->user(), ['old' => $old, 'new' => $product->toArray()]);

        return response()->json(['data' => $product->load('category'), 'message' => 'Product updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        AuditLog::record('product_deleted', $product, auth()->user());
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function duplicate(int $id): JsonResponse
    {
        $original = Product::findOrFail($id);
        $copy = $original->replicate();
        $copy->name = $original->name . ' (Copy)';
        $copy->slug = $original->slug . '-copy-' . now()->timestamp;
        $copy->status = 'draft';
        $copy->save();

        return response()->json(['data' => $copy->load('category'), 'message' => 'Product duplicated.'], 201);
    }

    public function bulkAction(Request $request): JsonResponse
    {
        $request->validate([
            'ids'     => 'required|array',
            'ids.*'   => 'integer|exists:products,id',
            'action'  => 'required|in:enable,disable,archive,assign_category,update_pricing,delete',
            'payload' => 'nullable|array',
        ]);

        $products = Product::whereIn('id', $request->ids);

        match ($request->action) {
            'enable'          => $products->update(['status' => 'active']),
            'disable'         => $products->update(['status' => 'draft']),
            'archive'         => $products->update(['status' => 'archived']),
            'assign_category' => $products->update(['category_id' => $request->payload['category_id']]),
            'update_pricing'  => $products->update(['price' => $request->payload['price']]),
            'delete'          => $products->delete(),
        };

        return response()->json(['message' => "Bulk action '{$request->action}' applied to " . count($request->ids) . ' products.']);
    }
}
