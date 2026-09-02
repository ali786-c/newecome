<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TelegramConfig extends Model
{
    use HasFactory;

    protected $fillable = ['config', 'commands', 'permissions'];

    protected function casts(): array
    {
        return [
            'config'      => 'array',
            'commands'    => 'array',
            'permissions' => 'array',
        ];
    }
}
