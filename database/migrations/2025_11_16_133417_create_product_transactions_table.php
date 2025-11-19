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
        Schema::create('product_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->string('category_name')->nullable();
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->foreignId('promo_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('discount_percent', 8, 2)->nullable();
            $table->decimal('discount_price', 12, 2)->nullable();
            $table->decimal('line_total', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_transactions');
    }
};
