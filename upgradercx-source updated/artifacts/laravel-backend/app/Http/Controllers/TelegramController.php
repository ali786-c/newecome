<?php

namespace App\Http\Controllers;

use App\Models\TelegramConfig;
use App\Models\ChannelPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TelegramController extends Controller
{
    private function getConfig(): TelegramConfig
    {
        return TelegramConfig::firstOrCreate(['id' => 1], ['config' => [], 'commands' => [], 'permissions' => []]);
    }

    public function getConfig(): JsonResponse
    {
        return response()->json(['data' => $this->config()]);
    }

    public function updateConfig(Request $request): JsonResponse
    {
        $cfg = TelegramConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['config' => $request->all()]);
        return response()->json(['data' => $cfg, 'message' => 'Telegram config updated.']);
    }

    public function commands(): JsonResponse
    {
        $cfg = TelegramConfig::first();
        return response()->json(['data' => $cfg?->commands ?? []]);
    }

    public function updateCommands(Request $request): JsonResponse
    {
        $cfg = TelegramConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['commands' => $request->all()]);
        return response()->json(['data' => $cfg->commands, 'message' => 'Commands updated.']);
    }

    public function permissions(): JsonResponse
    {
        $cfg = TelegramConfig::first();
        return response()->json(['data' => $cfg?->permissions ?? []]);
    }

    public function updatePermissions(Request $request): JsonResponse
    {
        $cfg = TelegramConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['permissions' => $request->all()]);
        return response()->json(['data' => $cfg->permissions, 'message' => 'Permissions updated.']);
    }

    public function postHistory(Request $request): JsonResponse
    {
        $posts = ChannelPost::where('channel', 'telegram')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);
        return response()->json($posts);
    }

    public function push(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string', 'product_id' => 'nullable|exists:products,id']);

        ChannelPost::create([
            'channel'    => 'telegram',
            'product_id' => $request->product_id,
            'message'    => $request->message,
            'status'     => 'sent',
        ]);

        return response()->json(['message' => 'Pushed to Telegram.']);
    }

    private function config(): ?TelegramConfig
    {
        return TelegramConfig::first();
    }
}
