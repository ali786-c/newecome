<?php

namespace App\Jobs;

use App\Models\SupplierConnection;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncSupplierProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected SupplierConnection $supplier,
        protected string $mode = 'incremental',
        protected ?int $limit = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $lockKey = "sync_supplier_{$this->supplier->id}";
        $lock = Cache::lock($lockKey, 3600); // 1 hour lock max

        if (!$lock->get()) {
            Log::info("Sync already in progress for supplier: {$this->supplier->name} (Job skipped)");
            return;
        }

        try {
            Log::info("Starting sync job for {$this->supplier->name} (Mode: {$this->mode})");

            $params = [
                '--supplier' => $this->supplier->id,
                '--mode'     => $this->mode,
            ];

            if ($this->limit) {
                $params['--limit'] = $this->limit;
            }

            Artisan::call('app:sync-supplier-products', $params);

            Log::info("Sync job completed for {$this->supplier->name}");
        } catch (\Exception $e) {
            Log::error("Sync job failed for {$this->supplier->name}: " . $e->getMessage());
            throw $e;
        } finally {
            $lock->release();
        }
    }
}
