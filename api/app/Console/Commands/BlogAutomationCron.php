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

        // Pick a random active keyword
        $keyword = BlogKeyword::where('status', 'active')
            ->orderByRaw('RANDOM()') // Using standard SQL random
            ->first();

        if (!$keyword) {
            $this->warn("No active keywords found for AI Blogging.");
            return;
        }

        // Dispatch the job
        GenerateAIBlogJob::dispatch($keyword);

        Log::info("BlogAutomationCron: Dispatched job for keyword: " . $keyword->keyword);
        $this->info("Dispatched generation for: " . $keyword->keyword);
    }
}
