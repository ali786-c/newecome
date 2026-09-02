<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'type', 'value', 'applies_to', 'target_ids',
        'valid_from', 'valid_until', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'target_ids'  => 'array',
            'value'       => 'decimal:2',
            'valid_from'  => 'datetime',
            'valid_until' => 'datetime',
            'is_active'   => 'boolean',
        ];
    }
}
