<?php

namespace App\Http\Controllers;

use App\Models\PinterestConfig;
use App\Services\PinterestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PinterestController extends Controller
{
    protected $pinterestService;

    public function __construct(PinterestService $pinterestService)
    {
        $this->pinterestService = $pinterestService;
    }

    /**
     * Get the Pinterest configuration.
     */
    public function getConfig(): JsonResponse
    {
        $cfg = PinterestConfig::firstOrCreate(['id' => 1]);
        
        // Hide sensitive data like access/refresh tokens from frontend
        $config = $cfg->config ?? [];
        $sanitizedConfig = [
            'client_id' => $config['client_id'] ?? '',
            'client_secret_set' => !empty($config['client_secret']),
            'access_token_set' => !empty($config['access_token']),
            'board_id' => $config['board_id'] ?? '',
            'auto_post_enabled' => $config['auto_post_enabled'] ?? false,
        ];

        return response()->json([
            'data' => [
                'id' => $cfg->id,
                'config' => $sanitizedConfig,
                'boards' => $cfg->boards ?? [],
                'status' => $cfg->status,
            ]
        ]);
    }

    /**
     * Update the Pinterest configuration.
     */
    public function updateConfig(Request $request): JsonResponse
    {
        $cfg = PinterestConfig::firstOrCreate(['id' => 1]);
        $currentConfig = $cfg->config ?? [];
        
        $newData = $request->only(['client_id', 'client_secret', 'board_id', 'auto_post_enabled']);
        
        // Don't overwrite secret if not provided
        if (empty($newData['client_secret'])) {
            unset($newData['client_secret']);
        }

        $cfg->update([
            'config' => array_merge($currentConfig, $newData)
        ]);

        return response()->json(['message' => 'Pinterest configuration updated.']);
    }

    /**
     * Get the Pinterest Authorization URL.
     */
    public function getAuthUrl(): JsonResponse
    {
        $url = $this->pinterestService->getAuthUrl();
        if (!$url) {
            return response()->json(['message' => 'Please save Client ID first.'], 400);
        }
        return response()->json(['url' => $url]);
    }

    /**
     * Handle the Pinterest OAuth callback.
     */
    public function handleCallback(Request $request)
    {
        $code = $request->get('code');
        
        if (!$code) {
            return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?error=no_code');
        }

        $tokens = $this->pinterestService->getTokenFromCode($code);
        
        if ($tokens) {
            return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?success=pinterest_connected');
        }

        return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?error=token_exchange_failed');
    }

    /**
     * Get user boards from Pinterest.
     */
    public function getBoards(): JsonResponse
    {
        $boards = $this->pinterestService->getBoards();
        return response()->json(['data' => $boards]);
    }

    /**
     * Test the Pinterest connection by fetching boards.
     */
    public function testConnection(): JsonResponse
    {
        $boards = $this->pinterestService->getBoards();
        if (!empty($boards) || count($boards) === 0) {
            return response()->json(['success' => true, 'message' => 'Connection successful.']);
        }
        return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
    }
}
