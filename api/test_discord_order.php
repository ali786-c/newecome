<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\DiscordService;
use Illuminate\Support\Collection;

// Mocking the behavior without DB connection
echo "Testing Discord Order Notification (Mocked Order)...\n";

// 1. Create a mock order
$order = new Order();
$order->id = 12345;
$order->total = 29.99;
$order->currency = '$';
$order->payment_method = 'wallet_payment';
$order->created_at = now();

// 2. Mock User
$user = new User(['name' => 'John Doe Test']);
$order->setRelation('user', $user);

// 3. Mock Items
$item1 = new OrderItem(['product_name' => 'PUBG 60 UC', 'quantity' => 1]);
$item2 = new OrderItem(['product_name' => 'Netflix Premium 1 Month', 'quantity' => 2]);
$order->setRelation('items', new Collection([$item1, $item2]));

// 4. Send notification
$service = new DiscordService();

// We need to bypass the DB check for config if possible, or just expect it to fail if DB is down.
// However, DiscordService::first() will trigger DB connection.
// Let's try to mock the config too if we can, but Laravel's first() is hard to mock without proper setup.

try {
    $result = $service->sendOrderNotification($order);
    if ($result) {
        echo "✅ Discord Notification sent successfully!\n";
    } else {
        echo "❌ Failed to send Discord Notification. Check if DB is running for config fetch.\n";
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
