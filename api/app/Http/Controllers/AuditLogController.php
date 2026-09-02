<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user')
            ->when($request->action, fn ($q) => $q->where('action', 'like', "%{$request->action}%"))
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->from, fn ($q) => $q->where('created_at', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->where('created_at', '<=', $request->to))
            ->orderBy('created_at', 'desc');

        return response()->json($query->paginate($request->per_page ?? 25));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => AuditLog::with('user')->findOrFail($id)]);
    }
}
