<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketWebhookConfig extends Model
{
    protected $fillable = [
        'telegram_enabled',
        'telegram_chat_id',
        'discord_enabled',
        'discord_webhook_url',
        'notify_on_create',
        'notify_on_reply',
        'notify_on_staff_reply',
        'notify_on_status_change',
        'notify_on_close',
        'notify_high_priority_only',
        'include_message_preview',
    ];

    protected $casts = [
        'telegram_enabled' => 'boolean',
        'discord_enabled' => 'boolean',
        'notify_on_create' => 'boolean',
        'notify_on_reply' => 'boolean',
        'notify_on_staff_reply' => 'boolean',
        'notify_on_status_change' => 'boolean',
        'notify_on_close' => 'boolean',
        'notify_high_priority_only' => 'boolean',
        'include_message_preview' => 'boolean',
    ];
}
