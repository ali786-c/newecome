<?php

namespace App\Jobs;

use App\Models\BlogKeyword;
use App\Models\BlogPost;
use App\Models\BlogAutomationConfig;
use App\Services\AIBloggingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class GenerateAIBlogJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected BlogKeyword $keyword;
    
    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(BlogKeyword $keyword)
    {
        $this->keyword = $keyword;
    }

    /**
     * Execute the job.
     */
    public function handle(AIBloggingService $aiService): void
    {
        try {
            Log::channel('automation')->info("Executing GenerateAIBlogJob for keyword: {$this->keyword->keyword}");

            $config = BlogAutomationConfig::first();
            $result = $aiService->generateFullBlog($this->keyword->keyword);

            if ($result['status'] === 'success') {
                // Create the Blog Post
                $post = BlogPost::create([
                    'title'            => $result['title'],
                    'slug'             => $result['slug'],
                    'content'          => $result['content'],
                    'excerpt'          => $result['excerpt'],
                    'image_url'        => $result['image_url'],
                    'meta_title'       => $result['meta_title'],
                    'meta_description' => $result['meta_description'],
                    'status'           => 'published', // Always publish for now
                    'published_at'     => now(),
                    'author_id'        => 1, // Default to admin
                ]);

                // Update Keyword Stats
                $this->keyword->increment('usage_count');
                $this->keyword->update(['last_used_at' => now()]);

                // Share to Telegram
                try {
                    (new \App\Services\TelegramService())->sendBlogPost($post);
                } catch (Exception $e) {
                    Log::channel('automation')->warning("Telegram sharing failed: " . $e->getMessage());
                }

                Log::channel('automation')->info("Success: AI Blog Created for '{$this->keyword->keyword}'");
            }

        } catch (Exception $e) {
            Log::channel('automation')->error("GenerateAIBlogJob Failed: " . $e->getMessage());
            
            // Update UI about the failure
            \Illuminate\Support\Facades\Cache::put('ai_blog_generation_status', [
                'active' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'percentage' => 0,
                'last_updated' => now()->toISOString()
            ], 300);

            throw $e;
        }
    }
}
