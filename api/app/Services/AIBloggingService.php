<?php

namespace App\Services;

use App\Models\BlogKeyword;
use App\Models\BlogPost;
use App\Models\BlogAutomationConfig;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class AIBloggingService
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    /**
     * The Full 8-Step "Nano Banana" Flow.
     * Upgraded for 600 words + Raw HTML + Single Image + Status Tracking.
     */
    public function generateFullBlog(string $keyword): array
    {
        Log::info("Starting AI Blog Generation for: {$keyword}");
        $this->updateProgress(1, "Selecting random active keyword...", 5);

        // Step 1: Content Strategy & Planning
        $this->updateProgress(2, "Planning content strategy and structure...", 15);
        $strategyPrompt = "You are an expert content strategist and SEO specialist. 
        Create a detailed writing strategy for a blog post about: '{$keyword}'.
        Target Length: At least 600 words.
        Structure: Intro, 3-4 detailed H2 sections with bullet points or sub-sections, and a final conclusion.
        Tone: Authoritative yet engaging.
        Return ONLY the strategy and outline.";
        
        $writingStrategy = $this->gemini->generateText($strategyPrompt);

        // Step 2: Content Drafting (Directly in HTML)
        $this->updateProgress(3, "Drafting high-quality content (Min. 600 words)...", 40);
        $draftPrompt = "You are a professional blog writer. Write a comprehensive, high-quality blog post based on this strategy:
        Strategy: {$writingStrategy}
        
        STRICT RULES:
        1. Min word count: 600 words.
        2. Format: Return ONLY valid HTML. Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
        3. NO Markdown symbols (like ** or # or *). Use <strong> instead of **.
        4. NO headers like 'Blog Post Title' or 'Conclusion'. Just the HTML content.
        5. NO image placeholders like '[Blog Image]'.
        
        START with a single <h1> for the Title.";

        $fullHtmlDraft = $this->gemini->generateText($draftPrompt);

        // Step 3: Title & SEO Extraction
        $this->updateProgress(4, "Optimizing title and extraction SEO metadata...", 60);
        $title = $this->extractTitleFromHtml($fullHtmlDraft) ?? Str::title($keyword);
        $slug = Str::slug($title) . '-' . Str::random(4);

        // Step 4: Visual Strategy (Featured Image Only)
        $this->updateProgress(5, "Designing premium featured image with AI...", 80);
        $featuredImagePrompt = "A high-quality, modern, professionally aesthetic featured image for a blog post titled: '{$title}'. Focus on the keyword '{$keyword}'. Minimalist, premium style.";
        $featuredImage = $this->processImage($featuredImagePrompt);

        // Step 5: SEO Mastery
        $this->updateProgress(6, "Finalizing SEO master and meta descriptions...", 90);
        $metaDescriptionPrompt = "Create a compelling 150-character SEO meta description for this blog content: " . trim(strip_tags(Str::limit($fullHtmlDraft, 1000)));
        $metaDescription = $this->gemini->generateText($metaDescriptionPrompt);

        // Step 7: Finalizing Article & Database Entry
        $this->updateProgress(7, "Saving to database and finishing generation...", 95);

        // Step 8: Complete
        $payload = [
            'title' => $title,
            'slug' => $slug,
            'content' => $fullHtmlDraft,
            'excerpt' => Str::limit(strip_tags($fullHtmlDraft), 200), // Fixed reference
            'meta_title' => $title,
            'meta_description' => $metaDescription,
            'image_url' => $featuredImage,
            'status' => 'success'
        ];

        $this->updateProgress(8, "Generation complete! Article saved.", 100, false);
        return $payload;
    }

    protected function updateProgress(int $step, string $message, int $percentage, bool $active = true): void
    {
        \Illuminate\Support\Facades\Cache::put('ai_blog_generation_status', [
            'active' => $active,
            'step' => $step,
            'message' => $message,
            'percentage' => $percentage,
            'last_updated' => now()->toISOString()
        ], 300); // 5 min expiry
    }

    protected function extractTitleFromHtml(string $html): ?string
    {
        preg_match('/<h1>(.*?)<\/h1>/i', $html, $matches);
        return $matches[1] ?? null;
    }

    protected function processImage(string $prompt): string
    {
        try {
            $base64 = $this->gemini->generateImage($prompt);
            if (!$base64) return '/assets/blog-default.jpg';

            $filename = 'blog/ai_' . uniqid() . '.png';
            Storage::disk('public')->put($filename, base64_decode($base64));

            return Storage::url($filename);
        } catch (Exception $e) {
            Log::error("Image Gen failed: " . $e->getMessage());
            return '/assets/blog-default.jpg';
        }
    }
}
