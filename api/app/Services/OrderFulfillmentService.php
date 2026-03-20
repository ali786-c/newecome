<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SupplierConnection;
use App\Services\Suppliers\SupplierServiceFactory;
use App\Mail\OrderDelivered;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderFulfillmentService
{
    protected $factory;

    public function __construct(SupplierServiceFactory $factory)
    {
        $this->factory = $factory;
    }

    /**
     * Fulfill an entire order by coordinating with multiple suppliers.
     */
    public function fulfill(Order $order): array
    {
        Log::info("Starting fulfillment for Order #{$order->id}");
        
        $order->update(['fulfillment_status' => 'processing']);
        
        $itemsBySupplier = [];
        foreach ($order->items as $item) {
            $supplierId = $item->product->supplier_id ?? null;
            if ($supplierId) {
                $itemsBySupplier[$supplierId][] = $item;
            }
        }

        if (empty($itemsBySupplier)) {
            Log::info("Order #{$order->id} has no supplier-linked products. Marking as delivered.");
            $order->update(['fulfillment_status' => 'delivered']);
            return ['status' => 'delivered', 'message' => 'No supplier products to fulfill.'];
        }

        $allSuccessful = true;
        $outputs = [];

        foreach ($itemsBySupplier as $supplierId => $items) {
            try {
                $connection = SupplierConnection::where('id', $supplierId)
                    ->where('is_active', true)
                    ->first();

                if (!$connection) {
                    Log::error("No active connection found for Supplier ID/Connection ID: {$supplierId}");
                    $allSuccessful = false;
                    continue;
                }

                Log::info("Found active connection #{$connection->id} for supplier. Initializing service...");

                $service = $this->factory->make($connection);
                $result = $service->placeOrder($order);
                
                $outputs[$supplierId] = $result;

                foreach ($result as $itemResult) {
                    if ($itemResult['status'] !== 'SUCCESS') {
                        $allSuccessful = false;
                    }
                }

            } catch (Exception $e) {
                Log::error("Fulfillment Exception for Order #{$order->id}, Supplier #{$supplierId}: " . $e->getMessage());
                $allSuccessful = false;
            }
        }

        $finalStatus = $allSuccessful ? 'delivered' : 'failed';
        $order->update(['fulfillment_status' => $finalStatus]);

        if ($finalStatus === 'delivered') {
            try {
                Mail::to($order->user->email)->send(new OrderDelivered($order));
                Log::info("Confirmation email sent for Order #{$order->id}");
            } catch (Exception $e) {
                Log::error("Failed to send delivery email for Order #{$order->id}: " . $e->getMessage());
            }
        }

        Log::info("Fulfillment completed for Order #{$order->id}. Final Status: {$finalStatus}");

        return [
            'status' => $finalStatus,
            'details' => $outputs
        ];
    }
}
