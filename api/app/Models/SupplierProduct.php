<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'connection_id', 'external_id', 'name', 'description',
        'price', 'category', 'image_url', 'data', 'status', 'last_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'data'  => 'array',
            'price' => 'decimal:2',
        ];
    }

    public function connection()
    {
        return $this->belongsTo(SupplierConnection::class, 'connection_id');
    }
}
