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
        Schema::create('supplier_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('supplier_id')->index();
            $table->string('status'); // success|failed|partial
            $table->integer('items_synced')->default(0);
            $table->integer('items_failed')->default(0);
            $table->json('details')->nullable(); // stored errors or specific changed items
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('supplier_connections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_sync_logs');
    }
};
