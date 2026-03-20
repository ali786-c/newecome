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
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('supplier_id')->nullable()->after('category_id')->index();
            $table->string('supplier_product_id')->nullable()->after('supplier_id');
            $table->decimal('cost_price', 10, 2)->nullable()->after('price');
            $table->decimal('margin_percentage', 5, 2)->default(0)->after('cost_price');
            $table->timestamp('last_sync_at')->nullable()->after('margin_percentage');

            $table->foreign('supplier_id')->references('id')->on('supplier_connections')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['supplier_id', 'supplier_product_id', 'cost_price', 'margin_percentage', 'last_sync_at']);
        });
    }
};
