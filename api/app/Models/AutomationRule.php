<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutomationRule extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'trigger', 'conditions', 'actions', 'is_enabled'];

    protected function casts(): array
    {
        return [
            'conditions' => 'array',
            'actions'    => 'array',
            'is_enabled' => 'boolean',
        ];
    }
}
