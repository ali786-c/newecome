<?php

namespace App\Contracts;

use App\Models\Order;
use App\Models\SupplierConnection;

interface SupplierServiceInterface
{
    /**
     * Initialize the service with connection config.
     */
    public function setConnection(SupplierConnection $connection): self;

    /**
     * Fetch all available products from the supplier.
     */
    public function fetchProducts(): array;

    /**
     * Fetch specific product details.
     */
    public function getProductDetails(string $externalId): array;

    /**
     * Place an order with the supplier.
     */
    public function placeOrder(Order $order): array;

    /**
     * Resolve/Retrieve the gift card code for a transaction.
     */
    public function getRedeemCode(string $externalTransactionId): array;

    /**
     * Check the account balance with the supplier.
     */
    public function getBalance(): float;

    /**
     * Standardize a raw product record from the supplier's API into a common format.
     * Expected keys: name, description, price, category, data, status.
     */
    public function formatProductData(array $raw): array;
}
