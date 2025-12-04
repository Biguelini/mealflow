<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('meal_plan_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('meal_plan_id')
                ->constrained('meal_plans')
                ->cascadeOnDelete();

            $table->date('date');
            $table->string('meal_type', 32);

            $table->foreignId('recipe_id')
                ->constrained('recipes')
                ->cascadeOnDelete();

            $table->unsignedInteger('servings')->nullable();
            $table->string('notes', 255)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_plan_items');
    }
};
