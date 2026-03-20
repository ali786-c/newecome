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
    public static function make(SupplierConnection $connection): SupplierServiceInterface
    {
        $type = strtolower($connection->type);

        $className = match ($type) {
            'reloadly' => ReloadlyService::class,
            // 'ding'     => DingService::class, // Example for future expansion
            default    => throw new Exception("Supplier type '{$type}' is not supported."),
        };

        if (!class_exists($className)) {
            throw new Exception("Service class '{$className}' not found.");
        }

        /** @var SupplierServiceInterface $service */
        $service = app($className);
        
        return $service->setConnection($connection);
    }
}
