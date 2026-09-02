<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\OrderFulfillmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FulfillOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(OrderFulfillmentService $service): void
    {
        Log::info("Executing FulfillOrderJob for Order #{$this->order->id}");
        
        try {
            $service->fulfill($this->order);
        } catch (\Exception $e) {
            Log::error("FulfillOrderJob Failed for Order #{$this->order->id}: " . $e->getMessage());
            $this->order->update(['fulfillment_status' => 'failed']);
            throw $e;
        }
    }
}
