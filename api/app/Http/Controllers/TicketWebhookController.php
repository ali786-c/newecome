<?php

namespace App\Http\Controllers;

use App\Models\TicketWebhookConfig;
use App\Models\TicketWebhookLog;
use App\Services\TicketNotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TicketWebhookController extends Controller
{
    public function getConfig(): JsonResponse
    {
        $cfg = TicketWebhookConfig::firstOrCreate(['id' => 1], [
            'notify_on_create' => true,
            'notify_on_reply' => true,
            'notify_on_staff_reply' => true,
            'notify_on_status_change' => true,
            'notify_on_close' => true,
            'include_message_preview' => true,
        ]);
        
        // Frontend expects 'discord_webhook_url_set' instead of full URL for security if needed, 
        // but since this is admin API, we can return the URL or a flag.
        // Frontend uses 'discord_webhook_url_set: boolean' in the interface.
        
        $data = $cfg->toArray();
        $data['discord_webhook_url_set'] = !empty($cfg->discord_webhook_url);
        
        return response()->json(['data' => $data]);
    }

    public function updateConfig(Request $request): JsonResponse
    {
        $cfg = TicketWebhookConfig::firstOrCreate(['id' => 1]);
        $cfg->update($request->all());
        
        $data = $cfg->toArray();
        $data['discord_webhook_url_set'] = !empty($cfg->discord_webhook_url);
        
        return response()->json(['data' => $data, 'message' => 'Ticket webhook configuration updated.']);
    }

    public function testNotification(Request $request): JsonResponse
    {
        $request->validate(['channel' => 'required|in:telegram,discord']);
        
        $service = new TicketNotificationService();
        $success = $service->sendTest($request->channel);

        if ($success) {
            return response()->json(['data' => ['success' => true], 'message' => 'Test notification sent successfully.']);
        }

        return response()->json(['data' => ['success' => false], 'message' => 'Failed to send test notification. Check your configuration.'], 400);
    }

    public function getDispatchLog(Request $request): JsonResponse
    {
        $logs = TicketWebhookLog::orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);
        return response()->json($logs);
    }

    public function setDiscordUrl(Request $request): JsonResponse
    {
        $request->validate(['webhook_url' => 'required|url']);
        $cfg = TicketWebhookConfig::firstOrCreate(['id' => 1]);
        $cfg->update([
            'discord_webhook_url' => $request->webhook_url,
            'discord_enabled' => true
        ]);

        return response()->json([
            'data' => array_merge($cfg->toArray(), ['discord_webhook_url_set' => true]),
            'message' => 'Ticket Discord webhook URL updated.'
        ]);
    }
}
