<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;
use App\Models\SupplierConnection;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;

class AdminNotificationService
{
    protected BrevoService $brevo;
    protected DiscordService $discord;
    protected string $adminEmail;

    public function __construct(BrevoService $brevo, DiscordService $discord)
    {
        $this->brevo = $brevo;
        $this->discord = $discord;
        // Default to MAIL_FROM_ADDRESS or a specific ADMIN_EMAIL if defined
        $this->adminEmail = config('mail.admin_recipient') ?? config('mail.from.address');
    }

    /**
     * Notify admin of a new order.
     */
    public function notifyNewOrder(Order $order): bool
    {
        Log::info("AdminNotify: Starting notification process for Order #{$order->order_number}");
        try {
            // 1. Send Discord Notification (New)
            Log::info("AdminNotify: Dispatching Discord notification for Order #{$order->order_number}");
            $this->discord->sendOrderNotification($order);

            // 2. Send Email Notification (Existing)
            Log::info("AdminNotify: Dispatching Brevo email notification for Order #{$order->order_number}");
            $html = View::make('emails.admin.new_order', ['order' => $order])->render();
            return $this->brevo->send(
                $this->adminEmail,
                'Admin',
                "🎉 New Order Received! #{$order->order_number}",
                $html
            );
        } catch (\Exception $e) {
            Log::error("AdminNotify ERROR for Order #{$order->order_number}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify admin of a new support ticket.
     */
    public function notifyNewTicket(Ticket $ticket): bool
    {
        try {
            $html = View::make('emails.admin.new_ticket', ['ticket' => $ticket])->render();
            return $this->brevo->send(
                $this->adminEmail,
                'Admin',
                "🎟️ New Support Ticket: {$ticket->subject}",
                $html
            );
        } catch (\Exception $e) {
            Log::error("New Ticket Admin Alert failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify admin of a low supplier balance.
     */
    public function notifyLowBalance(SupplierConnection $supplier): bool
    {
        try {
            $html = View::make('emails.admin.low_balance', ['supplier' => $supplier])->render();
            return $this->brevo->send(
                $this->adminEmail,
                'Admin',
                "⚠️ ALERT: Low Supplier Balance ({$supplier->name})",
                $html
            );
        } catch (\Exception $e) {
            Log::error("Low Balance Admin Alert failed for {$supplier->name}: " . $e->getMessage());
            return false;
        }
    }
}
