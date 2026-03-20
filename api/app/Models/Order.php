<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'total', 'status', 'fulfillment_status', 'payment_method', 'payment_ref', 'notes',
    ];

    protected $appends = ['order_number'];

    public function getOrderNumberAttribute()
    {
        return '#' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
