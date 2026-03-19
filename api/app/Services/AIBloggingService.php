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
     * Upgraded for 600 words + Raw HTML + Single Image.
     */
    public function generateFullBlog(string $keyword): array
    {
        Log::info("Starting AI Blog Generation for: {$keyword}");

        // Step 1: Content Strategy & Planning
        $strategyPrompt = "You are an expert content strategist and SEO specialist. 
        Create a detailed writing strategy for a blog post about: '{$keyword}'.
        Target Length: At least 600 words.
        Structure: Intro, 3-4 detailed H2 sections with bullet points or sub-sections, and a final conclusion.
        Tone: Authoritative yet engaging.
        Return ONLY the strategy and outline.";
        
        $writingStrategy = $this->gemini->generateText($strategyPrompt);

        // Step 2: Content Drafting (Directly in HTML)
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
        $title = $this->extractTitleFromHtml($fullHtmlDraft) ?? Str::title($keyword);
        $slug = Str::slug($title) . '-' . Str::random(4);

        // Step 4: Visual Strategy (Featured Image Only)
        $featuredImagePrompt = "A high-quality, modern, professionally aesthetic featured image for a blog post titled: '{$title}'. Focus on the keyword '{$keyword}'. Minimalist, premium style.";
        $featuredImage = $this->processImage($featuredImagePrompt);

        // Step 5: SEO Mastery
        $metaDescriptionPrompt = "Create a compelling 150-character SEO meta description for this blog content: " . trim(strip_tags(Str::limit($fullHtmlDraft, 1000)));
        $metaDescription = $this->gemini->generateText($metaDescriptionPrompt);

        // Step 6: Structured Payload
        return [
            'title' => $title,
            'slug' => $slug,
            'content' => $fullHtmlDraft,
            'excerpt' => Str::limit(strip_tags($fullHtmlHtmlDraft ?? $fullHtmlDraft), 200),
            'meta_title' => $title,
            'meta_description' => $metaDescription,
            'image_url' => $featuredImage, // Correct column name is image_url
            'status' => 'success'
        ];
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
