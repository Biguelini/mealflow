<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void {
		Schema::create('shopping_list_items', function (Blueprint $table) {
			$table->id();

			$table->foreignId('shopping_list_id')
				->constrained('shopping_lists')
				->cascadeOnDelete();

			$table->foreignId('ingredient_id')
				->constrained('ingredients')
				->cascadeOnDelete();


			$table->decimal('needed_quantity', 10, 2);


			$table->decimal('pantry_quantity', 10, 2)->default(0);


			$table->decimal('to_buy_quantity', 10, 2);

			$table->string('unit', 50)->nullable();
			$table->string('notes', 255)->nullable();

			$table->timestamps();
		});
	}

	public function down(): void {
		Schema::dropIfExists('shopping_list_items');
	}
};
