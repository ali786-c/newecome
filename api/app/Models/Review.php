<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'author_name',
        'rating',
        'comment',
        'is_approved',
        'is_verified',
        'status',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_verified' => 'boolean',
        'rating' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
