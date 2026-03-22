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
        $cfg->update(['config' => array_merge($cfg->config ?? [], $request->all())]);
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
        $cfg->update(['commands' => array_merge($cfg->commands ?? [], $request->all())]);
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
        
        // Handle partial update for a specific command
        if ($request->has('command') && $request->has('data')) {
            $perms = $cfg->permissions ?? [];
            $found = false;
            foreach ($perms as &$p) {
                if ($p['command'] === $request->command) {
                    $p = array_merge($p, $request->data);
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $perms[] = array_merge(['command' => $request->command], $request->data);
            }
            $cfg->update(['permissions' => $perms]);
        } else {
            // Fallback to full overwrite if data structure is different
            $cfg->update(['permissions' => $request->all()]);
        }
        
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
        $cfg->update(['alerts' => array_merge($cfg->alerts ?? [], $request->all())]);
        return response()->json(['data' => $cfg->alerts, 'message' => 'Alerts updated.']);
    }

    public function setWebhookUrl(Request $request): JsonResponse
    {
        $request->validate(['webhook_url' => 'required|url']);
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        
        $config = $cfg->config ?? [];
        $config['webhook_url'] = $request->webhook_url;
        $cfg->update(['config' => $config]);

        return response()->json(['data' => $cfg, 'message' => 'Product webhook URL updated.']);
    }

    public function setAlertWebhookUrl(Request $request): JsonResponse
    {
        $request->validate(['webhook_url' => 'required|url']);
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        
        $config = $cfg->config ?? [];
        $config['alert_webhook_url'] = $request->webhook_url;
        $cfg->update(['config' => $config]);

        return response()->json(['data' => $cfg, 'message' => 'Alert webhook URL updated.']);
    }

    public function setBotToken(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        
        $config = $cfg->config ?? [];
        $config['bot_token'] = $request->token;
        $cfg->update(['config' => $config]);

        return response()->json(['data' => $cfg, 'message' => 'Bot token updated.']);
    }

    public function test(): JsonResponse
    {
        $service = new \App\Services\DiscordService();
        $result = $service->sendTestMessage();

        if ($result['ok']) {
            return response()->json(['data' => ['success' => true], 'message' => $result['description']]);
        }

        return response()->json(['data' => ['success' => false], 'message' => $result['description']], 400);
    }
}
