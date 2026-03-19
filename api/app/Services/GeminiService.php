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
    public function generateText(string $prompt, string $model = 'gemini-2.0-flash'): string
    {
        try {
            $response = Http::post("{$this->baseUrl}{$model}:generateContent?key={$this->apiKey}", [
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
     * Generate image using Gemini Imagen models (Requires specific endpoint/model access).
     * Note: As of writing, Imagen API usually uses a different structure or vertex AI.
     * We will implement a standard Imagen 3 / Gemini Image wrapper.
     */
    public function generateImage(string $prompt, string $model = 'imagen-3.0-generate-001'): ?string
    {
        // Placeholder for Gemini Image Generation 
        // Note: Standard Gemini API (non-Vertex) for Imagen often requires a different payload.
        // If the user's specific model (gemini-3.1-flash-image-preview) is a multimodal model, 
        // it might return bytes directly.
        
        try {
            $response = Http::post("{$this->baseUrl}{$model}:predict?key={$this->apiKey}", [
                'instances' => [
                    ['prompt' => $prompt]
                ],
                'parameters' => [
                    'sampleCount' => 1,
                    'aspectRatio' => '1:1',
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Image Error: ' . $response->body());
                return null;
            }

            // Return base64 or temporary URL depending on API response
            return $response->json('predictions.0.bytesBase64Encoded'); 
        } catch (Exception $e) {
            Log::error('Gemini Image Service Exception: ' . $e->getMessage());
            return null;
        }
    }
}
