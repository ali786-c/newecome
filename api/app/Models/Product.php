<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'short_description',
        'price', 'compare_price', 'discount_label',
        'category_id', 'tags', 'status', 'stock_status',
        'image_url', 'telegram_enabled', 'discord_enabled',
        'random_post_eligible', 'compliance_status', 'internal_notes',
        'supplier_id', 'supplier_product_id', 'cost_price', 'margin_percentage', 'last_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'tags'                 => 'array',
            'price'                => 'decimal:2',
            'compare_price'        => 'decimal:2',
            'cost_price'           => 'decimal:2',
            'margin_percentage'    => 'decimal:2',
            'telegram_enabled'     => 'boolean',
            'discord_enabled'      => 'boolean',
            'random_post_eligible' => 'boolean',
            'last_sync_at'         => 'datetime',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function supplier()
    {
        return $this->belongsTo(SupplierConnection::class, 'supplier_id');
    }
}
