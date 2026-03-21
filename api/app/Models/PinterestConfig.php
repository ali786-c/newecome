<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PinterestConfig extends Model
{
    use HasFactory;

    protected $fillable = ['config', 'boards', 'status'];

    protected $casts = [
        'config' => 'array',
        'boards' => 'array',
    ];
}
