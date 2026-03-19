<?php

namespace App\Services;

class BlogRenderer
{
    /**
     * Render the entire blog post as high-quality Tailwind HTML.
     */
    public function render(array $data, ?string $imageUrl = null): string
    {
        // Wrapper for the entire blog content
        $html = '<div class="blog-content space-y-12 text-slate-800 leading-relaxed">';

        // 1. Hero Section (Hook + Intro)
        $html .= $this->renderHero($data['hook'] ?? '', $data['intro'] ?? '');

        // 2. Key Takeaways Card
        if (!empty($data['takeaways'])) {
            $html .= $this->renderKeyTakeaways($data['takeaways']);
        }

        // 3. Body Sections
        if (!empty($data['sections'])) {
            foreach ($data['sections'] as $section) {
                $html .= $this->renderSection($section['heading'] ?? '', $section['content'] ?? '');
            }
        }

        // 4. FAQ Section
        if (!empty($data['faqs'])) {
            $html .= $this->renderFaq($data['faqs']);
        }

        // 5. CTA Block
        if (!empty($data['cta'])) {
            $html .= $this->renderCTA($data['cta']);
        }

        $html .= '</div>';

        return $html;
    }

    protected function renderHero(string $hook, string $intro): string
    {
        $hook = $this->formatContent($hook);
        $intro = $this->formatContent($intro);
        
        return <<<HTML
<div class="blog-hero mb-16">
    <div class="relative mb-8">
        <div class="absolute -left-4 top-0 w-1 h-full bg-primary/20 rounded-full"></div>
        <p class="text-2xl font-semibold text-primary italic leading-snug pl-4">"{$hook}"</p>
    </div>
    <div class="text-lg text-slate-600 first-letter:text-6xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-1 drop-cap">
        {$intro}
    </div>
</div>
HTML;
    }

    protected function renderKeyTakeaways(array $takeaways): string
    {
        $items = '';
        foreach ($takeaways as $item) {
            $item = $this->formatContent($item);
            $items .= <<<HTML
<li class="flex items-start gap-3 group">
    <span class="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">✓</span>
    <span class="text-slate-700 leading-tight">{$item}</span>
</li>
HTML;
        }

        return <<<HTML
<div class="bg-slate-50 border border-slate-200 rounded-3xl p-8 my-12 shadow-sm relative overflow-hidden">
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
    <h3 class="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Key Insights & Takeaways
    </h3>
    <ul class="space-y-4 list-none p-0">
        {$items}
    </ul>
</div>
HTML;
    }

    protected function renderSection(string $heading, string $content): string
    {
        $content = $this->formatContent($content);
        return <<<HTML
<section class="blog-section py-8">
    <h2 class="text-3xl font-black text-slate-900 mb-6 tracking-tight border-b-2 border-slate-100 pb-3 leading-tight" style="color: #000000 !important;">
        {$heading}
    </h2>
    <div class="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed blog-body-text">
        {$content}
    </div>
</section>
HTML;
    }

    protected function renderFaq(array $faqs): string
    {
        $items = '';
        foreach ($faqs as $faq) {
            $q = $this->formatContent($faq['q'] ?? $faq['question'] ?? '');
            $a = $this->formatContent($faq['a'] ?? $faq['answer'] ?? '');
            $items .= <<<HTML
<div class="mb-8 last:mb-0 p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
    <h4 class="text-xl font-extrabold text-slate-900 mb-3 flex items-start gap-3" style="color: #000000 !important;">
        <span class="flex-shrink-0 bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">Q</span>
        {$q}
    </h4>
    <div class="text-slate-700 pl-11 leading-relaxed font-medium">{$a}</div>
</div>
HTML;
        }

        return <<<HTML
<div class="bg-white border-2 border-slate-100 rounded-[2rem] p-10 my-16 shadow-sm">
    <h3 class="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3" style="color: #000000 !important;">
        <span class="w-3 h-8 bg-primary rounded-full"></span>
        Frequently Asked Questions
    </h3>
    <div class="faq-list">
        {$items}
    </div>
</div>
HTML;
    }

    protected function renderCTA(string $cta): string
    {
        $cta = $this->formatContent($cta);
        return <<<HTML
<div class="rounded-[2.5rem] p-12 text-center my-20 border shadow-2xl relative overflow-hidden" 
     style="background: #1f5141 !important; border-color: rgba(255,255,255,0.1);">
    
    <h3 class="text-3xl sm:text-4xl font-black mb-6 text-white leading-tight" style="color: #ffffff !important; margin-bottom: 24px !important;">
        Ready to level up your experience?
    </h3>
    <p class="text-xl text-white mb-12 max-w-2xl mx-auto leading-relaxed opacity-90" style="color: #ffffff !important; margin-bottom: 40px !important;">
        {$cta}
    </p>
    
    <a href="/products" class="inline-flex items-center justify-center px-14 py-6 bg-white text-[#1f5141] font-black text-xl rounded-full shadow-2xl hover:scale-105 hover:bg-slate-50 transition-all group no-underline" style="background-color: #ffffff !important; color: #1f5141 !important; text-decoration: none !important; min-width: 280px;">
        GET STARTED NOW
        <svg class="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="stroke-width: 3px;"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
    </a>
</div>
HTML;
    }

    /**
     * Convert simple text/placeholders to clean HTML.
     */
    protected function formatContent(string $text): string
    {
        // Convert **text** to <strong>text</strong>
        $text = preg_replace('/\*\*(.*?)\*\*/', '<strong class="font-bold text-slate-900">$1</strong>', $text);
        
        // Convert *text* to <em>text</em>
        $text = preg_replace('/\*(.*?)\*/', '<em class="italic">$1</em>', $text);

        // Convert newlines to breaks if it's a paragraph
        if (!str_contains($text, '<p>') && !str_contains($text, '<li>')) {
            $text = nl2br($text);
        }
        
        return $text;
    }
}
