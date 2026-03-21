<?php
// pinterest_exchange_debug.php

use App\Models\PinterestConfig;
use Illuminate\Support\Facades\Http;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$code = $_GET['code'] ?? '';

if (empty($code)) {
    die("Error: Please provide a 'code' from the Pinterest redirect URL. Example: ?code=xyz...");
}

$cfg = PinterestConfig::first();
$config = $cfg->config ?? [];

$clientId = $config['client_id'] ?? '';
$clientSecret = $config['client_secret'] ?? '';
$redirectUri = 'https://upgradercx.com/api/admin/pinterest/callback';

echo "<h1>Pinterest Exchange Debug</h1>";
echo "<b>Client ID:</b> $clientId<br>";
echo "<b>Redirect URI:</b> $redirectUri<br>";
echo "<b>Code:</b> $code<br><hr>";

$auth = base64_encode($clientId . ':' . $clientSecret);

echo "<h2>Attempting Exchange...</h2>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.pinterest.com/v5/oauth/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'code' => $code,
    'redirect_uri' => $redirectUri,
    'grant_type' => 'authorization_code'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Basic ' . $auth,
    'Content-Type: application/x-www-form-urlencoded'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);

echo "<b>HTTP Status:</b> " . $info['http_code'] . "<br>";
echo "<b>Response Body:</b> <pre>" . htmlspecialchars($result) . "</pre>";

if ($info['http_code'] == 200) {
    echo "<p style='color:green;'>SUCCESS! Token exchanged. You can now save the access_token manually.</p>";
} else {
    echo "<p style='color:red;'>FAILED. Check if Client Secret is 100% correct or if the code has expired.</p>";
}
