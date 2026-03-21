> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `api\app\Services\PinterestService.php` (Domain: **Generic Logic**)

### 🔴 Generic Logic Gotchas
- **⚠️ GOTCHA: Added OAuth2 authentication — prevents null/undefined runtime crashes**: -         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
+         
- 
+         // FORCING THE REDIRECT URI TO MATCH THE PINTEREST DASHBOARD EXACTLY
-         Log::info("Pinterest: Attempting token exchange for Client ID: " . substr($clientId, 0, 4) . "...");
+         $redirectUri = 'https://upgradercx.com/api/admin/pinterest/callback';
-         $response = Http::asForm()
+         Log::info("Pinterest: Attempting token exchange.");
-             ->withBasicAuth($clientId, $clientSecret)
+         Log::info("Pinterest: Client ID present: " . ($clientId ? 'YES (' . substr($clientId, 0, 4) . '...)' : 'NO'));
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+         Log::info("Pinterest: Client Secret present: " . ($clientSecret ? 'YES' : 'NO'));
-                 'grant_type' => 'authorization_code',
+         Log::info("Pinterest: Redirect URI: " . $redirectUri);
-                 'code' => $code,
+ 
-                 'redirect_uri' => $redirectUri,
+         $response = Http::asForm()
-             ]);
+             ->withBasicAuth($clientId, $clientSecret)
- 
+             ->post('https://api.pinterest.com/v5/oauth/token', [
-         if ($response->successful()) {
+                 'grant_type' => 'authorization_code',
-             $data = $response->json();
+                 'code' => $code,
-             $this->updateConfig([
+                 'redirect_uri' => $redirectUri,
-                 'access_token' => $data['access_token'],
+             ]);
-                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
+ 
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+         if ($response->successful()) {
-             ]);
+             $data = $response->json();
-             return $data;
+             $this->updateConfig([
-         }
+                 'access_token' => $data['access_token'],
- 
+                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
-         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         return null;
+             ]);
-     }
+             return $data;
- 
+         }
-     /**
+ 
-      * Refresh the access token using the refresh token.
+         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
-      */
+         return null;
-     public function refreshAccessToken()
+     }
-     {
+ 
-         $clientId = $this->getConfigValue('client_id');
+     /**
-         $client[REDACTED]
+      * Refresh the access token using the refresh token.
-         $refreshToken = $this->getConfigValue('refresh_token');
+      */
- 
+     public function refreshAccessToken()
-         if (!$refreshToken) {
+     {
-             return null;
+         $clientId = $this->getConfigValue('client_id');
-         }
+         $client[REDACTED]
- 
+         $refreshToken = $this->getConfigValue('refresh_token');
-         $response = Http::asForm()
+ 
-             ->withBasicAuth($clientId, $clientSecret)
+         if (!$refreshToken) {
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+             return null;
-                 'grant_type' => 'refresh_token',
+         }
-                 'refresh_token' => $refreshToken,
+ 
-             ]);
+         $response = Http::asForm()
- 
+             ->withBasicAuth($clientId, $clientSecret)
-         if ($response->successful()) {
+             ->post('https://api.pinterest.com/v5/oauth/token', [
-             $data = $response->json();
+                 'grant_type' => 'refresh_token',
-             $this->updateConfig([
+                 'refresh_token' => $refreshToken,
-                 'access_token' => $data['access_token'],
+             ]);
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+ 
-             ]);
+         if ($response->successful()) {
-             return $data['access_token'];
+             $data = $response->json();
-         }
+             $this->updateConfig([
- 
+                 'access_token' => $data['access_token'],
-         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         return null;
+             ]);
-     }
+             return $data['access_token'];
- 
+         }
-     /**
+ 
-      * Get the Pinterest Boards for the authorized user.
+         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
-      */
+         return null;
-     public function getBoards()
+     }
-     {
+ 
-         $accessToken = $this->getValidAccessToken();
+     /**
-         if (!$accessToken) {
+      * Get the Pinterest Boards for the authorized user.
-             return [];
+      */
-         }
+     public function getBoards()
- 
+     {
-         $response = Http::withToken($accessToken)
+         $accessToken = $this->getValidAccessToken();
-             ->get('https://api.pinterest.com/v5/boards');
+         if (!$accessToken) {
- 
+             return [];
-         if ($response->successful()) {
+         }
-             $data = $response->json();
+ 
-             $this->config->update(['boards' => $data['items']]);
+         $response = Http::withToken($accessToken)
-             return $data['items'];
+             ->get('https://api.pinterest.com/v5/boards');
-         }
+ 
- 
+         if ($response->successful()) {
-         Log::error('Pinterest Get Boards Failed: ' . $response->body());
+             $data = $response->json();
-         return [];
+             $this->config->update(['boards' => $data['items']]);
-     }
+             return $data['items'];
- 
+         }
-     /**
+ 
-      * Create a new Pin on Pinterest.
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
-      */
+         return [];
-     public function createPin(array $data)
+     }
-     {
+ 
-         $accessToken = $this->getValidAccessToken();
+     /**
-         if (!$accessToken) {
+      * Create a new Pin on Pinterest.
-             Log::error('Pinterest Create Pin Failed: No valid access token.');
+      */
-             return null;
+     public function createPin(array $data)
-         }
+     {
- 
+         $accessToken = $this->getValidAccessToken();
-         $response = Http::withToken($accessToken)
+         if (!$accessToken) {
-             ->post('https://api.pinterest.com/v5/pins', [
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
-                 'link' => $data['link'],
+             return null;
-                 'title' => $data['title'],
+         }
-                 'description' => $data['description'],
+ 
-                 'board_id' => $data['board_id'],
+         $response = Http::withToken($accessToken)
-                 'media_source' => [
+             ->post('https://api.pinterest.com/v5/pins', [
-                     'source_type' => 'image_url',
+                 'link' => $data['link'],
-                     'url' => $data['image_url'],
+                 'title' => $data['title'],
-                 ],
+                 'description' => $data['description'],
-             ]);
+                 'board_id' => $data['board_id'],
- 
+                 'media_source' => [
-         if ($response->successful()) {
+                     'source_type' => 'image_url',
-             return $response->json();
+                     'url' => $data['image_url'],
-         }
+                 ],
- 
+             ]);
-         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+ 
-         return null;
+         if ($response->successful()) {
-     }
+             return $response->json();
- 
+         }
-     /**
+ 
-      * Format and send a blog post to Pinterest.
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
-      */
+         return null;
-     public function sendBlogPost(BlogPost $post)
+     }
-     {
+ 
-         $boardId = $this->getConfigValue('board_id');
+     /**
-         if (!$boardId) {
+      * Format and send a blog post to Pinterest.
-             Log::info('Pinterest: Skipping post share (No board selected).');
+      */
-             return null;
+     public function sendBlogPost(BlogPost $post)
-         }
+     {
- 
+         $boardId = $this->getConfigValue('board_id');
-         $websiteUrl = config('app.url');
+         if (!$boardId) {
-         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+             Log::info('Pinterest: Skipping post share (No board selected).');
-             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+             return null;
-         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+ 
- 
+         $websiteUrl = config('app.url');
-         // Pinterest requires a public image URL.
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-         $imageUrl = $post->image_url;
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
-         if (!str_starts_with($imageUrl, 'http')) {
+         }
-             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
-         }
+ 
- 
+         // Pinterest requires a public image URL.
-         return $this->createPin([
+         $imageUrl = $post->image_url;
-             'link' => $postUrl,
+         if (!str_starts_with($imageUrl, 'http')) {
-             'title' => Str::limit($post->title, 100),
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
-             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+         }
-             'board_id' => $boardId,
+ 
-             'image_url' => $imageUrl,
+         return $this->createPin([
-         ]);
+             'link' => $postUrl,
-     }
+             'title' => Str::limit($post->title, 100),
- 
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
-     protected function getValidAccessToken()
+             'board_id' => $boardId,
-     {
+             'image_url' => $imageUrl,
-         $accessToken = $this->getConfigValue('access_token');
+         ]);
-         $expiresAt = $this->getConfigValue('expires_at');
+     }
-         if (!$accessToken) {
+     protected function getValidAccessToken()
-             return null;
+     {
-         }
+         $accessToken = $this->getConfigValue('access_token');
- 
+         $expiresAt = $this->getConfigValue('expires_at');
-         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
+ 
-         if (!$expiresAt) {
+         if (!$accessToken) {
-             return $accessToken;
+             return null;
-         if (now()->timestamp > ($expiresAt - 60)) {
+         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
-             return $this->refreshAccessToken();
+         if (!$expiresAt) {
-         }
+             return $accessToken;
- 
+         }
-         return $accessToken;
+ 
-     }
+         if (now()->timestamp > ($expiresAt - 60)) {
- 
+             return $this->refreshAccessToken();
-     /* ── Helper Methods ── */
+         }
-     protected function getConfigValue(string $key, $default = null)
+         return $accessToken;
-     {
+     }
-         $config = $this->config->config ?? [];
+ 
-         return $config[$key] ?? $default;
+     /* ── Helper Methods ── */
-     }
+ 
- 
+     protected function getConfigValue(string $key, $default = null)
-     protected function updateConfig(array $newData)
+     {
-     {
+         $config = $this->config->config ?? [];
-         $currentConfig = $this->config->config ?? [];
+         return $config[$key] ?? $default;
-         $this->config->update([
+     }
-             'config' => array_merge($currentConfig, $newData),
+ 
-             'status' => 'active'
+     protected function updateConfig(array $newData)
-         ]);
+     {
-     }
+         $currentConfig = $this->config->config ?? [];
- }
+         $this->config->update([
- 
+             'config' => array_merge($currentConfig, $newData),
+             'status' => 'active'
+         ]);
+     }
+ }
+ 
- **⚠️ GOTCHA: Replaced auth Telegram**: -                 Log::channel('automation')->warning("Telegram: sendPhoto failed. Response: " . $response->body());
+                 $errorBody = $response->body();
-                 Log::error("Telegram sendPhoto failed for post {$post->id}: " . $response->body());
+                 Log::channel('automation')->warning("Telegram: sendPhoto failed for post {$post->id}. Status: " . $response->status() . " Body: " . $errorBody);
-             }
+                 Log::error("Telegram sendPhoto error [{$post->id}]: " . $errorBody);
- 
+             }
-             // Fallback or No Image: Send as regular message
+ 
-             $response = Http::withoutVerifying()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
+             // Fallback or No Image: Send as regular message
-                 'chat_id' => $channelId,
+             Log::channel('automation')->info("Telegram: Attempting fallback sendMessage for post {$post->id}");
-                 'text'    => $caption,
+             $response = Http::withoutVerifying()->timeout(20)->post("https://api.telegram.org/bot{$token}/sendMessage", [
-                 'parse_mode' => 'HTML',
+                 'chat_id' => $channelId,
-             ]);
+                 'text'    => $caption,
- 
+                 'parse_mode' => 'HTML',
-             if ($response->successful()) {
+             ]);
-                 Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
+ 
-                 return true;
+             if ($response->successful()) {
-             }
+                 Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
- 
+                 return true;
-             Log::channel('automation')->error("Telegram API Error (Final): " . $response->body());
+             }
-             return false;
+ 
- 
+             $finalError = $response->body();
-         } catch (\Exception $e) {
+             Log::channel('automation')->error("Telegram API Error (Final) for post {$post->id}. Status: " . $response->status() . " Body: " . $finalError);
-             Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
+             return false;
-             return false;
+ 
-         }
+         } catch (\Exception $e) {
-     }
+             Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
- 
+             return false;
-     /**
+         }
-      * Simple test method to verify connectivity.
+     }
-      */
+ 
-     public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
+     /**
-     {
+      * Simple test method to verify connectivity.
-         $token = Setting::getValue('telegram_bot_token');
+      */
-         $channelId = Setting::getValue('telegram_channel_id');
+     public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
- 
+     {
-         if (!$token || !$channelId) {
+         $token = Setting::getValue('telegram_bot_token');
-             return [
+         $channelId = Setting::getValue('telegram_channel_id');
-                 'ok' => false,
+ 
-                 'description' => "Missing configuration (Token or Channel ID)."
+         if (!$token || !$channelId) {
-             ];
+             return [
-         }
+                 'ok' => false,
- 
+                 'description' => "Missing configuration (Token or Channel ID)."
-         try {
+             ];
-             $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
+         }
-                 'chat_id' => $channelId,
+ 
-                 'text'    => $message,
+         try {
-                 'parse_mode' => 'HTML',
+             $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
-             ]);
+                 'chat_id' => $channelId,
- 
+                 'text'    => $message,
-             if (!$response->successful()) {
+                 'parse_mode' => 'HTML',
-                 Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
+             ]);
-             }
+ 
- 
+             if (!$response->successful()) {
-             return $response->json();
+                 Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
-         } catch (\Exception $e) {
+             }
-             Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
+ 
-             return [
+             return $response->json();
-                 'ok' => false,
+         } catch (\Exception $e) {
-                 'description' => "Connection Error: " . $e->getMessage()
+             Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
-             ];
+             return [
-         }
+                 'ok' => false,
-     }
+                 'description' => "Connection Error: " . $e->getMessage()
- }
+             ];
- 
+         }
+     }
+ }
+ 
- **⚠️ GOTCHA: Fixed null crash in Simple — prevents null/undefined runtime crashes**: -             // Simple formatting for Telegram
+             // Simple formatting for Telegram - Strip all tags first to be safe
-             $caption = "<b>" . htmlspecialchars($post->title) . "</b>\n\n";
+             $cleanTitle = strip_tags($post->title);
-             $caption .= htmlspecialchars($post->excerpt ?? '') . "\n\n";
+             $cleanExcerpt = strip_tags($post->excerpt ?? '');
-             $caption .= "🔗 <a href='{$postUrl}'>Read Full Article</a>";
+             
- 
+             $caption = "<b>" . htmlspecialchars($cleanTitle) . "</b>\n\n";
-             // Telegram sendPhoto caption limit is 1024 characters.
+             $caption .= htmlspecialchars($cleanExcerpt) . "\n\n";
-             if (strlen($caption) > 1000) {
+             $caption .= "🔗 <a href='{$postUrl}'>Read Full Article</a>";
-                 $caption = Str::limit($caption, 990) . "\n\n🔗 <a href='{$postUrl}'>Read Full Article</a>";
+ 
-             }
+             // Telegram sendPhoto caption limit is 1024 characters.
- 
+             if (strlen($caption) > 1000) {
-             // If we have an image, use sendPhoto. Otherwise sendSendMessage.
+                 $caption = Str::limit($caption, 950) . "\n\n🔗 <a href='{$postUrl}'>Read Full Article</a>";
-             if ($post->image_url) {
+             }
-                 $filename = basename($post->image_url);
+ 
-                 $localPath = public_path('blog_images/' . $filename);
+             // If we have an image, use sendPhoto. Otherwise sendSendMessage.
-                 
+             if ($post->image_url) {
-                 Log::channel('automation')->info("Telegram: Attempting photo send for post {$post->id}", [
+                 $filename = basename($post->image_url);
-                     'image_url' => $post->image_url,
+                 $localPath = public_path('blog_images/' . $filename);
-                     'local_path' => $localPath,
+                 
-                     'exists' => file_exists($localPath)
+                 Log::channel('automation')->info("Telegram: Attempting photo send for post {$post->id}", [
-                 ]);
+                     'image_url' => $post->image_url,
- 
+                     'local_path' => $localPath,
-                 if (file_exists($localPath)) {
+                     'exists' => file_exists($localPath)
-                     // Method 1: Direct File Upload (Most reliable)
+                 ]);
-                     $response = Http::withoutVerifying()
+ 
-                         ->timeout(30)
+                 if (file_exists($localPath)) {
-                         ->attach('photo', file_get_contents($localPath), $filename)
+                     // Method 1: Direct File Upload (Most reliable)
-                         ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
+                     $response = Http::withoutVerifying()
-                             'chat_id' => $channelId,
+                         ->timeout(30)
-                             'caption' => $caption,
+                         ->attach('photo', file_get_contents($localPath), $filename)
-                             'parse_mode' => 'HTML',
+                         ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
-                         ]);
+                             'chat_id' => $channelId,
-                 } else {
+                             'caption' => $caption,
-                     // Method 2: Fallback to URL (if local file missing)
+                             'parse_mode' => 'HTML',
-                     $photoUrl = $post->image_url;
+                         ]);
-                     if (!str_starts_with($photoUrl, 'http')) {
+                 } else {
-                         $photoUrl = rtrim($websiteUrl, '/') . '/' . ltrim($photoUrl, '/');
+                     // Method 2: Fallback to URL (if local file missing)
-                     }
+                     $photoUrl = $post->image_url;
-                     
+                     if (!str_starts_with($photoUrl, 'http')) {
-                     $response = Http::withoutVerifying()
+                         $photoUrl = rtrim($websiteUrl, '/') . '/' . ltrim($photoUrl, '/');
-                         ->timeout(30)
+                     }
-                         ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
+                     
-                             'chat_id' => $channelId,
+                     $response = Http::withoutVerifying()
-                             'photo'   => $photoUrl,
+                         ->timeout(30)
-                             'caption' => $caption,
+                         ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
-                             'parse_mode' => 'HTML',
+                             'chat_id' => $channelId,
-                         ]);
+                             'photo'   => $photoUrl,
-                 }
+                             'caption' => $caption,
- 
+                             'parse_mode' => 'HTML',
-                 if ($response->successful()) {
+                         ]);
-                     Log::channel('automation')->info("Telegram: Post successfully shared with image: {$post->title}");
+                 }
-                     return true;
+ 
-                 }
+                 if ($response->successful()) {
- 
+                     Log::channel('automation')->info("Telegram: Post successfully shared with image: {$post->title}");
-                 Log::channel('automation')->warning("Telegram: sendPhoto failed. Response: " . $response->body());
+                     return true;
-                 Log::error("Telegram sendPhoto failed for post {$post->id}: " . $response->body());
+                 }
-             }
+ 
- 
+                 Log::channel('automation')->warning("Telegram: sendPhoto failed. Response: " . $response->body());
-             // Fallback or No Image: Send as regular message
+                 Log::error("Telegram sendPhoto failed for post {$post->id}: " . $response->body());
-             $response = Http::withoutVerifying()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
+             }
-                 'chat_id' => $channelId,
+ 
-                 'text'    => $caption,
+             // Fallback or No Image: Send as regular message
-                 'parse_mode' => 'HTML',
+             $response = Http::withoutVerifying()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
-             ]);
+                 'chat_id' => $channelId,
- 
+                 'text'    => $caption,
-             if ($response->successful()) {
+                 'parse_mode' => 'HTML',
-                 Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
+             ]);
-                 return true;
+ 
-             }
+             if ($response->successful()) {
- 
+                 Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
-             Log::channel('automation')->error("Telegram API Error (Final): " . $response->body());
+                 return true;
-             return false;
+             }
-         } catch (\Exception $e) {
+             Log::channel('automation')->error("Telegram API Error (Final): " . $response->body());
-             Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
+             return false;
-             return false;
+ 
-         }
+         } catch (\Exception $e) {
-     }
+             Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
- 
+             return false;
-     /**
+         }
-      * Simple test method to verify connectivity.
+     }
-      */
+ 
-     public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
+     /**
-     {
+      * Simple test method to verify connectivity.
-         $token = Setting::getValue('telegram_bot_token');
+      */
-         $channelId = Setting::getValue('telegram_channel_id');
+     public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
- 
+     {
-         if (!$token || !$channelId) {
+         $token = Setting::getValue('telegram_bot_token');
-             return [
+         $channelId = Setting::getValue('telegram_channel_id');
-                 'ok' => false,
+ 
-                 'description' => "Missing configuration (Token or Channel ID)."
+         if (!$token || !$channelId) {
-             ];
+             return [
-         }
+                 'ok' => false,
- 
+                 'description' => "Missing configuration (Token or Channel ID)."
-         try {
+             ];
-             $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
+         }
-                 'chat_id' => $channelId,
+ 
-                 'text'    => $message,
+         try {
-                 'parse_mode' => 'HTML',
+             $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
-             ]);
+                 'chat_id' => $channelId,
- 
+                 'text'    => $message,
-             if (!$response->successful()) {
+                 'parse_mode' => 'HTML',
-                 Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
+             ]);
-             }
+ 
- 
+             if (!$response->successful()) {
-             return $response->json();
+                 Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
-         } catch (\Exception $e) {
+             }
-             Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
+ 
-             return [
+             return $response->json();
-                 'ok' => false,
+         } catch (\Exception $e) {
-                 'description' => "Connection Error: " . $e->getMessage()
+             Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
-             ];
+             return [
-         }
+                 'ok' => false,
-     }
+                 'description' => "Connection Error: " . $e->getMessage()
- }
+             ];
- 
+         }
+     }
+ }
+ 
- **⚠️ GOTCHA: Fixed null crash in Telegram**: -                 // Ensure photo URL is absolute for Telegram
+                 $filename = basename($post->image_url);
-                 $photoUrl = $post->image_url;
+                 $localPath = public_path('blog_images/' . $filename);
-                 Log::channel('automation')->info("Telegram debug post {$post->id}: image_url from DB = {$photoUrl}");
+                 
- 
+                 Log::channel('automation')->info("Telegram: Attempting photo send for post {$post->id}", [
-                 if (!str_starts_with($photoUrl, 'http')) {
+                     'image_url' => $post->image_url,
-                     $photoUrl = rtrim($websiteUrl, '/') . '/' . ltrim($photoUrl, '/');
+                     'local_path' => $localPath,
-                 }
+                     'exists' => file_exists($localPath)
-                 
+                 ]);
-                 Log::channel('automation')->info("Telegram debug post {$post->id}: Final absolute photoUrl = {$photoUrl}");
+ 
- 
+                 if (file_exists($localPath)) {
-                 $payload = [
+                     // Method 1: Direct File Upload (Most reliable)
-                     'chat_id' => $channelId,
+                     $response = Http::withoutVerifying()
-                     'photo'   => $photoUrl,
+                         ->timeout(30)
-                     'caption' => $caption,
+                         ->attach('photo', file_get_contents($localPath), $filename)
-                     'parse_mode' => 'HTML',
+                         ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
-                 ];
+                             'chat_id' => $channelId,
- 
+                             'caption' => $caption,
-                 Log::channel('automation')->info('Telegram: Attempting sendPhoto', ['payload' => $payload]);
+                             'parse_mode' => 'HTML',
- 
+                         ]);
-                 $response = Http::withoutVerifying()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendPhoto", $payload);
+                 } else {
- 
+                     // Method 2: Fallback to URL (if local file missing)
-                 if ($response->successful()) {
+                     $photoUrl = $post->image_url;
-                     Log::channel('automation')->info("Telegram: Post successfully shared: {$post->title}");
+                     if (!str_starts_with($photoUrl, 'http')) {
-                     return true;
+                         $photoUrl = rtrim($websiteUrl, '/') . '/' . ltrim($photoUrl, '/');
-                 }
+                     }
- 
+                     
-                 Log::channel('automation')->warning("Telegram: sendPhoto failed. Response: " . $response->body());
+                     $response = Http::withoutVerifying()
-                 Log::error("Telegram sendPhoto failed for post {$post->id}: " . $response->body());
+                         ->timeout(30)
-             }
+                         ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
- 
+                             'chat_id' => $channelId,
-             // Fallback or No Image: Send as regular message
+                             'photo'   => $photoUrl,
-             $response = Http::withoutVerifying()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
+                             'caption' => $caption,
-                 'chat_id' => $channelId,
+                             'parse_mode' => 'HTML',
-                 'text'    => $caption,
+                         ]);
-                 'parse_mode' => 'HTML',
+                 }
-             ]);
+ 
- 
+                 if ($response->successful()) {
-             if ($response->successful()) {
+                     Log::channel('automation')->info("Telegram: Post successfully shared with image: {$post->title}");
-                 Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
+                     return true;
-                 return true;
+                 }
-             }
+ 
- 
+                 Log::channel('automation')->warning("Telegram: sendPhoto failed. Response: " . $response->body());
-             Log::channel('automation')->error("Telegram API Error (Final): " . $response->body());
+                 Log::error("Telegram sendPhoto failed for post {$post->id}: " . $response->body());
-             return false;
+             }
-         } catch (\Exception $e) {
+             // Fallback or No Image: Send as regular message
-             Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
+             $response = Http::withoutVerifying()->timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
-             return false;
+                 'chat_id' => $channelId,
-         }
+                 'text'    => $caption,
-     }
+                 'parse_mode' => 'HTML',
- 
+             ]);
-     /**
+ 
-      * Simple test method to verify connectivity.
+             if ($response->successful()) {
-      */
+                 Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
-     public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
+                 return true;
-     {
+             }
-         $token = Setting::getValue('telegram_bot_token');
+ 
-         $channelId = Setting::getValue('telegram_channel_id');
+             Log::channel('automation')->error("Telegram API Error (Final): " . $response->body());
- 
+             return false;
-         if (!$token || !$channelId) {
+ 
-             return [
+         } catch (\Exception $e) {
-                 'ok' => false,
+             Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
-                 'description' => "Missing configuration (Token or Channel ID)."
+             return false;
-             ];
+         }
-         }
+     }
-         try {
+     /**
-             $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
+      * Simple test method to verify connectivity.
-                 'chat_id' => $channelId,
+      */
-                 'text'    => $message,
+     public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
-                 'parse_mode' => 'HTML',
+     {
-             ]);
+         $token = Setting::getValue('telegram_bot_token');
- 
+         $channelId = Setting::getValue('telegram_channel_id');
-             if (!$response->successful()) {
+ 
-                 Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
+         if (!$token || !$channelId) {
-             }
+             return [
- 
+                 'ok' => false,
-             return $response->json();
+                 'description' => "Missing configuration (Token or Channel ID)."
-         } catch (\Exception $e) {
+             ];
-             Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
+         }
-             return [
+ 
-                 'ok' => false,
+         try {
-                 'description' => "Connection Error: " . $e->getMessage()
+             $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
-             ];
+                 'chat_id' => $channelId,
-         }
+                 'text'    => $message,
-     }
+                 'parse_mode' => 'HTML',
- }
+             ]);
+             if (!$response->successful()) {
+                 Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
+             }
+ 
+             return $response->json();
+         } catch (\Exception $e) {
+             Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
+             return [
+                 'ok' => false,
+                 'description' => "Connection Error: " . $e->getMessage()
+             ];
+         }
+     }
+ }
+ 

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in PinterestService.php**: -         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
+         $redirectUri = 'https://upgradercx.com/api/admin/pinterest/callback';
- **[convention] Added OAuth2 authentication — prevents null/undefined runtime crashes — confirmed 3x**: -         Log::info("Pinterest: Attempting token exchange for Client ID: " . substr($clientId, 0, 4) . "...");
+         $clientId = $this->getConfigValue('client_id');
- 
+         $client[REDACTED]
-         $response = Http::asForm()
+         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
-             ->withBasicAuth($clientId, $clientSecret)
+ 
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+         Log::info("Pinterest: Attempting token exchange for Client ID: " . substr($clientId, 0, 4) . "...");
-                 'grant_type' => 'authorization_code',
+ 
-                 'code' => $code,
+         $response = Http::asForm()
-                 'redirect_uri' => $redirectUri,
+             ->withBasicAuth($clientId, $clientSecret)
-             ]);
+             ->post('https://api.pinterest.com/v5/oauth/token', [
- 
+                 'grant_type' => 'authorization_code',
-         if ($response->successful()) {
+                 'code' => $code,
-             $data = $response->json();
+                 'redirect_uri' => $redirectUri,
-             $this->updateConfig([
+             ]);
-                 'access_token' => $data['access_token'],
+ 
-                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
+         if ($response->successful()) {
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+             $data = $response->json();
-             ]);
+             $this->updateConfig([
-             return $data;
+                 'access_token' => $data['access_token'],
-         }
+                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
- 
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
+             ]);
-         return null;
+             return $data;
-     }
+         }
-     /**
+         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
-      * Refresh the access token using the refresh token.
+         return null;
-      */
+     }
-     public function refreshAccessToken()
+ 
-     {
+     /**
-         $clientId = $this->getConfigValue('client_id');
+      * Refresh the access token using the refresh token.
-         $client[REDACTED]
+      */
-         $refreshToken = $this->getConfigValue('refresh_token');
+     public function refreshAccessToken()
- 
+     {
-         if (!$refreshToken) {
+         $clientId = $this->getConfigValue('client_id');
-             return null;
+         $client[REDACTED]
-         }
+         $refreshToken = $this->getConfigValue('refresh_token');
-         $response = Http::asForm()
+         if (!$refreshToken) {
-             ->withBasicAuth($clientId, $clientSecret)
+             return null;
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+         }
-                 'grant_type' => 'refresh_token',
+ 
-                 'refresh_token' => $refreshToken,
+         $response = Http::asForm()
-             ]);
+             ->withBasicAuth($clientId, $clientSecret)
- 
+             ->post('https://api.pinterest.com/v5/oauth/token', [
-         if ($response->successful()) {
+                 'grant_type' => 'refresh_token',
-             $data = $response->json();
+                 'refresh_token' => $refreshToken,
-             $this->updateConfig([
+             ]);
-                 'access_token' => $data['access_token'],
+ 
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+         if ($response->successful()) {
-             ]);
+             $data = $response->json();
-             return $data['access_token'];
+             $this->updateConfig([
-         }
+                 'access_token' => $data['access_token'],
- 
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
+             ]);
-         return null;
+             return $data['access_token'];
-     }
+         }
-     /**
+         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
-      * Get the Pinterest Boards for the authorized user.
+         return null;
-      */
+     }
-     public function getBoards()
+ 
-     {
+     /**
-         $accessToken = $this->getValidAccessToken();
+      * Get the Pinterest Boards for the authorized user.
-         if (!$accessToken) {
+      */
-             return [];
+     public function getBoards()
-         }
+     {
- 
+         $accessToken = $this->getValidAccessToken();
-         $response = Http::withToken($accessToken)
+         if (!$accessToken) {
-             ->get('https://api.pinterest.com/v5/boards');
+             return [];
- 
+         }
-         if ($response->successful()) {
+ 
-             $data = $response->json();
+         $response = Http::withToken($accessToken)
-             $this->config->update(['boards' => $data['items']]);
+             ->get('https://api.pinterest.com/v5/boards');
-             return $data['items'];
+ 
-         }
+         if ($response->successful()) {
- 
+             $data = $response->json();
-         Log::error('Pinterest Get Boards Failed: ' . $response->body());
+             $this->config->update(['boards' => $data['items']]);
-         return [];
+             return $data['items'];
-     }
+         }
-     /**
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
-      * Create a new Pin on Pinterest.
+         return [];
-      */
+     }
-     public function createPin(array $data)
+ 
-     {
+     /**
-         $accessToken = $this->getValidAccessToken();
+      * Create a new Pin on Pinterest.
-         if (!$accessToken) {
+      */
-             Log::error('Pinterest Create Pin Failed: No valid access token.');
+     public function createPin(array $data)
-             return null;
+     {
-         }
+         $accessToken = $this->getValidAccessToken();
- 
+         if (!$accessToken) {
-         $response = Http::withToken($accessToken)
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
-             ->post('https://api.pinterest.com/v5/pins', [
+             return null;
-                 'link' => $data['link'],
+         }
-                 'title' => $data['title'],
+ 
-                 'description' => $data['description'],
+         $response = Http::withToken($accessToken)
-                 'board_id' => $data['board_id'],
+             ->post('https://api.pinterest.com/v5/pins', [
-                 'media_source' => [
+                 'link' => $data['link'],
-                     'source_type' => 'image_url',
+                 'title' => $data['title'],
-                     'url' => $data['image_url'],
+                 'description' => $data['description'],
-                 ],
+                 'board_id' => $data['board_id'],
-             ]);
+                 'media_source' => [
- 
+                     'source_type' => 'image_url',
-         if ($response->successful()) {
+                     'url' => $data['image_url'],
-             return $response->json();
+                 ],
-         }
+             ]);
-         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+         if ($response->successful()) {
-         return null;
+             return $response->json();
-     }
+         }
-     /**
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
-      * Format and send a blog post to Pinterest.
+         return null;
-      */
+     }
-     public function sendBlogPost(BlogPost $post)
+ 
-     {
+     /**
-         $boardId = $this->getConfigValue('board_id');
+      * Format and send a blog post to Pinterest.
-         if (!$boardId) {
+      */
-             Log::info('Pinterest: Skipping post share (No board selected).');
+     public function sendBlogPost(BlogPost $post)
-             return null;
+     {
-         }
+         $boardId = $this->getConfigValue('board_id');
- 
+         if (!$boardId) {
-         $websiteUrl = config('app.url');
+             Log::info('Pinterest: Skipping post share (No board selected).');
-         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+             return null;
-             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+         }
-         }
+ 
-         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+         $websiteUrl = config('app.url');
- 
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-         // Pinterest requires a public image URL.
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
-         $imageUrl = $post->image_url;
+         }
-         if (!str_starts_with($imageUrl, 'http')) {
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
-             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+ 
-         }
+         // Pinterest requires a public image URL.
- 
+         $imageUrl = $post->image_url;
-         return $this->createPin([
+         if (!str_starts_with($imageUrl, 'http')) {
-             'link' => $postUrl,
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
-             'title' => Str::limit($post->title, 100),
+         }
-             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+ 
-             'board_id' => $boardId,
+         return $this->createPin([
-             'image_url' => $imageUrl,
+             'link' => $postUrl,
-         ]);
+             'title' => Str::limit($post->title, 100),
-     }
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
- 
+             'board_id' => $boardId,
-     protected function getValidAccessToken()
+             'image_url' => $imageUrl,
-     {
+         ]);
-         $accessToken = $this->getConfigValue('access_token');
+     }
-         $expiresAt = $this->getConfigValue('expires_at');
+ 
- 
+     protected function getValidAccessToken()
-         if (!$accessToken) {
+     {
-             return null;
+         $accessToken = $this->getConfigValue('access_token');
-         }
+         $expiresAt = $this->getConfigValue('expires_at');
-         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
+         if (!$accessToken) {
-         if (!$expiresAt) {
+             return null;
-             return $accessToken;
+         }
-         }
+ 
- 
+         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
-         if (now()->timestamp > ($expiresAt - 60)) {
+         if (!$expiresAt) {
-             return $this->refreshAccessToken();
+             return $accessToken;
-         return $accessToken;
+         if (now()->timestamp > ($expiresAt - 60)) {
-     }
+             return $this->refreshAccessToken();
- 
+         }
-     /* ── Helper Methods ── */
+ 
- 
+         return $accessToken;
-     protected function getConfigValue(string $key, $default = null)
+     }
-     {
+ 
-         $config = $this->config->config ?? [];
+     /* ── Helper Methods ── */
-         return $config[$key] ?? $default;
+ 
-     }
+     protected function getConfigValue(string $key, $default = null)
- 
+     {
-     protected function updateConfig(array $newData)
+         $config = $this->config->config ?? [];
-     {
+         return $config[$key] ?? $default;
-         $currentConfig = $this->config->config ?? [];
+     }
-         $this->config->update([
+ 
-             'config' => array_merge($currentConfig, $newData),
+     protected function updateConfig(array $newData)
-             'status' => 'active'
+     {
-         ]);
+         $currentConfig = $this->config->config ?? [];
-     }
+         $this->config->update([
- }
+             'config' => array_merge($currentConfig, $newData),
- 
+             'status' => 'active'
+         ]);
+     }
+ }
+ 
- **[what-changed] Added OAuth2 authentication — prevents null/undefined runtime crashes**: -         $clientId = $this->getConfigValue('client_id');
+         Log::info("Pinterest: Attempting token exchange for Client ID: " . substr($clientId, 0, 4) . "...");
-         $client[REDACTED]
+ 
-         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
+         $response = Http::asForm()
- 
+             ->withBasicAuth($clientId, $clientSecret)
-         $response = Http::asForm()
+             ->post('https://api.pinterest.com/v5/oauth/token', [
-             ->withBasicAuth($clientId, $clientSecret)
+                 'grant_type' => 'authorization_code',
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+                 'code' => $code,
-                 'grant_type' => 'authorization_code',
+                 'redirect_uri' => $redirectUri,
-                 'code' => $code,
+             ]);
-                 'redirect_uri' => $redirectUri,
+ 
-                 'client_id' => $clientId,
+         if ($response->successful()) {
-                 'client_secret' => $clientSecret,
+             $data = $response->json();
-             ]);
+             $this->updateConfig([
- 
+                 'access_token' => $data['access_token'],
-         if ($response->successful()) {
+                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
-             $data = $response->json();
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-             $this->updateConfig([
+             ]);
-                 'access_token' => $data['access_token'],
+             return $data;
-                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
+         }
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+ 
-             ]);
+         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
-             return $data;
+         return null;
-         }
+     }
-         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
+     /**
-         return null;
+      * Refresh the access token using the refresh token.
-     }
+      */
- 
+     public function refreshAccessToken()
-     /**
+     {
-      * Refresh the access token using the refresh token.
+         $clientId = $this->getConfigValue('client_id');
-      */
+         $client[REDACTED]
-     public function refreshAccessToken()
+         $refreshToken = $this->getConfigValue('refresh_token');
-     {
+ 
-         $clientId = $this->getConfigValue('client_id');
+         if (!$refreshToken) {
-         $client[REDACTED]
+             return null;
-         $refreshToken = $this->getConfigValue('refresh_token');
+         }
-         if (!$refreshToken) {
+         $response = Http::asForm()
-             return null;
+             ->withBasicAuth($clientId, $clientSecret)
-         }
+             ->post('https://api.pinterest.com/v5/oauth/token', [
- 
+                 'grant_type' => 'refresh_token',
-         $response = Http::asForm()
+                 'refresh_token' => $refreshToken,
-             ->withBasicAuth($clientId, $clientSecret)
+             ]);
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+ 
-                 'grant_type' => 'refresh_token',
+         if ($response->successful()) {
-                 'refresh_token' => $refreshToken,
+             $data = $response->json();
-             ]);
+             $this->updateConfig([
- 
+                 'access_token' => $data['access_token'],
-         if ($response->successful()) {
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-             $data = $response->json();
+             ]);
-             $this->updateConfig([
+             return $data['access_token'];
-                 'access_token' => $data['access_token'],
+         }
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+ 
-             ]);
+         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
-             return $data['access_token'];
+         return null;
-         }
+     }
-         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
+     /**
-         return null;
+      * Get the Pinterest Boards for the authorized user.
-     }
+      */
- 
+     public function getBoards()
-     /**
+     {
-      * Get the Pinterest Boards for the authorized user.
+         $accessToken = $this->getValidAccessToken();
-      */
+         if (!$accessToken) {
-     public function getBoards()
+             return [];
-     {
+         }
-         $accessToken = $this->getValidAccessToken();
+ 
-         if (!$accessToken) {
+         $response = Http::withToken($accessToken)
-             return [];
+             ->get('https://api.pinterest.com/v5/boards');
-         }
+ 
- 
+         if ($response->successful()) {
-         $response = Http::withToken($accessToken)
+             $data = $response->json();
-             ->get('https://api.pinterest.com/v5/boards');
+             $this->config->update(['boards' => $data['items']]);
- 
+             return $data['items'];
-         if ($response->successful()) {
+         }
-             $data = $response->json();
+ 
-             $this->config->update(['boards' => $data['items']]);
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
-             return $data['items'];
+         return [];
-         }
+     }
-         Log::error('Pinterest Get Boards Failed: ' . $response->body());
+     /**
-         return [];
+      * Create a new Pin on Pinterest.
-     }
+      */
- 
+     public function createPin(array $data)
-     /**
+     {
-      * Create a new Pin on Pinterest.
+         $accessToken = $this->getValidAccessToken();
-      */
+         if (!$accessToken) {
-     public function createPin(array $data)
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
-     {
+             return null;
-         $accessToken = $this->getValidAccessToken();
+         }
-         if (!$accessToken) {
+ 
-             Log::error('Pinterest Create Pin Failed: No valid access token.');
+         $response = Http::withToken($accessToken)
-             return null;
+             ->post('https://api.pinterest.com/v5/pins', [
-         }
+                 'link' => $data['link'],
- 
+                 'title' => $data['title'],
-         $response = Http::withToken($accessToken)
+                 'description' => $data['description'],
-             ->post('https://api.pinterest.com/v5/pins', [
+                 'board_id' => $data['board_id'],
-                 'link' => $data['link'],
+                 'media_source' => [
-                 'title' => $data['title'],
+                     'source_type' => 'image_url',
-                 'description' => $data['description'],
+                     'url' => $data['image_url'],
-                 'board_id' => $data['board_id'],
+                 ],
-                 'media_source' => [
+             ]);
-                     'source_type' => 'image_url',
+ 
-                     'url' => $data['image_url'],
+         if ($response->successful()) {
-                 ],
+             return $response->json();
-             ]);
+         }
-         if ($response->successful()) {
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
-             return $response->json();
+         return null;
-         }
+     }
-         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+     /**
-         return null;
+      * Format and send a blog post to Pinterest.
-     }
+      */
- 
+     public function sendBlogPost(BlogPost $post)
-     /**
+     {
-      * Format and send a blog post to Pinterest.
+         $boardId = $this->getConfigValue('board_id');
-      */
+         if (!$boardId) {
-     public function sendBlogPost(BlogPost $post)
+             Log::info('Pinterest: Skipping post share (No board selected).');
-     {
+             return null;
-         $boardId = $this->getConfigValue('board_id');
+         }
-         if (!$boardId) {
+ 
-             Log::info('Pinterest: Skipping post share (No board selected).');
+         $websiteUrl = config('app.url');
-             return null;
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-         }
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
- 
+         }
-         $websiteUrl = config('app.url');
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
-         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+ 
-             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+         // Pinterest requires a public image URL.
-         }
+         $imageUrl = $post->image_url;
-         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+         if (!str_starts_with($imageUrl, 'http')) {
- 
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
-         // Pinterest requires a public image URL.
+         }
-         $imageUrl = $post->image_url;
+ 
-         if (!str_starts_with($imageUrl, 'http')) {
+         return $this->createPin([
-             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+             'link' => $postUrl,
-         }
+             'title' => Str::limit($post->title, 100),
- 
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
-         return $this->createPin([
+             'board_id' => $boardId,
-             'link' => $postUrl,
+             'image_url' => $imageUrl,
-             'title' => Str::limit($post->title, 100),
+         ]);
-             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+     }
-             'board_id' => $boardId,
+ 
-             'image_url' => $imageUrl,
+     protected function getValidAccessToken()
-         ]);
+     {
-     }
+         $accessToken = $this->getConfigValue('access_token');
- 
+         $expiresAt = $this->getConfigValue('expires_at');
-     protected function getValidAccessToken()
+ 
-     {
+         if (!$accessToken) {
-         $accessToken = $this->getConfigValue('access_token');
+             return null;
-         $expiresAt = $this->getConfigValue('expires_at');
+         }
-         if (!$accessToken) {
+         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
-             return null;
+         if (!$expiresAt) {
-         }
+             return $accessToken;
- 
+         }
-         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
+ 
-         if (!$expiresAt) {
+         if (now()->timestamp > ($expiresAt - 60)) {
-             return $accessToken;
+             return $this->refreshAccessToken();
-         if (now()->timestamp > ($expiresAt - 60)) {
+         return $accessToken;
-             return $this->refreshAccessToken();
+     }
-         }
+ 
- 
+     /* ── Helper Methods ── */
-         return $accessToken;
+ 
-     }
+     protected function getConfigValue(string $key, $default = null)
- 
+     {
-     /* ── Helper Methods ── */
+         $config = $this->config->config ?? [];
- 
+         return $config[$key] ?? $default;
-     protected function getConfigValue(string $key, $default = null)
+     }
-     {
+ 
-         $config = $this->config->config ?? [];
+     protected function updateConfig(array $newData)
-         return $config[$key] ?? $default;
+     {
-     }
+         $currentConfig = $this->config->config ?? [];
- 
+         $this->config->update([
-     protected function updateConfig(array $newData)
+             'config' => array_merge($currentConfig, $newData),
-     {
+             'status' => 'active'
-         $currentConfig = $this->config->config ?? [];
+         ]);
-         $this->config->update([
+     }
-             'config' => array_merge($currentConfig, $newData),
+ }
-             'status' => 'active'
+ 
-         ]);
-     }
- }
- 
- **[what-changed] what-changed in PinterestService.php**: -         $scope = 'boards:read,pins:read,pins:write';
+         $scope = 'boards:read,boards:write,pins:read,pins:write,user_accounts:read';
- **[what-changed] Replaced auth Helper — prevents null/undefined runtime crashes**: -     /**
+     protected function getValidAccessToken()
-      * Get a valid access token (refreshes if expired).
+     {
-      */
+         $accessToken = $this->getConfigValue('access_token');
-     protected function getValidAccessToken()
+         $expiresAt = $this->getConfigValue('expires_at');
-     {
+ 
-         $accessToken = $this->getConfigValue('access_token');
+         if (!$accessToken) {
-         $expiresAt = $this->getConfigValue('expires_at');
+             return null;
- 
+         }
-         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+ 
-             return $this->refreshAccessToken();
+         // If we have no expiry (manual token), we assume it's valid until a refresh is forced or API fails
-         }
+         if (!$expiresAt) {
- 
+             return $accessToken;
-         return $accessToken;
+         }
-     }
+ 
- 
+         if (now()->timestamp > ($expiresAt - 60)) {
-     /* ── Helper Methods ── */
+             return $this->refreshAccessToken();
- 
+         }
-     protected function getConfigValue(string $key, $default = null)
+ 
-     {
+         return $accessToken;
-         $config = $this->config->config ?? [];
+     }
-         return $config[$key] ?? $default;
+ 
-     }
+     /* ── Helper Methods ── */
-     protected function updateConfig(array $newData)
+     protected function getConfigValue(string $key, $default = null)
-         $currentConfig = $this->config->config ?? [];
+         $config = $this->config->config ?? [];
-         $this->config->update([
+         return $config[$key] ?? $default;
-             'config' => array_merge($currentConfig, $newData),
+     }
-             'status' => 'active'
+ 
-         ]);
+     protected function updateConfig(array $newData)
-     }
+     {
- }
+         $currentConfig = $this->config->config ?? [];
- 
+         $this->config->update([
+             'config' => array_merge($currentConfig, $newData),
+             'status' => 'active'
+         ]);
+     }
+ }
+ 
- **[what-changed] Added OAuth2 authentication — prevents null/undefined runtime crashes**: -             ]);
+                 'client_id' => $clientId,
- 
+                 'client_secret' => $clientSecret,
-         if ($response->successful()) {
+             ]);
-             $data = $response->json();
+ 
-             $this->updateConfig([
+         if ($response->successful()) {
-                 'access_token' => $data['access_token'],
+             $data = $response->json();
-                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
+             $this->updateConfig([
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+                 'access_token' => $data['access_token'],
-             ]);
+                 'refresh_token' => $data['refresh_token'] ?? $this->getConfigValue('refresh_token'),
-             return $data;
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         }
+             ]);
- 
+             return $data;
-         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
+         }
-         return null;
+ 
-     }
+         Log::error('Pinterest OAuth Token Exchange Failed: ' . $response->body());
- 
+         return null;
-     /**
+     }
-      * Refresh the access token using the refresh token.
+ 
-      */
+     /**
-     public function refreshAccessToken()
+      * Refresh the access token using the refresh token.
-     {
+      */
-         $clientId = $this->getConfigValue('client_id');
+     public function refreshAccessToken()
-         $client[REDACTED]
+     {
-         $refreshToken = $this->getConfigValue('refresh_token');
+         $clientId = $this->getConfigValue('client_id');
- 
+         $client[REDACTED]
-         if (!$refreshToken) {
+         $refreshToken = $this->getConfigValue('refresh_token');
-             return null;
+ 
-         }
+         if (!$refreshToken) {
- 
+             return null;
-         $response = Http::asForm()
+         }
-             ->withBasicAuth($clientId, $clientSecret)
+ 
-             ->post('https://api.pinterest.com/v5/oauth/token', [
+         $response = Http::asForm()
-                 'grant_type' => 'refresh_token',
+             ->withBasicAuth($clientId, $clientSecret)
-                 'refresh_token' => $refreshToken,
+             ->post('https://api.pinterest.com/v5/oauth/token', [
-             ]);
+                 'grant_type' => 'refresh_token',
- 
+                 'refresh_token' => $refreshToken,
-         if ($response->successful()) {
+             ]);
-             $data = $response->json();
+ 
-             $this->updateConfig([
+         if ($response->successful()) {
-                 'access_token' => $data['access_token'],
+             $data = $response->json();
-                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
+             $this->updateConfig([
-             ]);
+                 'access_token' => $data['access_token'],
-             return $data['access_token'];
+                 'expires_at' => now()->addSeconds($data['expires_in'])->timestamp,
-         }
+             ]);
- 
+             return $data['access_token'];
-         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
+         }
-         return null;
+ 
-     }
+         Log::error('Pinterest Token Refresh Failed: ' . $response->body());
- 
+         return null;
-     /**
+     }
-      * Get the Pinterest Boards for the authorized user.
+ 
-      */
+     /**
-     public function getBoards()
+      * Get the Pinterest Boards for the authorized user.
-     {
+      */
-         $accessToken = $this->getValidAccessToken();
+     public function getBoards()
-         if (!$accessToken) {
+     {
-             return [];
+         $accessToken = $this->getValidAccessToken();
-         }
+         if (!$accessToken) {
- 
+             return [];
-         $response = Http::withToken($accessToken)
+         }
-             ->get('https://api.pinterest.com/v5/boards');
+ 
- 
+         $response = Http::withToken($accessToken)
-         if ($response->successful()) {
+             ->get('https://api.pinterest.com/v5/boards');
-             $data = $response->json();
+ 
-             $this->config->update(['boards' => $data['items']]);
+         if ($response->successful()) {
-             return $data['items'];
+             $data = $response->json();
-         }
+             $this->config->update(['boards' => $data['items']]);
- 
+             return $data['items'];
-         Log::error('Pinterest Get Boards Failed: ' . $response->body());
+         }
-         return [];
+ 
-     }
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
- 
+         return [];
-     /**
+     }
-      * Create a new Pin on Pinterest.
+ 
-      */
+     /**
-     public function createPin(array $data)
+      * Create a new Pin on Pinterest.
-     {
+      */
-         $accessToken = $this->getValidAccessToken();
+     public function createPin(array $data)
-         if (!$accessToken) {
+     {
-             Log::error('Pinterest Create Pin Failed: No valid access token.');
+         $accessToken = $this->getValidAccessToken();
-             return null;
+         if (!$accessToken) {
-         }
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
- 
+             return null;
-         $response = Http::withToken($accessToken)
+         }
-             ->post('https://api.pinterest.com/v5/pins', [
+ 
-                 'link' => $data['link'],
+         $response = Http::withToken($accessToken)
-                 'title' => $data['title'],
+             ->post('https://api.pinterest.com/v5/pins', [
-                 'description' => $data['description'],
+                 'link' => $data['link'],
-                 'board_id' => $data['board_id'],
+                 'title' => $data['title'],
-                 'media_source' => [
+                 'description' => $data['description'],
-                     'source_type' => 'image_url',
+                 'board_id' => $data['board_id'],
-                     'url' => $data['image_url'],
+                 'media_source' => [
-                 ],
+                     'source_type' => 'image_url',
-             ]);
+                     'url' => $data['image_url'],
- 
+                 ],
-         if ($response->successful()) {
+             ]);
-             return $response->json();
+ 
-         }
+         if ($response->successful()) {
- 
+             return $response->json();
-         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+         }
-         return null;
+ 
-     }
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
- 
+         return null;
-     /**
+     }
-      * Format and send a blog post to Pinterest.
+ 
-      */
+     /**
-     public function sendBlogPost(BlogPost $post)
+      * Format and send a blog post to Pinterest.
-     {
+      */
-         $boardId = $this->getConfigValue('board_id');
+     public function sendBlogPost(BlogPost $post)
-         if (!$boardId) {
+     {
-             Log::info('Pinterest: Skipping post share (No board selected).');
+         $boardId = $this->getConfigValue('board_id');
-             return null;
+         if (!$boardId) {
-         }
+             Log::info('Pinterest: Skipping post share (No board selected).');
- 
+             return null;
-         $websiteUrl = config('app.url');
+         }
-         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+ 
-             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+         $websiteUrl = config('app.url');
-         }
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
-         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
- 
+         }
-         // Pinterest requires a public image URL.
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
-         $imageUrl = $post->image_url;
+ 
-         if (!str_starts_with($imageUrl, 'http')) {
+         // Pinterest requires a public image URL.
-             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+         $imageUrl = $post->image_url;
-         }
+         if (!str_starts_with($imageUrl, 'http')) {
- 
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
-         return $this->createPin([
+         }
-             'link' => $postUrl,
+ 
-             'title' => Str::limit($post->title, 100),
+         return $this->createPin([
-             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+             'link' => $postUrl,
-             'board_id' => $boardId,
+             'title' => Str::limit($post->title, 100),
-             'image_url' => $imageUrl,
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
-         ]);
+             'board_id' => $boardId,
-     }
+             'image_url' => $imageUrl,
- 
+         ]);
-     /**
+     }
-      * Get a valid access token (refreshes if expired).
+ 
-      */
+     /**
-     protected function getValidAccessToken()
+      * Get a valid access token (refreshes if expired).
-     {
+      */
-         $accessToken = $this->getConfigValue('access_token');
+     protected function getValidAccessToken()
-         $expiresAt = $this->getConfigValue('expires_at');
+     {
- 
+         $accessToken = $this->getConfigValue('access_token');
-         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+         $expiresAt = $this->getConfigValue('expires_at');
-             return $this->refreshAccessToken();
+ 
-         }
+         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
- 
+             return $this->refreshAccessToken();
-         return $accessToken;
+         }
-     }
+ 
- 
+         return $accessToken;
-     /* ── Helper Methods ── */
+     }
-     protected function getConfigValue(string $key, $default = null)
+     /* ── Helper Methods ── */
-     {
+ 
-         $config = $this->config->config ?? [];
+     protected function getConfigValue(string $key, $default = null)
-         return $config[$key] ?? $default;
+     {
-     }
+         $config = $this->config->config ?? [];
- 
+         return $config[$key] ?? $default;
-     protected function updateConfig(array $newData)
+     }
-     {
+ 
-         $currentConfig = $this->config->config ?? [];
+     protected function updateConfig(array $newData)
-         $this->config->update([
+     {
-             'config' => array_merge($currentConfig, $newData),
+         $currentConfig = $this->config->config ?? [];
-             'status' => 'active'
+         $this->config->update([
-         ]);
+             'config' => array_merge($currentConfig, $newData),
-     }
+             'status' => 'active'
- }
+         ]);
- 
+     }
+ }
+ 
- **[what-changed] what-changed in PinterestService.php**: -         $redirectUri = url('/api/admin/pinterest/callback');
+         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
- **[convention] what-changed in PinterestService.php — confirmed 3x**: -         $redirectUri = rtrim(config('app.url'), '/') . '/api/admin/pinterest/callback';
+         $redirectUri = rtrim(env('APP_URL', 'https://upgradercx.com'), '/') . '/api/admin/pinterest/callback';
- **[what-changed] what-changed in PinterestService.php**: -         $redirectUri = url('/api/admin/pinterest/callback');
+         $redirectUri = rtrim(config('app.url'), '/') . '/api/admin/pinterest/callback';
- **[what-changed] Replaced auth Pinterest — prevents null/undefined runtime crashes**: -      * Get a valid access token (refreshes if expired).
+      * Get the Pinterest Boards for the authorized user.
-     protected function getValidAccessToken()
+     public function getBoards()
-         $accessToken = $this->getConfigValue('access_token');
+         $accessToken = $this->getValidAccessToken();
-         $expiresAt = $this->getConfigValue('expires_at');
+         if (!$accessToken) {
- 
+             return [];
-         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+         }
-             return $this->refreshAccessToken();
+ 
-         }
+         $response = Http::withToken($accessToken)
- 
+             ->get('https://api.pinterest.com/v5/boards');
-         return $accessToken;
+ 
-     }
+         if ($response->successful()) {
- 
+             $data = $response->json();
-     /* ── Helper Methods ── */
+             $this->config->update(['boards' => $data['items']]);
- 
+             return $data['items'];
-     protected function getConfigValue(string $key, $default = null)
+         }
-     {
+ 
-         $config = $this->config->config ?? [];
+         Log::error('Pinterest Get Boards Failed: ' . $response->body());
-         return $config[$key] ?? $default;
+         return [];
-     protected function updateConfig(array $newData)
+     /**
-     {
+      * Create a new Pin on Pinterest.
-         $currentConfig = $this->config->config ?? [];
+      */
-         $this->config->update([
+     public function createPin(array $data)
-             'config' => array_merge($currentConfig, $newData),
+     {
-             'status' => 'active'
+         $accessToken = $this->getValidAccessToken();
-         ]);
+         if (!$accessToken) {
-     }
+             Log::error('Pinterest Create Pin Failed: No valid access token.');
- }
+             return null;
- 
+         }
+ 
+         $response = Http::withToken($accessToken)
+             ->post('https://api.pinterest.com/v5/pins', [
+                 'link' => $data['link'],
+                 'title' => $data['title'],
+                 'description' => $data['description'],
+                 'board_id' => $data['board_id'],
+                 'media_source' => [
+                     'source_type' => 'image_url',
+                     'url' => $data['image_url'],
+                 ],
+             ]);
+ 
+         if ($response->successful()) {
+             return $response->json();
+         }
+ 
+         Log::error('Pinterest Create Pin Failed: ' . $response->body());
+         return null;
+     }
+ 
+     /**
+      * Format and send a blog post to Pinterest.
+      */
+     public function sendBlogPost(BlogPost $post)
+     {
+         $boardId = $this->getConfigValue('board_id');
+         if (!$boardId) {
+             Log::info('Pinterest: Skipping post share (No board selected).');
+             return null;
+         }
+ 
+         $websiteUrl = config('app.url');
+         if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
+             $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
+         }
+         $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
+ 
+         // Pinterest requires a public image URL.
+         $imageUrl = $post->image_url;
+         if (!str_starts_with($imageUrl, 'http')) {
+             $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
+         }
+ 
+         return $this->createPin([
+             'link' => $postUrl,
+             'title' => Str::limit($post->title, 100),
+             'description' => Str::limit(strip_tags($post->excerpt ?? $post->content), 500),
+             'board_id' => $boardId,
+             'image_url' => $imageUrl,
+         ]);
+     }
+ 
+     /**
+      * Get a valid access token (refreshes if expired).
+      */
+     protected function getValidAccessToken()
+     {
+         $accessToken = $this->getConfigValue('access_token');
+         $expiresAt = $this->getConfigValue('expires_at');
+ 
+         if (!$accessToken || (now()->timestamp > ($expiresAt - 60))) {
+             return $this->refreshAccessToken();
+         }
+ 
+         return $accessToken;
+     }
+ 
+     /* ── Helper Methods ── */
+ 
+     protected function getConfigValue(string $key, $default = null)
+     {
+         $config = $this->config->config ?? [];
+         return $config[$key] ?? $default;
+     }
+ 
+     protected function updateConfig(array $newData)
+     {
+         $currentConfig = $this->config->config ?? [];
+         $this->config->update([
+             'config' => array_merge($currentConfig, $newData),
+             'status' => 'active'
+         ]);
+     }
+ }
+ 
- **[what-changed] what-changed in PinterestService.php**: File updated (external): api/app/Services/PinterestService.php

Content summary (142 lines):
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
        $clientId = $this->getConfigValue('cl
