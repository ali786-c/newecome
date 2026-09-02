<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'action', 'auditable_type', 'auditable_id', 'payload', 'ip_address'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function record(string $action, Model $model, ?User $user = null, array $payload = []): self
    {
        return self::create([
            'user_id'        => $user?->id,
            'action'         => $action,
            'auditable_type' => get_class($model),
            'auditable_id'   => $model->getKey(),
            'payload'        => $payload,
            'ip_address'     => request()->ip(),
        ]);
    }
}
