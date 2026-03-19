<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogAutomationConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'posts_per_day',
        'mode',
        'default_tone',
        'model_text',
        'model_image',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];
}
