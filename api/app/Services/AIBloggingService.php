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
    protected BlogRenderer $renderer;

    public function __construct(GeminiService $gemini, BlogRenderer $renderer)
    {
        $this->gemini = $gemini;
        $this->renderer = $renderer;
    }

    /**
     * The Full 8-Step "Nano Banana" Flow.
     * Upgraded for JSON Generation + Programmatic Rendering.
     */
    public function generateFullBlog(string $keyword): array
    {
        Log::info("Starting AI Blog Generation for: {$keyword}");
        $this->updateProgress(1, "Selecting random active keyword...", 5);

        // Step 1: Content Strategy & Planning
        $this->updateProgress(2, "Planning content strategy and structure...", 15);
        $strategyPrompt = "You are an expert content strategist and SEO specialist. 
        Create a detailed writing strategy for a blog post about: '{$keyword}'.
        Target: Premium, professional, authoritative tone.
        Return ONLY the strategy and outline.";
        
        $writingStrategy = $this->gemini->generateText($strategyPrompt);

        // Step 2: Content Drafting (JSON Generation)
        $this->updateProgress(3, "Drafting professional structured article (JSON)...", 40);
        $draftPrompt = "You are a world-class blog writer. Write a comprehensive, high-quality article based on this strategy:
        Strategy: {$writingStrategy}
        
        STRICT RULES:
        1. Return ONLY a valid JSON object. No Markdown blocks. No preamble.
        2. Word count: The cumulative content must exceed 600 words.
        
        JSON SCHEMA:
        {
          \"title\": \"Catchy SEO Title\",
          \"hook\": \"A short 1-sentence powerful insight to hook the reader\",
          \"intro\": \"A professional 2-3 paragraph introduction\",
          \"takeaways\": [\"Insight 1\", \"Insight 2\", \"Insight 3\"],
          \"sections\": [
            { \"heading\": \"H2 Heading\", \"content\": \"Detailed body content...\" },
            { \"heading\": \"H2 Heading\", \"content\": \"Detailed body content...\" }
          ],
          \"faqs\": [
            { \"question\": \"What is...?\", \"answer\": \"Long detailed answer...\" },
            { \"question\": \"How to...?\", \"answer\": \"Long detailed answer...\" }
          ],
          \"cta\": \"Original closing statement to encourage user engagement\"
        }";

        $jsonRaw = $this->gemini->generateText($draftPrompt);
        $data = json_decode($this->cleanJson($jsonRaw), true);

        if (!$data || !isset($data['title'])) {
            throw new Exception("AI failed to generate valid structured data.");
        }

        // Step 3: Title & SEO Extraction
        $this->updateProgress(4, "Optimizing title and extraction SEO metadata...", 60);
        $title = $data['title'];
        $slug = Str::slug($title) . '-' . Str::random(4);

        // Step 4: Visual Strategy (Featured Image)
        $this->updateProgress(5, "Designing premium featured image with AI...", 80);
        $featuredImagePrompt = "A high-quality, modern, professionally aesthetic featured image for a blog post titled: '{$title}'. Focus on the keyword '{$keyword}'. Minimalist, premium style.";
        $featuredImage = $this->processImage($featuredImagePrompt);

        // Step 5: SEO Mastery
        $this->updateProgress(6, "Finalizing SEO master and meta descriptions...", 90);
        $metaDescriptionPrompt = "Create a compelling 150-character SEO meta description for this blog content about: " . $title;
        $metaDescription = $this->gemini->generateText($metaDescriptionPrompt);

        // Step 7: Programmatic Rendering
        $this->updateProgress(7, "Rendering premium template and saving...", 95);
        $fullHtmlContent = $this->renderer->render($data, null); // We handle featured image separate in DB

        // Step 8: Complete
        $payload = [
            'title' => $title,
            'slug' => $slug,
            'content' => $fullHtmlContent,
            'excerpt' => $data['hook'] . ' ' . Str::limit(strip_tags($data['intro']), 150),
            'meta_title' => $title,
            'meta_description' => $metaDescription,
            'image_url' => $featuredImage,
            'status' => 'success'
        ];

        $this->updateProgress(8, "Generation complete! Article saved.", 100, false);
        return $payload;
    }

    protected function cleanJson(string $json): string
    {
        return preg_replace('/```json|```/', '', $json);
    }

    public function refactorToTemplate(string $oldHtml): string
    {
        Log::info("Refactoring existing blog content to professional template...");
        
        $prompt = "You are a world-class blog editor. I have an existing blog post in HTML that is plain and lacks structure. 
        Your task is to REFACTOR this HTML into a professional structured JSON article while PRESERVING all the original information.
        
        OLD HTML CONTENT:
        {$oldHtml}
        
        STRICT JSON RULES:
        1. Return ONLY valid JSON.
        2. Schema:
        {
          \"title\": \"Original Title\",
          \"hook\": \"A short 1-sentence hook\",
          \"intro\": \"Professional introduction\",
          \"takeaways\": [\"Insight 1\", \"Insight 2\"],
          \"sections\": [ { \"heading\": \"...\", \"content\": \"...\" } ],
          \"faqs\": [ { \"question\": \"...\", \"answer\": \"...\" } ],
          \"cta\": \"Closing statement\"
        }";

        $jsonRaw = $this->gemini->generateText($prompt);
        $data = json_decode($this->cleanJson($jsonRaw), true);

        if (!$data || !isset($data['title'])) {
            // Fallback if AI fails to return JSON
            return $oldHtml;
        }

        return $this->renderer->render($data);
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
