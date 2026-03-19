<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('supplier_connections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // api|csv|webhook
            $table->string('endpoint')->nullable();
            $table->text('api_key')->nullable(); // encrypted
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('supplier_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('connection_id')->index();
            $table->string('external_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('category')->nullable();
            $table->json('data')->nullable();
            $table->string('status')->default('available');
            $table->timestamps();
        });

        Schema::create('supplier_import_jobs', function (Blueprint $table) {
            $table->id();
            $table->json('supplier_product_ids');
            $table->string('status')->default('queued'); // queued|running|completed|failed
            $table->unsignedInteger('total')->default(0);
            $table->unsignedInteger('imported')->default(0);
            $table->json('errors')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('supplier_import_jobs');
        Schema::dropIfExists('supplier_products');
        Schema::dropIfExists('supplier_connections');
    }
};
