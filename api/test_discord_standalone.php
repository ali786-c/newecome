<?php

// Standalone test for Discord Notification logic
// Usage: php api/test_discord_standalone.php "YOUR_WEBHOOK_URL"

if ($argc < 2) {
    echo "Usage: php api/test_discord_standalone.php <webhook_url>\n";
    exit(1);
}

$webhookUrl = $argv[1];

echo "Testing Discord Standalone Notification...\n";
echo "Webhook: " . substr($webhookUrl, 0, 30) . "...\n";

function sendMockOrderNotification($webhookUrl) {
    $order_number = "#00567";
    $customer = "John Doe (Test)";
    $total = "$99.90";
    $payment_method = "Wallet Payment";
    $items = "- PUBG 60 UC (x1)\n- Netflix Premium (x2)";

    $payload = [
        'username' => 'UpgraderCX Alerts (Test)',
        'embeds' => [
            [
                'title' => "🎉 New Order Received! " . $order_number,
                'description' => "A new order has been placed on the store. (STANDALONE TEST)",
                'color' => 3066993, // Green
                'fields' => [
                    [
                        'name' => 'Customer',
                        'value' => $customer,
                        'inline' => true
                    ],
                    [
                        'name' => 'Total Amount',
                        'value' => '**' . $total . '**',
                        'inline' => true
                    ],
                    [
                        'name' => 'Payment Method',
                        'value' => $payment_method,
                        'inline' => true
                    ],
                    [
                        'name' => 'Items',
                        'value' => $items,
                        'inline' => false
                    ]
                ],
                'timestamp' => date('c')
            ]
        ]
    ];

    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return true;
    } else {
        echo "Error: HTTP $httpCode - $response\n";
        return false;
    }
}

$result = sendMockOrderNotification($webhookUrl);

if ($result) {
    echo "✅ Standalone Discord Notification sent successfully!\n";
} else {
    echo "❌ Failed to send Standalone Discord Notification.\n";
}
