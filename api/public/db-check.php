<?php
/**
 * UpgraderCX Database Connection Diagnostic Tool
 * Upload this to your 'api/public' folder and visit https://your-domain.com/api/db-check.php
 */

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

define('LARAVEL_START', microtime(true));

// Load Laravel Bootstrap
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

header('Content-Type: text/html');
echo "<html><head><title>DB Check — UpgraderCX</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;background:#f4f7f6;} .container{max-width:800px;margin:0 auto;background:white;padding:30px;border-radius:8px;shadow:0 2px 10px rgba(0,0,0,0.1);} h1{color:#2d3748;} .info{background:#edf2f7;padding:15px;border-radius:5px;font-family:monospace;margin-bottom:20px;} .status{font-weight:bold;margin-top:20px;padding:10px;border-radius:5px;} .ok{background:#c6f6d5;color:#22543d;} .error{background:#fed7d7;color:#742a2a;}</style></head><body>";
echo "<div class='container'>";
echo "<h1>UpgraderCX Database Diagnostic</h1>";

try {
    $connection = config('database.default');
    $config = config("database.connections.$connection");
    $database = $config['database'] ?? 'unknown';
    $host = $config['host'] ?? 'N/A';
    $driver = $config['driver'] ?? 'unknown';

    echo "<p><strong>Active Laravel Connection:</strong></p>";
    echo "<div class='info'>";
    echo "Connection Type: " . strtoupper($connection) . "<br>";
    echo "Driver: " . $driver . "<br>";
    echo "Host: " . $host . "<br>";
    echo "Database: " . $database . "<br>";
    echo "</div>";

    // Test the actual connection
    $pdo = DB::connection()->getPdo();
    $dbName = DB::connection()->getDatabaseName();
    
    echo "<div class='status ok'>";
    echo "✅ Successfully connected to the database: <strong>$dbName</strong>";
    echo "</div>";

    // Count products
    $count = DB::table('products')->count();
    $supplierProducts = DB::table('supplier_products')->count();
    
    echo "<p><strong>Database Stats:</strong></p>";
    echo "<ul>";
    echo "<li>Total Products in `products` table: <strong>$count</strong></li>";
    echo "<li>Total Cached Supplier Products: <strong>$supplierProducts</strong></li>";
    echo "</ul>";

    if ($connection === 'sqlite') {
        echo "<p style='color:#c05621; font-weight:bold;'>⚠️ WARNING: Your app is using SQLITE. It should be using MYSQL for cPanel production.</p>";
        echo "<p>File path: " . database_path('database.sqlite') . "</p>";
    }

} catch (\Exception $e) {
    echo "<div class='status error'>";
    echo "❌ CONNECTION FAILED: " . $e->getMessage();
    echo "</div>";
    
    echo "<p><strong>Debug Info:</strong></p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<p style='margin-top:40px; font-size:12px; color:#a0aec0;'>Delete this file once diagnostics are complete for security.</p>";
echo "</div></body></html>";
