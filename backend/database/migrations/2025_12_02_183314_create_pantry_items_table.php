<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pantry_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')
                ->constrained('households')
                ->onDelete('cascade');
            $table->foreignId('ingredient_id')
                ->constrained('ingredients')
                ->onDelete('restrict');

            $table->decimal('quantity', 8, 2)->default(0);
            $table->string('unit')->nullable();
            $table->date('expires_at')->nullable();
            $table->decimal('low_stock_threshold', 8, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pantry_items');
    }
};
