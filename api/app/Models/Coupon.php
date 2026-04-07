<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\Order;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_value',
        'max_uses',
        'used_count',
        'status',
        'expires_at',
        'first_order_only',
        'description',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'first_order_only' => 'boolean',
        'value' => 'float',
        'min_order_value' => 'float',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if coupon is valid for a given user and cart total.
     */
    public function isValid($user, float $total): array
    {
        if ($this->status !== 'active') {
            return ['valid' => false, 'message' => 'Coupon is not active.'];
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return ['valid' => false, 'message' => 'Coupon has expired.'];
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return ['valid' => false, 'message' => 'Coupon usage limit reached.'];
        }

        if ($total < $this->min_order_value) {
            return ['valid' => false, 'message' => "Minimum order value of {$this->min_order_value} required."];
        }

        if ($this->first_order_only && $user) {
            $hasPreviousOrders = Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->exists();
            if ($hasPreviousOrders) {
                return ['valid' => false, 'message' => 'This coupon is for first-time customers only.'];
            }
        }

        return ['valid' => true];
    }

    /**
     * Calculate discount for a given total.
     */
    public function calculateDiscount(float $total): float
    {
        if ($this->type === 'percentage') {
            return ($total * $this->value) / 100;
        }

        return min($this->value, $total);
    }
}
