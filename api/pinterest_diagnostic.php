<?php
// pinterest_diagnostic.php

use App\Models\PinterestConfig;
use Illuminate\Support\Facades\Log;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>Pinterest Integration Diagnostic</h1>";

$configs = PinterestConfig::all();
echo "<h2>Database Records (Total: " . $configs->count() . ")</h2>";

foreach ($configs as $cfg) {
    echo "<div style='border:1px solid #ccc; padding:10px; margin-bottom:10px;'>";
    echo "<b>ID:</b> " . $cfg->id . "<br>";
    echo "<b>Status:</b> " . $cfg->status . "<br>";
    echo "<b>Config Data Keys:</b> " . implode(', ', array_keys($cfg->config ?? [])) . "<br>";
    
    $c = $cfg->config ?? [];
    echo "<b>Access Token Set:</b> " . (isset($c['access_token']) ? 'YES' : 'NO') . "<br>";
    if (isset($c['access_token'])) {
        echo "<b>Access Token Preview:</b> " . substr($c['access_token'], 0, 10) . "...<br>";
    }
    echo "<b>Board ID Set:</b> " . (isset($c['board_id']) && !empty($c['board_id']) ? 'YES (' . $c['board_id'] . ')' : 'NO') . "<br>";
    echo "<b>Expires At:</b> " . ($c['expires_at'] ?? 'NULL') . "<br>";
    echo "</div>";
}

if ($configs->count() == 0) {
    echo "<p style='color:red;'>No records found in pinterest_configs table!</p>";
}

echo "<h2>Manual Manual Test</h2>";
$service = new \App\Services\PinterestService();
$token = (new \ReflectionClass($service))->getMethod('getValidAccessToken');
$token->setAccessible(true);
$validToken = $token->invoke($service);

echo "<b>Service getValidAccessToken result:</b> " . ($validToken ? "SUCCESS (".substr($validToken,0,10)."...)" : "FAILED (NULL)") . "<br>";

echo "<hr><p>Please delete this file after use for security.</p>";
