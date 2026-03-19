<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscordConfig extends Model
{
    use HasFactory;

    protected $fillable = ['config', 'commands', 'permissions', 'alerts'];

    protected function casts(): array
    {
        return [
            'config'      => 'array',
            'commands'    => 'array',
            'permissions' => 'array',
            'alerts'      => 'array',
        ];
    }
}
