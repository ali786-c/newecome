<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', auth()->id())
            ->when($request->unread_only, fn ($q) => $q->whereNull('read_at'))
            ->orderBy('created_at', 'desc');

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function markRead(int $id): JsonResponse
    {
        $notif = Notification::where('user_id', auth()->id())->findOrFail($id);
        $notif->update(['read_at' => now()]);
        return response()->json(['data' => $notif, 'message' => 'Marked as read.']);
    }

    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', auth()->id())->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function preferences(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json(['data' => $user->notification_preferences ?? []]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['notification_preferences' => $request->all()]);
        return response()->json(['data' => $user->notification_preferences, 'message' => 'Preferences updated.']);
    }
}
