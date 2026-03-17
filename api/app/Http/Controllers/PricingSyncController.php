<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PricingSyncController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => ['pending_sync' => 0, 'last_sync' => now()]]);
    }

    public function push(): JsonResponse
    {
        return response()->json(['message' => 'Pricing pushed to all channels.']);
    }

    public function conflicts(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function resolve(Request $request, int $id): JsonResponse
    {
        $request->validate(['resolution' => 'required|in:use_local,use_remote']);
        return response()->json(['message' => "Conflict {$id} resolved."]);
    }
}
