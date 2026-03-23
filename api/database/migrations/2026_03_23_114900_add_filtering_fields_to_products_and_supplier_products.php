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
            $table->string('country_code')->nullable()->after('category_id')->index();
            $table->string('brand')->nullable()->after('country_code')->index();
        });

        Schema::table('supplier_products', function (Blueprint $table) {
            $table->string('country_code')->nullable()->after('category')->index();
            $table->string('brand')->nullable()->after('country_code')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['country_code', 'brand']);
        });

        Schema::table('supplier_products', function (Blueprint $table) {
            $table->dropColumn(['country_code', 'brand']);
        });
    }
};
