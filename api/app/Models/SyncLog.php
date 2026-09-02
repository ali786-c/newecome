<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    use HasFactory;

    protected $fillable = ['channel', 'event', 'status', 'payload', 'error', 'duration_ms'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }
}
