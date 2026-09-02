<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'variant_label', 'quantity', 'unit_price', 'unit_cost', 
        'subtotal', 'credentials', 'supplier_order_id', 'supplier_reference',
        'unit_cost_orig', 'currency_orig',
    ];

    protected $appends = ['total'];

    public function getTotalAttribute()
    {
        return $this->subtotal;
    }

    protected function casts(): array
    {
        return [
            'unit_price'     => 'decimal:2',
            'unit_cost'      => 'decimal:2',
            'unit_cost_orig' => 'decimal:4',
            'subtotal'       => 'decimal:2',
            'credentials'    => 'array',
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
