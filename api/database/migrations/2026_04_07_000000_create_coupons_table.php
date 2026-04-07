<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $row) {
            $row->id();
            $row->string('code')->unique();
            $row->enum('type', ['percentage', 'fixed'])->default('percentage');
            $row->decimal('value', 10, 2);
            $row->decimal('min_order_value', 10, 2)->default(0);
            $row->integer('max_uses')->nullable();
            $row->integer('used_count')->default(0);
            $row->enum('status', ['active', 'expired', 'disabled'])->default('active');
            $row->timestamp('expires_at')->nullable();
            $row->boolean('first_order_only')->default(false);
            $row->string('description')->nullable();
            $row->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
