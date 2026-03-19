<?php

namespace App\Http\Controllers;

use App\Models\BlogAutomationConfig;
use App\Models\BlogKeyword;
use App\Jobs\GenerateAIBlogJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class AdminBlogAutomationController extends Controller
{
    public function show(): JsonResponse
    {
        $config = BlogAutomationConfig::firstOrCreate([], [
            'posts_per_day' => 1,
            'mode' => 'draft',
            'default_tone' => 'professional',
            'model_text' => 'gemini-2.5-flash',
            'model_image' => 'gemini-3.1-flash-image-preview',
            'is_enabled' => false,
        ]);

        return response()->json(['data' => $config]);
    }

    public function update(Request $request): JsonResponse
    {
        $config = BlogAutomationConfig::first();

        $data = $request->validate([
            'posts_per_day' => 'sometimes|integer|min:1|max:24',
            'mode'          => 'sometimes|in:auto,draft',
            'default_tone'  => 'sometimes|string|max:255',
            'model_text'    => 'sometimes|string|max:255',
            'model_image'   => 'sometimes|string|max:255',
            'is_enabled'    => 'sometimes|boolean',
        ]);

        if ($config) {
            $config->update($data);
        } else {
            $config = BlogAutomationConfig::create($data);
        }

        return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
    }

    public function trigger()
    {
        // Increase time limit for this request (AI takes ~60s)
        set_time_limit(0);
        ignore_user_abort(true);

        // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
        $keyword = BlogKeyword::where('status', 'active')
            ->orderBy('last_used_at', 'asc')
            ->first();

        if (!$keyword) {
            return response()->json(['message' => 'No active keywords found.'], 400);
        }

        // Update usage tracking BEFORE dispatch to prevent race conditions
        $keyword->update([
            'last_used_at' => now(),
            'usage_count' => ($keyword->usage_count ?? 0) + 1
        ]);

        // Set initial status
        Cache::put('ai_blog_generation_status', [
            'active' => true,
            'message' => 'Engine Warming Up...',
            'percentage' => 5,
            'last_updated' => now()->toISOString()
        ], 300);

        // Run it IMMEDIATELY for manual clicks
        // dispatchSync will run it in the current request
        GenerateAIBlogJob::dispatchSync($keyword);

        return response()->json(['message' => 'AI Blog Generation completed.']);
    }

    public function status()
    {
        $status = Cache::get('ai_blog_generation_status', [
            'active' => false,
            'message' => 'Idle',
            'percentage' => 0
        ]);

        return response()->json($status);
    }
}
