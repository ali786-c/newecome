<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutomationChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'platform',
        'name',
        'target',
        'token',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
