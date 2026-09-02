<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChannelPost extends Model
{
    use HasFactory;

    protected $fillable = ['channel', 'product_id', 'message', 'status', 'error'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
