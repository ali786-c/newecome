<?php

namespace App\Services\Suppliers;

use App\Contracts\SupplierServiceInterface;
use App\Models\SupplierConnection;
use Exception;

class SupplierServiceFactory
{
    /**
     * Resolve the appropriate service for a given supplier connection.
     *
     * @param SupplierConnection $connection
     * @return SupplierServiceInterface
     * @throws Exception
     */
    public function make(SupplierConnection $connection): SupplierServiceInterface
    {
        $type = strtolower($connection->type);

        /** @var SupplierServiceInterface $service */
        $service = match ($type) {
            'reloadly' => app(\App\Services\Suppliers\ReloadlyService::class),
            'g2a'      => app(\App\Services\Suppliers\G2AService::class),
            // 'ding'     => DingService::class, // Example for future expansion
            default    => throw new \Exception("Unsupported supplier type: {$connection->type}"),
        };
        return $service->setConnection($connection);
    }
}
