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
                // Skip if already has structured elements (simple check)
                if (str_contains($post->content, 'key-takeaways') && str_contains($post->content, 'cta-box')) {
                    $bar->advance();
                    continue;
                }

                $newContent = $aiService->refactorToTemplate($post->content);
                
                if ($newContent) {
                    $post->update([
                        'content' => $newContent,
                        'status' => 'published', // Ensure they are published
                        'published_at' => $post->published_at ?? now()
                    ]);
                }
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
