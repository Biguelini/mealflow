<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meal_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')
                ->constrained('households')
                ->onDelete('cascade');

            $table->date('date');
            $table->string('meal_type', 20);

            $table->foreignId('recipe_id')
                ->nullable()
                ->constrained('recipes')
                ->onDelete('set null');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique(['household_id', 'date', 'meal_type'], 'meal_plan_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_plans');
    }
};
