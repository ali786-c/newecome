<?php

namespace App\Services\Suppliers;

use Illuminate\Support\Str;

class ProductCategorizer
{
    /**
     * Categorize product and generate label based on name and denomination.
     */
    public function categorize(string $name, $value = null): array
    {
        $nameLower = strtolower($name);
        $type = 'gift_card';
        $label = null;
        $duration = null;
        $unit = null;

        // 1. Detect Durations (Subscriptions/Time-based)
        // Patterns: 60 days, 3 months, 1 year, etc.
        if (preg_match('/(\d+)\s*(month|months|mth|mo|day|days|d|year|years|y)/i', $name, $matches)) {
            $type = 'subscription';
            $amount = (int) $matches[1];
            $rawUnit = strtolower($matches[2]);

            // Normalization Logic
            if (Str::startsWith($rawUnit, 'd')) {
                if ($amount % 30 === 0) {
                    $duration = $amount / 30;
                    $unit = 'month';
                    $label = $duration . ' ' . Str::plural('Month', $duration);
                } else {
                    $duration = $amount;
                    $unit = 'day';
                    $label = $duration . ' ' . Str::plural('Day', $duration);
                }
            } elseif (Str::startsWith($rawUnit, 'm')) {
                if ($amount === 12) {
                    $duration = 1;
                    $unit = 'year';
                    $label = "1 Year";
                } else {
                    $duration = $amount;
                    $unit = 'month';
                    $label = $duration . ' ' . Str::plural('Month', $duration);
                }
            } elseif (Str::startsWith($rawUnit, 'y')) {
                $duration = $amount;
                $unit = 'year';
                $label = $duration . ' ' . Str::plural('Year', $duration);
            }
        }

        // 2. Fallback for Gift Cards (Monetary based)
        if (!$label && $value) {
            $label = "€" . number_format($value, 2) . " Pack";
            $unit = 'currency';
            $duration = $value;
        }

        return [
            'type'     => $type,
            'label'    => $label ?? $name,
            'duration' => $duration,
            'unit'     => $unit,
        ];
    }
}
