<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    protected $fulfillmentService;

    public function __construct(OrderFulfillmentService $fulfillmentService)
    {
        $this->fulfillmentService = $fulfillmentService;
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if the status has just been changed to 'completed'
        if ($order->isDirty('status') && $order->status === 'completed') {
            Log::info("Order #{$order->id} marked as completed. Dispatching FulfillOrderJob.");
            
            \App\Jobs\FulfillOrderJob::dispatch($order);
        }
    }
}
