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
     * Send order receipt/confirmation email.
     */
    public function sendOrderReceipt(Order $order): bool
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;

        $html = View::make('emails.orders.receipt', ['order' => $order])->render();
        
        return $this->brevo->send(
            $user->email,
            $user->name ?? 'Customer',
            "Order Confirmation #{$order->order_number}",
            $html
        );
    }

    /**
     * Send order delivered (fulfillment) email.
     */
    public function sendOrderDelivered(Order $order): bool
    {
        $user = $order->user;
        if (!$user || !$user->email) return false;

        $html = View::make('emails.orders.delivered', ['order' => $order])->render();
        
        return $this->brevo->send(
            $user->email,
            $user->name ?? 'Customer',
            "Your Order #{$order->order_number} has been delivered!",
            $html
        );
    }

    /**
     * Send ticket update notification.
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
            "Ticket Update #{$ticket->id}: {$ticket->subject}",
            $html
        );
    }
}
