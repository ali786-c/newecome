<?php

namespace App\Jobs;

use App\Models\SupplierConnection;
use App\Services\SupplierSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncSupplierPricesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $supplierId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $supplierId)
    {
        $this->supplierId = $supplierId;
    }

    /**
     * Execute the job.
     */
    public function handle(SupplierSyncService $syncService): void
    {
        $supplier = SupplierConnection::find($this->supplierId);
        
        if (!$supplier) {
            Log::error("SyncSupplierPricesJob: Supplier ID {$this->supplierId} not found.");
            return;
        }

        Log::info("Starting bulk price sync for supplier: {$supplier->name}");
        
        try {
            $result = $syncService->syncAll($this->supplierId);
            Log::info("Bulk sync finished for {$supplier->name}. Synced: {$result['synced']}, Failed: {$result['failed']}");
        } catch (\Exception $e) {
            Log::error("Bulk sync failed for {$supplier->name}: " . $e->getMessage());
        }
    }
}
