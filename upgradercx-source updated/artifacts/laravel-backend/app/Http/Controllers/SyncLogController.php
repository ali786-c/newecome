<?php

namespace App\Http\Controllers;

use App\Models\SyncLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SyncLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SyncLog::when($request->channel, fn ($q) => $q->where('channel', $request->channel))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc');

        return response()->json($query->paginate($request->per_page ?? 25));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => SyncLog::findOrFail($id)]);
    }
}
