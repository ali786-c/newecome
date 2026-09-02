<?php

namespace App\Jobs;

use App\Models\SupplierConnection;
use App\Models\SupplierBalanceLog;
use App\Services\Suppliers\SupplierServiceFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Services\AdminNotificationService;
use Exception;

class SupplierBalanceCheckJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(SupplierServiceFactory $factory, AdminNotificationService $adminNotify): void
    {
        $suppliers = SupplierConnection::where('is_active', true)->get();

        foreach ($suppliers as $supplier) {
            try {
                $service = $factory->make($supplier);
                $newBalance = $service->getBalance();
                
                $oldBalance = $supplier->balance;
                $change = $newBalance - $oldBalance;

                // Update supplier record
                $supplier->update([
                    'balance' => $newBalance,
                    'last_balance_check_at' => now(),
                ]);

                // Log the check
                SupplierBalanceLog::create([
                    'supplier_connection_id' => $supplier->id,
                    'balance' => $newBalance,
                    'change' => $change,
                    'status' => 'success',
                ]);

                // Check for low balance alert
                if ($newBalance < 10.00) {
                    Log::warning("LOW BALANCE ALERT: Supplier '{$supplier->name}' has only \${$newBalance} left.");
                    $adminNotify->notifyLowBalance($supplier);
                }

            } catch (Exception $e) {
                Log::error("Failed to check balance for Supplier #{$supplier->id}: " . $e->getMessage());
                
                SupplierBalanceLog::create([
                    'supplier_connection_id' => $supplier->id,
                    'balance' => $supplier->balance, // Keep old balance
                    'change' => 0,
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ]);
            }
        }
    }
}
