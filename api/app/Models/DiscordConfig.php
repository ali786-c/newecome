<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscordConfig extends Model
{
    use HasFactory;

    protected $fillable = ['config', 'commands', 'permissions', 'alerts'];

    protected $appends = [
        'webhook_url_set', 
        'bot_token_set', 
        'alert_webhook_url_set',
        'blog_auto_post',
        'product_new_auto_post',
        'product_update_auto_post',
        'product_random_auto_post'
    ];

    protected function casts(): array
    {
        return [
            'config'      => 'array',
            'commands'    => 'array',
            'permissions' => 'array',
            'alerts'      => 'array',
        ];
    }

    /* ── Accessors for Frontend ── */

    public function getWebhookUrlSetAttribute(): bool
    {
        return !empty($this->config['webhook_url'] ?? '');
    }

    public function getBotTokenSetAttribute(): bool
    {
        return !empty($this->config['bot_token'] ?? '');
    }

    public function getAlertWebhookUrlSetAttribute(): bool
    {
        return !empty($this->config['alert_webhook_url'] ?? '');
    }

    public function getBlogAutoPostAttribute(): bool
    {
        return (bool) ($this->config['blog_auto_post'] ?? false);
    }

    public function getProductNewAutoPostAttribute(): bool
    {
        return (bool) ($this->config['product_new_auto_post'] ?? false);
    }

    public function getProductUpdateAutoPostAttribute(): bool
    {
        return (bool) ($this->config['product_update_auto_post'] ?? false);
    }

    public function getProductRandomAutoPostAttribute(): bool
    {
        return (bool) ($this->config['product_random_auto_post'] ?? false);
    }
}
