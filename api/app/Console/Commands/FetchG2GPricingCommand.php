<?php

namespace App\Console\Commands;

use App\Models\SupplierConnection;
use App\Services\Suppliers\G2GService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchG2GPricingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'g2g:fetch-pricing
                            {--service-id= : Specific service ID to fetch}
                            {--brand-id= : Specific brand ID to fetch}
                            {--limit=10 : Limit number of brands to process}
                            {--force : Force update existing records}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch pricing data from G2G for reselling on website';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting G2G Pricing Fetch...');

        // Get G2G connection
        $connection = SupplierConnection::where('type', 'g2g')->first();
        if (!$connection) {
            $this->error('❌ No G2G connection found. Please create one first.');
            return 1;
        }

        $service = app(G2GService::class)->setConnection($connection);

        try {
            // If specific brand requested
            if ($this->option('brand-id')) {
                return $this->fetchSpecificBrand($service, $this->option('brand-id'));
            }

            // If specific service requested
            if ($this->option('service-id')) {
                return $this->fetchServiceBrands($service, $this->option('service-id'));
            }

            // Default: Fetch from Gift Cards service
            return $this->fetchDefaultService($service);

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            Log::error('G2G Pricing Fetch Failed', ['error' => $e->getMessage()]);
            return 1;
        }
    }

    private function fetchSpecificBrand(G2GService $service, string $brandId): int
    {
        $this->info("🎯 Fetching pricing for brand: $brandId");

        $offers = $service->getOffers($brandId);

        if (empty($offers)) {
            $this->warn("⚠️  No pricing found for brand $brandId");
            return 0;
        }

        $this->storePricingData($brandId, $offers);
        $this->info("✅ Stored " . count($offers) . " offers for brand $brandId");

        return 0;
    }

    private function fetchServiceBrands(G2GService $service, string $serviceId): int
    {
        $this->info("📦 Fetching brands for service: $serviceId");

        $brands = $service->getBrandsWithPricingStatus($serviceId);
        $limit = (int) $this->option('limit');

        $this->info("Found " . count($brands) . " brands, processing first $limit...");

        $bar = $this->output->createProgressBar(min($limit, count($brands)));
        $bar->start();

        $totalOffers = 0;
        foreach (array_slice($brands, 0, $limit) as $brand) {
            $offers = $service->getOffers($brand['brand_id']);

            if (!empty($offers)) {
                $this->storePricingData($brand['brand_id'], $offers, $brand);
                $totalOffers += count($offers);
            }

            $bar->advance();
            usleep(200000); // Rate limiting
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ Stored $totalOffers offers from " . min($limit, count($brands)) . " brands");

        return 0;
    }

    private function fetchDefaultService(G2GService $service): int
    {
        // Default to Gift Cards service
        $serviceId = '8f88b6fd-93df-4a07-b8b0-7d90b152b81f';
        $this->info("🎁 Using default Gift Cards service");

        return $this->fetchServiceBrands($service, $serviceId);
    }

    private function storePricingData(string $brandId, array $offers, array $brandInfo = []): void
    {
        // Here you would store the data in your database
        // This is a placeholder - implement based on your Product model

        foreach ($offers as $offer) {
            // Example: Store in products table or g2g_offers table
            $data = [
                'brand_id' => $brandId,
                'brand_name' => $brandInfo['brand_name'] ?? 'Unknown',
                'product_id' => $offer['product_id'] ?? null,
                'price' => $offer['retail_price'] ?? $offer['price'] ?? 0,
                'currency' => $offer['currency'] ?? 'USD',
                'quantity' => $offer['quantity'] ?? 0,
                'seller_name' => $offer['seller_name'] ?? 'Unknown',
                'min_quantity' => $offer['min_quantity'] ?? 1,
                'max_quantity' => $offer['max_quantity'] ?? $offer['quantity'] ?? 1,
                'description' => $offer['description'] ?? '',
                'last_updated' => now(),
            ];

            // Example database storage (uncomment and modify):
            /*
            \DB::table('g2g_offers')->updateOrInsert(
                ['brand_id' => $brandId, 'product_id' => $data['product_id']],
                $data
            );
            */

            // For now, just log the data
            Log::info('G2G Offer Data', $data);
        }
    }
}