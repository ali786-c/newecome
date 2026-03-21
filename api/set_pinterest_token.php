<?php
// set_pinterest_token.php

use App\Models\PinterestConfig;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = $_GET['token'] ?? '';
$boardId = $_GET['board_id'] ?? '1114992888936092227';

if (empty($token)) {
    die("Error: Please provide a token. Example: ?token=pina_...");
}

$cfg = PinterestConfig::firstOrCreate(['id' => 1]);
$currentConfig = $cfg->config ?? [];

$cfg->update([
    'config' => array_merge($currentConfig, [
        'access_token' => $token,
        'board_id' => $boardId,
        'expires_at' => null
    ]),
    'status' => 'active'
]);

echo "<h1>SUCCESS!</h1>";
echo "<p>Pinterest Access Token and Board ID have been manually set in the database.</p>";
echo "<p><b>Token:</b> " . substr($token, 0, 10) . "...</p>";
echo "<p><b>Board ID:</b> $boardId</p>";
echo "<hr><p>Ab aap wapis admin panel mein ja kar 'Test' button check karein. <b>Is file ko foran delete kar dein security ke liye.</b></p>";
