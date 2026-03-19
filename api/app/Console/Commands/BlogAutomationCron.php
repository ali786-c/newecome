<?php

namespace App\Console\Commands;

use App\Models\BlogKeyword;
use App\Models\BlogAutomationConfig;
use App\Jobs\GenerateAIBlogJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BlogAutomationCron extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'blog:automation-cron';

    /**
     * The console command description.
     */
    protected $description = 'Trigger AI Blog Generation based on active keywords';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $config = BlogAutomationConfig::first();

        if (!$config || !$config->is_enabled) {
            $this->info("AI Blogging is disabled.");
            return;
        }

        // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
        $keyword = BlogKeyword::where('status', 'active')
            ->orderBy('last_used_at', 'asc')
            ->first();

        if (!$keyword) {
            $this->warn("No active keywords found for AI Blogging.");
            return;
        }

        // Update usage tracking BEFORE dispatch to prevent race conditions
        $keyword->update([
            'last_used_at' => now(),
            'usage_count' => ($keyword->usage_count ?? 0) + 1
        ]);

        // Dispatch the job
        GenerateAIBlogJob::dispatch($keyword);

        Log::info("BlogAutomationCron: Dispatched job for keyword: " . $keyword->keyword);
        $this->info("Dispatched generation for: " . $keyword->keyword);
    }
}
