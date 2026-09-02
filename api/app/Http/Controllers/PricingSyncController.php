<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PricingSyncController extends Controller
{
    public function settings(): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => 1,
                'auto_sync_on_price_change' => true,
                'sync_channels' => ['telegram', 'discord'],
                'approval_threshold_percent' => 20,
                'require_approval_above_threshold' => true,
                'telegram_command_enabled' => true,
                'discord_command_enabled' => true,
                'notify_on_mismatch' => true,
                'mismatch_threshold_percent' => 5,
                'batch_change_max_percent' => 50,
                'updated_at' => now()->toIso8601String(),
            ]
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Settings updated successfully.']);
    }

    public function conflicts(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function resolve(Request $request, int $id): JsonResponse
    {
        return response()->json(['message' => "Conflict {$id} resolved."]);
    }

    public function auditLog(): JsonResponse
    {
        return response()->json([
            'data' => [],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 20,
                'total' => 0
            ]
        ]);
    }

    public function approve(int $id): JsonResponse
    {
        return response()->json(['message' => "Price change {$id} approved."]);
    }

    public function reject(int $id): JsonResponse
    {
        return response()->json(['message' => "Price change {$id} rejected."]);
    }
}
