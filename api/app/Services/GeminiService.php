<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class GeminiService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', env('GOOGLE_GEMINI_API_KEY'));
    }

    /**
     * Generate text using Gemini models.
     */
    public function generateText(string $prompt, string $model = 'gemini-flash-latest'): string
    {
        try {
            $response = Http::withOptions(['verify' => false])
                ->post("{$this->baseUrl}{$model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 4096,
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Text Error: ' . $response->body());
                throw new Exception('Gemini API failed to generate text: ' . $response->json('error.message', 'Unknown error'));
            }

            return $response->json('candidates.0.content.parts.0.text', '');
        } catch (Exception $e) {
            Log::error('Gemini Service Exception: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate image using Gemini multimodal or Imagen.
     */
    public function generateImage(string $prompt, string $model = 'gemini-flash-latest'): ?string
    {
        try {
            // For multimodal models, we ask it to generate an image and return the data.
            // Note: Standard Gemini for developers often doesn't return pixels in generateContent 
            // unless it's a specific Imagen model or Vertex AI.
            // We will try gemini-flash-latest with a request for image data.
            
            $imagePrompt = "Generate a high-quality, professional image for a blog post based on: '{$prompt}'. Return the image data.";
            
            $response = Http::withOptions(['verify' => false])
                ->post("{$this->baseUrl}{$model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $imagePrompt]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Image Error: ' . $response->body());
                return null;
            }

            // If the model is not an image-generation model, it will return text.
            // We Check if it returned a part with data
            $data = $response->json('candidates.0.content.parts.0.inline_data.data');
            
            if (!$data) {
                Log::debug('Gemini Image Generation: No image data returned, model likely returned description or error.');
                return null;
            }

            return $data; 
        } catch (Exception $e) {
            Log::error('Gemini Image Service Exception: ' . $e->getMessage());
            return null;
        }
    }
}
