<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'unit_price', 'subtotal', 'credentials', 'supplier_order_id', 'supplier_reference',
    ];

    protected $appends = ['total'];

    public function getTotalAttribute()
    {
        return $this->subtotal;
    }

    protected function casts(): array
    {
        return [
            'unit_price'  => 'decimal:2',
            'subtotal'    => 'decimal:2',
            'credentials' => 'encrypted:array',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
