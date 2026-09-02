<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketWebhookLog extends Model
{
    protected $fillable = [
        'event',
        'channel',
        'ticket_id',
        'ticket_subject',
        'status',
        'error_message',
    ];
}
