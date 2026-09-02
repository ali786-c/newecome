<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogKeyword extends Model
{
    use HasFactory;

    protected $fillable = [
        'keyword',
        'usage_count',
        'last_used_at',
        'status',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];
}
