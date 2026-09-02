<?php

namespace App\Http\Controllers;

use App\Models\BlogKeyword;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminBlogKeywordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $keywords = BlogKeyword::query()
            ->when($request->search, fn ($q) => $q->where('keyword', 'like', "%{$request->search}%"))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($keywords);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'keyword' => 'required|string|unique:blog_keywords,keyword|max:255',
        ]);

        $keyword = BlogKeyword::create($data);

        return response()->json(['data' => $keyword, 'message' => 'Keyword added.'], 201);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $request->validate([
            'keywords' => 'required|array',
            'keywords.*' => 'required|string|max:255',
        ]);

        $added = 0;
        foreach ($request->keywords as $kw) {
            $keyword = trim($kw);
            if (!empty($keyword)) {
                BlogKeyword::firstOrCreate(['keyword' => $keyword]);
                $added++;
            }
        }

        return response()->json(['message' => "Successfully added {$added} keywords."]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $keyword = BlogKeyword::findOrFail($id);

        $data = $request->validate([
            'keyword' => 'sometimes|string|max:255|unique:blog_keywords,keyword,' . $id,
            'status'  => 'sometimes|in:active,retired',
        ]);

        $keyword->update($data);

        return response()->json(['data' => $keyword, 'message' => 'Keyword updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogKeyword::findOrFail($id)->delete();
        return response()->json(['message' => 'Keyword deleted.']);
    }
}
