<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('short_description', 500)->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable();
            $table->string('discount_label', 50)->nullable();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->json('tags')->nullable();
            $table->string('status')->default('draft'); // active|draft|archived
            $table->string('stock_status')->default('in_stock'); // in_stock|out_of_stock|limited
            $table->string('image_url')->nullable();
            $table->json('features')->nullable();
            $table->boolean('telegram_enabled')->default(false);
            $table->boolean('discord_enabled')->default(false);
            $table->boolean('random_post_eligible')->default(false);
            $table->string('compliance_status')->default('approved'); // approved|pending_review|flagged|rejected
            $table->text('internal_notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('products'); }
};
