<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierImportJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_product_ids', 'status', 'total', 'imported', 'errors',
    ];

    protected function casts(): array
    {
        return [
            'supplier_product_ids' => 'array',
            'errors'               => 'array',
        ];
    }
}
