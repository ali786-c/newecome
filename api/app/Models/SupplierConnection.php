<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierConnection extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'endpoint', 'api_key', 'config', 'balance', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'api_key'   => 'encrypted',
            'config'    => 'array',
            'balance'   => 'decimal:2',
        ];
    }

    public function products()
    {
        return $this->hasMany(SupplierProduct::class, 'connection_id');
    }
}
