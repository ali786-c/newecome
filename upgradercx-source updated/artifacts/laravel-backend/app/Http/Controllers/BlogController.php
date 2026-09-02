<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::with('author')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when(!auth()->check() || !auth()->user()->isAdmin(), fn ($q) => $q->where('status', 'published'))
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->orderBy($request->sort_by ?? 'published_at', $request->sort_dir ?? 'desc');

        return response()->json($query->paginate($request->per_page ?? 10));
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $post = BlogPost::with('author')->where('slug', $slug)->firstOrFail();
        return response()->json(['data' => $post]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'excerpt'    => 'nullable|string|max:500',
            'image_url'  => 'nullable|string|url',
            'tags'       => 'nullable|array',
            'status'     => 'nullable|in:draft,published,scheduled,pending_review',
            'scheduled_at' => 'nullable|date',
        ]);

        $data['slug']      = Str::slug($data['title']) . '-' . now()->timestamp;
        $data['author_id'] = auth()->id();

        $post = BlogPost::create($data);

        return response()->json(['data' => $post->load('author'), 'message' => 'Post created.'], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'content'      => 'sometimes|string',
            'excerpt'      => 'nullable|string|max:500',
            'image_url'    => 'nullable|string|url',
            'tags'         => 'nullable|array',
            'status'       => 'sometimes|in:draft,published,scheduled,pending_review',
            'scheduled_at' => 'nullable|date',
        ]);

        $post->update($data);

        return response()->json(['data' => $post->load('author'), 'message' => 'Post updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Post deleted.']);
    }

    public function publish(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update(['status' => 'published', 'published_at' => now()]);
        return response()->json(['data' => $post, 'message' => 'Post published.']);
    }

    public function schedule(Request $request, int $id): JsonResponse
    {
        $request->validate(['scheduled_at' => 'required|date|after:now']);
        $post = BlogPost::findOrFail($id);
        $post->update(['status' => 'scheduled', 'scheduled_at' => $request->scheduled_at]);
        return response()->json(['data' => $post, 'message' => 'Post scheduled.']);
    }

    public function submitForReview(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update(['status' => 'pending_review']);
        return response()->json(['data' => $post, 'message' => 'Post submitted for review.']);
    }

    public function approve(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update(['status' => 'published', 'published_at' => now()]);
        return response()->json(['data' => $post, 'message' => 'Post approved and published.']);
    }
}
