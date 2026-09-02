<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChannelPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'channel',    // discord | telegram
        'product_id',
        'trigger',    // random | new | update | manual | blog
        'message',
        'status',     // sent | failed | queued
        'error',
    ];

    protected $casts = [
        'product_id' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
