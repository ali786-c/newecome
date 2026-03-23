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
        Schema::table('supplier_connections', function (Blueprint $table) {
            $table->timestamp('last_balance_check_at')->nullable()->after('balance');
        });

        Schema::create('supplier_balance_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('supplier_connection_id');
            $table->decimal('balance', 10, 2);
            $table->decimal('change', 10, 2)->default(0);
            $table->string('status')->default('success'); // success|error
            $table->text('message')->nullable();
            $table->timestamps();

            $table->foreign('supplier_connection_id')->references('id')->on('supplier_connections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_balance_logs');
        Schema::table('supplier_connections', function (Blueprint $table) {
            $table->dropColumn('last_balance_check_at');
        });
    }
};
