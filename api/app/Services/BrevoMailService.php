<?php

namespace App\Services;

use Illuminate\Support\Facades\View;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketMessage;

class BrevoMailService
{
    protected BrevoService $brevo;

    public function __construct(BrevoService $brevo)
    {
        $this->brevo = $brevo;
    }

    /**
     * Phase 2/3: Send order receipt/confirmation email.
     */
    public function sendOrderReceipt(Order $order): bool
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;

        $html = View::make('emails.orders.receipt', ['order' => $order])->render();
        
        return $this->brevo->send(
            $user->email,
            $user->name ?? 'Customer',
            "Order Confirmation #{$order->order_number} 💎",
            $html
        );
    }

    /**
     * Phase 2/3: Send order delivered (fulfillment) email.
     */
    public function sendOrderDelivered(Order $order): bool
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;

        $html = View::make('emails.orders.delivered', ['order' => $order])->render();
        
        return $this->brevo->send(
            $user->email,
            $user->name ?? 'Customer',
            "Your Order #{$order->order_number} has been delivered! 🎁",
            $html
        );
    }

    /**
     * Phase 2: Send ticket update notification.
     */
    public function sendTicketUpdate(Ticket $ticket, ?TicketMessage $latestMessage = null): bool
    {
        $user = $ticket->user;
        if (!$user || !$user->email) return false;

        $messagePreview = $latestMessage ? strip_tags($latestMessage->message) : null;

        $html = View::make('emails.tickets.notification', [
            'ticket' => $ticket,
            'user' => $user,
            'messagePreview' => $messagePreview
        ])->render();
        
        return $this->brevo->send(
            $user->email,
            $user->name,
            "Ticket Update #{$ticket->id}: {$ticket->subject} 💬",
            $html
        );
    }

    /**
     * Phase 3: Send Welcome Email
     */
    public function sendWelcomeEmail(\App\Models\User $user): bool
    {
        if (!$user->email) return false;
        $html = View::make('emails.auth.welcome', ['user' => $user])->render();
        return $this->brevo->send($user->email, $user->name, "Welcome to UpgraderCX! 🚀", $html);
    }

    /**
     * Phase 3: Send Wallet Deposit Confirmation
     */
    public function sendDepositConfirmation(\App\Models\WalletTransaction $tx): bool
    {
        $user = $tx->user;
        if (!$user || !$user->email) return false;
        $html = View::make('emails.wallet.deposit', ['tx' => $tx, 'user' => $user])->render();
        return $this->brevo->send($user->email, $user->name, "Wallet Top-Up Confirmed! 💰", $html);
    }

    /**
     * Phase 3: Send Order Confirmation (Initial Payment Receipt)
     */
    public function sendOrderConfirmation(Order $order): bool
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;
        $html = View::make('emails.orders.confirmation', ['order' => $order, 'user' => $user])->render();
        return $this->brevo->send($user->email, $user->name, "Payment Success! Order #{$order->order_number} 💎", $html);
    }
}
