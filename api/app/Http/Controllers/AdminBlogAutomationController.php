<?php

namespace App\Http\Controllers;

use App\Models\BlogAutomationConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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

    public function trigger(): JsonResponse
    {
        $keyword = \App\Models\BlogKeyword::where('status', 'active')->inRandomOrder()->first();
        
        if (!$keyword) {
            return response()->json(['message' => 'No active keywords available. Please add some keywords to your portfolio first.'], 422);
        }

        \App\Jobs\GenerateAIBlogJob::dispatch($keyword);
        
        return response()->json(['message' => "Successfully started generation for '{$keyword->keyword}'. The blog post will appear in your list shortly."]);
    }
}

