<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'content', 'excerpt',
        'image_url', 'tags', 'status',
        'author_id', 'published_at', 'scheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'tags'         => 'array',
            'published_at' => 'datetime',
            'scheduled_at' => 'datetime',
        ];
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
