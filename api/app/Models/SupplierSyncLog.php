<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierSyncLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id', 'status', 'items_synced', 'items_failed', 'details',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    public function supplier()
    {
        return $this->belongsTo(SupplierConnection::class, 'supplier_id');
    }
}
