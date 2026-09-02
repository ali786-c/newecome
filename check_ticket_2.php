<?php

require __DIR__ . '/api/vendor/autoload.php';
$app = require_once __DIR__ . '/api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Ticket;
use App\Models\User;

$ticketId = 2;
$ticket = Ticket::find($ticketId);

if (!$ticket) {
    echo "Ticket $ticketId not found.\n";
    exit;
}

echo "Ticket ID: " . $ticket->id . "\n";
echo "Subject: " . $ticket->subject . "\n";
echo "User ID: " . $ticket->user_id . "\n";
echo "Status: " . $ticket->status . "\n";

$owner = User::find($ticket->user_id);
if ($owner) {
    echo "Owner Name: " . $owner->name . "\n";
    echo "Owner Email: " . $owner->email . "\n";
} else {
    echo "Owner not found.\n";
}

$currentUser = auth()->user();
if ($currentUser) {
    echo "Current Logged-in User ID: " . $currentUser->id . "\n";
} else {
    echo "No user currently logged in via CLI (expected).\n";
}
