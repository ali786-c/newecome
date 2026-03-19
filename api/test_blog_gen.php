<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use App\Services\AIBloggingService;
use App\Models\BlogPost;
use App\Models\User;

try {
    echo "Starting AI Blog Generation for testing...\n";
    $service = app(AIBloggingService::class);
    $result = $service->generateFullBlog('Top 5 Premium Subscriptions 2026');
    
    if ($result['status'] === 'success') {
        echo "Generation Success! Saving to database...\n";
        
        $admin = User::where('role', 'admin')->first() ?: User::first();
        
        $post = BlogPost::create([
            'title'            => $result['title'],
            'slug'             => $result['slug'],
            'content'          => $result['content'],
            'excerpt'          => $result['excerpt'],
            'image_url'        => $result['featured_image'],
            'meta_title'       => $result['meta_title'],
            'meta_description' => $result['meta_description'],
            'status'           => 'published',
            'published_at'     => now(),
            'author_id'        => $admin ? $admin->id : 1,
        ]);
        
        echo "SUCCESS! Blog live at: /blog/" . $post->slug . "\n";
    } else {
        echo "FAILED: Generation returned error status.\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
