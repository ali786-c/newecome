<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount('products')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->orderBy($request->sort_by ?? 'name', $request->sort_dir ?? 'asc');

        if ($request->paginate === 'false') {
            return response()->json(['data' => $query->get()]);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Category::withCount('products')->findOrFail($id)]);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $category = Category::withCount('products')
            ->with(['products' => fn ($q) => $q->where('status', 'active')->with('category')])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => $category]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:categories,id',
            'image_url'   => 'nullable|string|url',
        ]);

        $data['slug'] = Str::slug($data['name']);
        $category = Category::create($data);

        return response()->json(['data' => $category, 'message' => 'Category created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name'        => "sometimes|string|max:255|unique:categories,name,{$id}",
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:categories,id',
            'image_url'   => 'nullable|string|url',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json(['data' => $category, 'message' => 'Category updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->products()->update(['category_id' => null]);
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
