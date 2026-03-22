<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\TicketWebhookConfig;
use App\Models\TicketWebhookLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TicketNotificationService
{
    public function notifyTicketCreated(Ticket $ticket)
    {
        $config = TicketWebhookConfig::first();
        if (!$config || !$config->notify_on_create) return;
        if ($config->notify_high_priority_only && !in_array($ticket->priority, ['high', 'urgent'])) return;

        $message = "🎫 *New Ticket Created*\n\n";
        $message .= "*Subject:* {$ticket->subject}\n";
        $message .= "*Priority:* " . ucfirst($ticket->priority) . "\n";
        $message .= "*User:* " . ($ticket->user?->name ?? "User #{$ticket->user_id}") . "\n";
        
        if ($config->include_message_preview && $ticket->messages()->exists()) {
            $firstMsg = $ticket->messages()->orderBy('created_at', 'asc')->first();
            $preview = Str::limit(strip_tags($firstMsg->message), 100);
            $message .= "\n*Message:* _{$preview}_";
        }

        $this->dispatch($message, $ticket, 'ticket.created');
    }

    public function notifyTicketReplied(Ticket $ticket, TicketMessage $ticketMessage)
    {
        $config = TicketWebhookConfig::first();
        if (!$config) return;

        $isStaff = (bool)$ticketMessage->is_staff;
        if ($isStaff && !$config->notify_on_staff_reply) return;
        if (!$isStaff && !$config->notify_on_reply) return;

        $role = $isStaff ? "Staff" : "User";
        $message = "💬 *New Reply from {$role}*\n\n";
        $message .= "*Ticket:* #{$ticket->id} - {$ticket->subject}\n";
        
        if ($config->include_message_preview) {
            $preview = Str::limit(strip_tags($ticketMessage->message), 150);
            $message .= "*Message:* _{$preview}_";
        }

        $this->dispatch($message, $ticket, $isStaff ? 'ticket.staff_replied' : 'ticket.replied');
    }

    public function notifyStatusChanged(Ticket $ticket)
    {
        $config = TicketWebhookConfig::first();
        if (!$config || !$config->notify_on_status_change) return;

        $message = "🔄 *Ticket Status Updated*\n\n";
        $message .= "*Ticket:* #{$ticket->id} - {$ticket->subject}\n";
        $message .= "*New Status:* " . ucfirst($ticket->status);

        if ($ticket->status === 'closed' && !$config->notify_on_close) return;

        $this->dispatch($message, $ticket, $ticket->status === 'closed' ? 'ticket.closed' : 'ticket.status_changed');
    }

    public function sendTest(string $channel)
    {
        $config = TicketWebhookConfig::first() ?? new TicketWebhookConfig();
        $message = "🧪 *Ticket Notification Test*\n\nThis is a test message from your UpgraderCX Support System. Your webhook configuration is working correctly!";
        
        if ($channel === 'telegram') {
            return $this->sendToTelegram($message, $config);
        } else {
            return $this->sendToDiscord($message, $config);
        }
    }

    protected function dispatch(string $message, Ticket $ticket, string $event)
    {
        $config = TicketWebhookConfig::first();
        if (!$config) return;

        if ($config->telegram_enabled && $config->telegram_chat_id) {
            $this->sendToTelegram($message, $config, $ticket, $event);
        }

        if ($config->discord_enabled && $config->discord_webhook_url) {
            $this->sendToDiscord($message, $config, $ticket, $event);
        }
    }

    protected function sendToTelegram(string $message, $config, Ticket $ticket = null, string $event = 'test')
    {
        $token = \App\Models\Setting::getValue('telegram_bot_token');
        $chatId = $config->telegram_chat_id;

        if (!$token || !$chatId) {
            if ($ticket) $this->log($event, 'telegram', $ticket, 'failed', 'Missing bot token or chat ID');
            return false;
        }

        try {
            $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text'    => $message,
                'parse_mode' => 'Markdown',
            ]);

            if ($ticket) {
                $status = $response->successful() ? 'sent' : 'failed';
                $error = $response->successful() ? null : $response->body();
                $this->log($event, 'telegram', $ticket, $status, $error);
            }

            return $response->successful();
        } catch (\Exception $e) {
            if ($ticket) $this->log($event, 'telegram', $ticket, 'failed', $e->getMessage());
            Log::error("Ticket Telegram Webhook Error: " . $e->getMessage());
            return false;
        }
    }

    protected function sendToDiscord(string $message, $config, Ticket $ticket = null, string $event = 'test')
    {
        $webhookUrl = $config->discord_webhook_url;
        if (!$webhookUrl) {
            if ($ticket) $this->log($event, 'discord', $ticket, 'failed', 'Missing Discord webhook URL');
            return false;
        }

        try {
            $discordMessage = str_replace(['*', '_'], ['**', '*'], $message);

            $payload = [
                'username' => 'UpgraderCX Support',
                'content' => $discordMessage,
            ];

            $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);

            if ($ticket) {
                $status = $response->successful() ? 'sent' : 'failed';
                $error = $response->successful() ? null : $response->body();
                $this->log($event, 'discord', $ticket, $status, $error);
            }

            return $response->successful();
        } catch (\Exception $e) {
            if ($ticket) $this->log($event, 'discord', $ticket, 'failed', $e->getMessage());
            Log::error("Ticket Discord Webhook Error: " . $e->getMessage());
            return false;
        }
    }

    protected function log(string $event, string $channel, Ticket $ticket, string $status, ?string $error)
    {
        TicketWebhookLog::create([
            'event' => $event,
            'channel' => $channel,
            'ticket_id' => $ticket->id,
            'ticket_subject' => $ticket->subject,
            'status' => $status,
            'error_message' => Str::limit($error, 500),
        ]);
    }
}
