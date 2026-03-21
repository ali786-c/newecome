<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\PinterestConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PinterestService
{
    protected $config;

    public function __construct()
    {
        $this->config = PinterestConfig::firstOrCreate(['id' => 1]);
    }

    /**
     * Get the Pinterest Authorization URL.
     */
    public function getAuthUrl()
    {
        $clientId = $this->getConfigValue('client_id');
        if (!$clientId) {
            return null;
        }

        $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
        $scope = 'boards:read,pins:read,pins:write';
        $state = Str::random(16);

        // Store state in session or cache if CSRF protection is needed for the callback
        session(['pinterest_oauth_state' => $state]);

        return "https://www.pinterest.com/oauth/?" . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => $scope,
            'state' => $state,
        ]);
    }

    /**
     * Exchange authorization code for tokens.
     */
    public function getTokenFromCode(string $code)
    {
        $clientId = $this->getConfigValue('client_id');
        $clientSecret = $this->getConfigValue('client_secret');
        $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';

        $response = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post('https://api.pinterest.com/v5/oauth/token', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $redirectUri,
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $this->updateConfig([
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
                'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
            ]);
            return $data;
        }

        Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
        return null;
    }

    /**
     * Refresh the access token using the refresh token.
     */
    public function refreshAccessToken()
    {
        $clientId = $this->getConfigValue('client_id');
        $clientSecret = $this->getConfigValue('client_secret');
        $refreshToken = $this->getConfigValue('refresh_token');

        if (!$refreshToken) {
            return null;
        }

        $response = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post('https://api.pinterest.com/v5/oauth/token', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $this->updateConfig([
                'access_token' => $data['access_token'],
                'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
            ]);
            return $data['access_token'];
        }

        Log::error('Pinterest Token Refresh Failed: ' . $response->body());
        return null;
    }

    /**
     * Get the Pinterest Boards for the authorized user.
     */
    public function getBoards()
    {
        $accessToken = $this->getValidAccessToken();
        if (!$accessToken) {
            return [];
        }

        $response = Http::withToken($accessToken)
            ->get('https://api.pinterest.com/v5/boards');

        if ($response->successful()) {
            $data = $response->json();
            $this->config->update(['boards' => $data['items']]);
            return $data['items'];
        }

        Log::error('Pinterest Get Boards Failed: ' . $response->body());
        return [];
    }

    /**
     * Create a new Pin on Pinterest.
     */
    public function createPin(array $data)
    {
        $accessToken = $this->getValidAccessToken();
        if (!$accessToken) {
            Log::error('Pinterest Create Pin Failed: No valid access token.');
            return null;
        }

        $response = Http::withToken($accessToken)
            ->post('https://api.pinterest.com/v5/pins', [
                'link' => $data['link'],
                'title' => $data['title'],
                'description' => $data['description'],
                'board_id' => $data['board_id'],
                'media_source' => [
                    'source_type' => 'image_url',
                    'url' => $data['image_url'],
                ],
            ]);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('Pinterest Create Pin Failed: ' . $response->body());
        return null;
    }

    /**
     * Format and send a blog post to Pinterest.
     */
    public function sendBlogPost(BlogPost $post)
    {
        $boardId = $this->getConfigValue('board_id');
        if (!$boardId) {
            Log::info('Pinterest: Skipping post share (No board selected).');
            return null;
        }

        $websiteUrl = config('app.url');
        if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
            $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
        }
        $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;

        // Pinterest requires a public image URL.
        $imageUrl = $post->image_url;
        if (!str_starts_with($imageUrl, 'http')) {
            $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
        }

        return $this->createPin([
            'link' => $postUrl,
            'title' => Str::limit($post->title, 100),
            'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
            'board_id' => $boardId,
            'image_url' => $imageUrl,
        ]);
    }

    /**
     * Get a valid access token (refreshes if expired).
     */
    protected function getValidAccessToken()
    {
        $accessToken = $this->getConfigValue('access_token');
        $expiresAt = $this->getConfigValue('expires_at');

        if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
            return $this->refreshAccessToken();
        }

        return $accessToken;
    }

    /* ── Helper Methods ── */

    protected function getConfigValue(string $key, $default = null)
    {
        $config = $this->config->config ?? [];
        return $config[$key] ?? $default;
    }

    protected function updateConfig(array $newData)
    {
        $currentConfig = $this->config->config ?? [];
        $this->config->update([
            'config' => array_merge($currentConfig, $newData),
            'status' => 'active'
        ]);
    }
}
