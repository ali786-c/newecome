$service = new App\Services\PayHubService();
$payload = ['order_id' => '123', 'amount' => 29.99, 'currency' => 'EUR'];
$sig = $service->generateSignature($payload);
echo 'Generated Signature: ' . $sig . PHP_EOL;
$isValid = $service->verifyWebhookSignature($payload, $sig);
echo 'Verification: ' . ($isValid ? 'SUCCESS' : 'FAILED') . PHP_EOL;
if (!$isValid) exit(1);
