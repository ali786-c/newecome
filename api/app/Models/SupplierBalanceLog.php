<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierBalanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_connection_id',
        'balance',
        'change',
        'status',
        'message',
    ];

    /**
     * Get the supplier connection that owns the log.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(SupplierConnection::class, 'supplier_connection_id');
    }
}
