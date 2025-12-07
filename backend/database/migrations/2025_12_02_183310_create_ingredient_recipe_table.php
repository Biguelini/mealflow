<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void {
		Schema::create('ingredient_recipe', function (Blueprint $table) {
			$table->id();

			$table->foreignId('recipe_id')
				->constrained('recipes')
				->cascadeOnDelete();

			$table->foreignId('ingredient_id')
				->constrained('ingredients')
				->cascadeOnDelete();

			$table->decimal('quantity', 10, 2)->nullable();
			$table->string('unit', 50)->nullable();
			$table->string('notes', 255)->nullable();

			$table->timestamps();
		});
	}

	public function down(): void {
		Schema::dropIfExists('ingredient_recipe');
	}
};
