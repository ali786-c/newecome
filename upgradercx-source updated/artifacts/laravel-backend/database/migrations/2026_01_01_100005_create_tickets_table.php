<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('subject');
            $table->string('status')->default('open'); // open|waiting_customer|closed
            $table->string('priority')->default('medium'); // low|medium|high
            $table->string('category')->default('general');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->text('message');
            $table->boolean('is_admin')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('tickets');
    }
};
