<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	public function up(): void {
		Schema::create('shopping_lists', function (Blueprint $table) {
			$table->id();

			$table->foreignId('household_id')
				->constrained('households')
				->cascadeOnDelete();

			$table->foreignId('meal_plan_id')
				->nullable()
				->constrained('meal_plans')
				->nullOnDelete();

			$table->foreignId('user_id')
				->constrained('users')
				->cascadeOnDelete();

			$table->string('name');
			$table->text('notes')->nullable();

			$table->string('status', 32)->default('draft');

			$table->timestamps();
		});
	}

	public function down(): void {
		Schema::dropIfExists('shopping_lists');
	}
};
