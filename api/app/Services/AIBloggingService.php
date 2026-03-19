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
        $this->updateProgress(3, "Drafting professional structured article...", 40);
        $draftPrompt = "You are a world-class blog writer. Write a comprehensive, high-quality article based on this strategy:
        Strategy: {$writingStrategy}
        
        STRICT HTML STRUCTURE RULES:
        1. Return ONLY valid HTML. No Markdown.
        2. MIN Word count: 600 words.
        
        REQUIRED TEMPLATE SECTIONS (in order):
        - <h1>[Title]</h1>
        - <p class='intro-text'>[Engaging 2-3 sentence introduction]</p>
        - <div class='key-takeaways'><h3>Key Takeaways</h3><ul><li>...</li><li>...</li><li>...</li></ul></div>
        - <div class='blog-quote'><blockquote>[A powerful, relevant quote or insight]</blockquote></div>
        - <h2>[First Major Section]</h2><p>...</p>
        - <h2>[Second Major Section]</h2><p>...</p>
        - ... Additional sections ...
        - <div class='faq-section'><h3>Frequently Asked Questions</h3>
            <div class='faq-item'>
              <div class='faq-question'>? [Question]</div>
              <div class='faq-answer'>[Detailed Answer]</div>
            </div>
          </div>
        - <div class='cta-box'>
            <h3>Ready to upgrade your experience?</h3>
            <p>Don't settle for less. Join 200+ satisfied members on the best premium shared plans today.</p>
            <a href='/products' class='cta-button'>Get Started Now</a>
          </div>
        
        TIPS: Use <strong> and <em> sparingly. Ensure high-quality, professional writing.";

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

    public function refactorToTemplate(string $oldHtml): string
    {
        Log::info("Refactoring existing blog content to professional template...");
        
        $prompt = "You are a world-class blog editor. I have an existing blog post in HTML that is plain and lacks structure. 
        Your task is to REFACTOR this HTML into a professional structured article while PRESERVING all the original information.
        
        OLD HTML CONTENT:
        {$oldHtml}
        
        STRICT NEW STRUCTURE RULES:
        1. Return ONLY valid HTML. No Markdown.
        2. Use EXACTLY these sections and classes:
           - <p class='intro-text'>[A professional 2-3 sentence introduction]</p>
           - <div class='key-takeaways'><h3>Key Takeaways</h3><ul>[3-4 core points from the text]</ul></div>
           - <div class='blog-quote'><blockquote>[A powerful takeaway quote from the text]</blockquote></div>
           - <h2>[Main section headers]</h2>
           - <div class='faq-section'><h3>Frequently Asked Questions</h3>[Based on content, create 2 Q&A pairs if missing]</div>
           - <div class='cta-box'>
               <h3>Ready to upgrade your experience?</h3>
               <p>Join 200+ members on the best premium shared plans today.</p>
               <a href='/products' class='cta-button'>Get Started Now</a>
             </div>
        
        Keep the tone authoritative and premium.";

        return $this->gemini->generateText($prompt);
    }
}
