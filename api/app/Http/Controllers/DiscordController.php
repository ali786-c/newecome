<?php

namespace App\Http\Controllers;

use App\Models\DiscordConfig;
use App\Models\ChannelPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DiscordController extends Controller
{
    public function getConfig(): JsonResponse
    {
        return response()->json(['data' => DiscordConfig::first()]);
    }

    public function updateConfig(Request $request): JsonResponse
    {
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['config' => $request->all()]);
        return response()->json(['data' => $cfg, 'message' => 'Discord config updated.']);
    }

    public function commands(): JsonResponse
    {
        $cfg = DiscordConfig::first();
        return response()->json(['data' => $cfg?->commands ?? []]);
    }

    public function updateCommands(Request $request): JsonResponse
    {
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['commands' => $request->all()]);
        return response()->json(['data' => $cfg->commands, 'message' => 'Commands updated.']);
    }

    public function permissions(): JsonResponse
    {
        $cfg = DiscordConfig::first();
        return response()->json(['data' => $cfg?->permissions ?? []]);
    }

    public function updatePermissions(Request $request): JsonResponse
    {
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['permissions' => $request->all()]);
        return response()->json(['data' => $cfg->permissions, 'message' => 'Permissions updated.']);
    }

    public function postHistory(Request $request): JsonResponse
    {
        $posts = ChannelPost::where('channel', 'discord')->orderBy('created_at', 'desc')->paginate(15);
        return response()->json($posts);
    }

    public function push(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string', 'product_id' => 'nullable|exists:products,id']);

        ChannelPost::create([
            'channel'    => 'discord',
            'product_id' => $request->product_id,
            'message'    => $request->message,
            'status'     => 'sent',
        ]);

        return response()->json(['message' => 'Pushed to Discord.']);
    }

    public function alerts(): JsonResponse
    {
        $cfg = DiscordConfig::first();
        return response()->json(['data' => $cfg?->alerts ?? []]);
    }

    public function updateAlerts(Request $request): JsonResponse
    {
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['alerts' => $request->all()]);
        return response()->json(['data' => $cfg->alerts, 'message' => 'Alerts updated.']);
    }
}
