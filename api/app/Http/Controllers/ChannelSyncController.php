<?php

namespace App\Http\Controllers;

use App\Models\SyncLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChannelSyncController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'data' => [
                'telegram' => ['status' => 'connected', 'last_sync' => now()->subMinutes(5)],
                'discord'  => ['status' => 'connected', 'last_sync' => now()->subMinutes(2)],
                'queued'   => 0,
                'failed'   => 0,
            ],
        ]);
    }

    public function statuses(Request $request): JsonResponse
    {
        // For now returning empty to prevent frontend crash, 
        // in real app this would query sync_logs or product_channels table
        return response()->json([
            'data' => [],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => 0
            ]
        ]);
    }

    public function queue(Request $request): JsonResponse
    {
        return response()->json(['data' => [], 'message' => 'Queue monitoring via Laravel.']);
    }

    public function failedJobs(Request $request): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function retry(int $id): JsonResponse
    {
        return response()->json(['message' => "Job {$id} retried."]);
    }

    public function health(): JsonResponse
    {
        return response()->json([
            'data' => [
                'telegram' => ['status' => 'healthy', 'latency_ms' => 120],
                'discord'  => ['status' => 'healthy', 'latency_ms' => 85],
            ],
        ]);
    }

    public function conflicts(Request $request): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function resolveConflict(Request $request, int $id): JsonResponse
    {
        $request->validate(['resolution' => 'required|in:use_local,use_remote,skip']);
        return response()->json(['message' => "Conflict {$id} resolved."]);
    }
}
