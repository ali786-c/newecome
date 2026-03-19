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
     */
    public function generateFullBlog(string $keyword): array
    {
        Log::info("Starting AI Blog Generation for: {$keyword}");

        // Step 1: AI Strategy (Gemini 2.5 Flash)
        $strategyPrompt = "You are an expert content strategist. Create a detailed blog writing prompt for the keyword: '{$keyword}'. Include target audience, random tone choice (professional, casual, etc.), H2/H3 structure, and SEO instructions. Return ONLY the prompt.";
        $writingPrompt = $this->gemini->generateText($strategyPrompt);

        // Step 2: Content Drafting (Gemini 2.5 Flash)
        $fullDraft = $this->gemini->generateText($writingPrompt);

        // Step 3: Structure Extraction
        $title = $this->extractTitle($fullDraft) ?? Str::title($keyword);
        $headings = $this->extractHeadings($fullDraft);

        // Step 4: Visual Strategy (Gemini 2.5 Flash)
        // Step 5: Image Generation (Gemini 3.1 Flash Image)
        $images = [];
        $featuredImagePrompt = "A high-quality, modern featured image for a blog post titled: '{$title}'. Focus on the keyword '{$keyword}'.";
        $images['featured'] = $this->processImage($featuredImagePrompt);

        foreach ($headings as $index => $h2) {
            $imagePrompt = "An illustrative, sleek image representing: '{$h2}'. Minimalist and high-quality.";
            $images["h2_{$index}"] = $this->processImage($imagePrompt);
        }

        // Step 6: HTML Assembly
        $htmlContent = $this->assembleHtml($fullDraft, $images);

        // Step 7: SEO Mastery
        $slug = Str::slug($title) . '-' . Str::random(4);
        $metaDescription = $this->gemini->generateText("Summarize this blog post into a 150-character SEO meta description: {$fullDraft}");

        // Step 8: Structured Payload
        return [
            'title' => $title,
            'slug' => $slug,
            'content' => $htmlContent,
            'excerpt' => Str::limit(strip_tags($fullDraft), 200),
            'meta_title' => $title,
            'meta_description' => $metaDescription,
            'featured_image' => $images['featured'],
            'status' => 'success'
        ];
    }

    protected function extractTitle(string $text): ?string
    {
        preg_match('/^#\s+(.+)$/m', $text, $matches);
        return $matches[1] ?? null;
    }

    protected function extractHeadings(string $text): array
    {
        preg_match_all('/^##\s+(.+)$/m', $text, $matches);
        return array_slice($matches[1] ?? [], 0, 4); // Take max 4 headings for images
    }

    protected function processImage(string $prompt): string
    {
        $base64 = $this->gemini->generateImage($prompt);
        if (!$base64) return '/assets/blog-default.jpg';

        $filename = 'blog/ai_' . uniqid() . '.png';
        Storage::disk('public')->put($filename, base64_decode($base64));

        return Storage::url($filename);
    }

    protected function assembleHtml(string $markdown, array $images): string
    {
        // Simple MD to HTML converter (can use a proper library later)
        $html = $markdown;
        
        // Convert Headings
        $html = preg_replace('/^###\s+(.+)$/m', '<h3>$1</h3>', $html);
        $html = preg_replace('/^##\s+(.+)$/m', '<h2>$1</h2>', $html);
        $html = preg_replace('/^#\s+(.+)$/m', '<h1>$1</h1>', $html);
        
        // Inject Images after each H2
        $headingCount = 0;
        $html = preg_replace_callback('/<\/h2>/', function($matches) use (&$headingCount, $images) {
            $key = "h2_{$headingCount}";
            $imgTag = isset($images[$key]) ? '<div class="blog-image"><img src="'.$images[$key].'" alt="Blog Image"/></div>' : '';
            $headingCount++;
            return '</h2>' . $imgTag;
        }, $html);

        return nl2br($html); // Basic line break handling
    }
}
