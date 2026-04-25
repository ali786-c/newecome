<?php

namespace App\Services;

use Illuminate\Support\Facades\View;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketMessage;

class MailjetMailService
{
    protected MailjetService $mailjet;

    public function __construct(MailjetService $mailjet)
    {
        $this->mailjet = $mailjet;
    }

    /**
     * Send order receipt/confirmation email.
     */
    public function sendOrderReceipt(Order $order)
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;

        $html = View::make('emails.orders.receipt', ['order' => $order])->render();
        
        return $this->mailjet->send(
            $user->email,
            $user->name ?? 'Customer',
            "Order Confirmation #{$order->order_number} 💎",
            $html
        );
    }

    /**
     * Send order delivered (fulfillment) email.
     */
    public function sendOrderDelivered(Order $order)
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;

        $html = View::make('emails.orders.delivered', ['order' => $order])->render();
        
        return $this->mailjet->send(
            $user->email,
            $user->name ?? 'Customer',
            "Your Order #{$order->order_number} has been delivered! 🎁",
            $html
        );
    }

    /**
     * Send ticket update notification.
     */
    public function sendTicketUpdate(Ticket $ticket, ?TicketMessage $latestMessage = null)
    {
        $user = $ticket->user;
        if (!$user || !$user->email) return false;

        $messagePreview = $latestMessage ? strip_tags($latestMessage->message) : null;

        $html = View::make('emails.tickets.notification', [
            'ticket' => $ticket,
            'user' => $user,
            'messagePreview' => $messagePreview
        ])->render();
        
        return $this->mailjet->send(
            $user->email,
            $user->name,
            "Ticket Update #{$ticket->id}: {$ticket->subject} 💬",
            $html
        );
    }

    /**
     * Send Welcome Email
     */
    public function sendWelcomeEmail(\App\Models\User $user)
    {
        if (!$user->email) return false;
        $html = View::make('emails.auth.welcome', ['user' => $user])->render();
        return $this->mailjet->send($user->email, $user->name, "Welcome to UpgraderCX! 🚀", $html);
    }

    /**
     * Send Wallet Deposit Confirmation
     */
    public function sendDepositConfirmation(\App\Models\WalletTransaction $tx)
    {
        $user = $tx->user;
        if (!$user || !$user->email) return false;
        $html = View::make('emails.wallet.deposit', ['tx' => $tx, 'user' => $user])->render();
        return $this->mailjet->send($user->email, $user->name, "Wallet Top-Up Confirmed! 💰", $html);
    }

    /**
     * Send Order Confirmation (Initial Payment Receipt)
     */
    public function sendOrderConfirmation(Order $order)
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;
        $html = View::make('emails.orders.confirmation', ['order' => $order, 'user' => $user])->render();
        return $this->mailjet->send($user->email, $user->name, "Payment Success! Order #{$order->order_number} 💎", $html);
    }

    /**
     * Send Password Reset Email
     */
    public function sendPasswordReset($user, string $url)
    {
        if (!$user || !$user->email) return false;

        $html = View::make('emails.auth.reset', [
            'user' => $user,
            'url'  => $url
        ])->render();

        return $this->mailjet->send(
            $user->email,
            $user->name ?? 'Customer',
            "Reset Your UpgraderCX Password 🔐",
            $html
        );
    }
}
