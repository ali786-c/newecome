<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BlogPost;
use App\Services\AIBloggingService;
use Illuminate\Support\Facades\Log;

class UpgradeBlogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'blog:upgrade';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Upgrade existing blog posts to the new professional template using AI';

    /**
     * Execute the console command.
     */
    public function handle(AIBloggingService $aiService)
    {
        $posts = BlogPost::all();
        
        if ($posts->isEmpty()) {
            $this->info("No blog posts found to upgrade.");
            return;
        }

        $this->info("Found " . $posts->count() . " blog posts to upgrade. This may take a few minutes...");

        $bar = $this->output->createProgressBar(count($posts));
        $bar->start();

        foreach ($posts as $post) {
            try {
                $isUpgraded = str_contains($post->content, 'key-takeaways') && str_contains($post->content, 'cta-box');
                
                // 1. Fix Image Path (Reset-First-Sync)
                $iu = $post->image_url;
                if ($iu) {
                    // Remove ANY domain/protocol
                    $iu = preg_replace('/^http[s]?:\/\/[^\/]+/', '', $iu);
                    
                    // RESET prefixes to prevent double-prefixing
                    $iu = preg_replace('/^\/api/', '', $iu);
                    $iu = preg_replace('/^\/storage/', '', $iu);
                    $iu = preg_replace('/^api/', '', $iu);
                    $iu = preg_replace('/^storage/', '', $iu);
                    
                    // RE-BUILD CLEAN
                    $post->image_url = '/api/storage/' . ltrim($iu, '/');
                }

                // 2. Fix Content Image Paths (Scrub all legacy formats)
                $post->content = preg_replace('/src="([^"]*?)\/storage\//', 'src="/api/storage/', $post->content);
                $post->content = preg_replace('/src="storage\//', 'src="/api/storage/', $post->content);
                $post->content = preg_replace('/src="http[s]?:\/\/[^\/]+\/storage\//', 'src="/api/storage/', $post->content);
                // Prevent even double content prefix
                $post->content = str_replace('/api/storage/api/storage/', '/api/storage/', $post->content);
                $post->content = str_replace('/storage/api/storage/', '/api/storage/', $post->content);

                // 3. Upgrade Template if not done
                if (!$isUpgraded) {
                    $newContent = $aiService->refactorToTemplate($post->content);
                    if ($newContent) {
                        $post->content = $newContent;
                    }
                }

                $post->status = 'published';
                $post->published_at = $post->published_at ?? now();
                $post->save();

            } catch (\Exception $e) {
                Log::error("Failed to upgrade blog {$post->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("All blogs upgraded successfully! ✅");
    }
}
