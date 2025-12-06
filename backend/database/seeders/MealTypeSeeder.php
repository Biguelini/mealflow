<?php

namespace Database\Seeders;

use App\Models\Household;
use App\Models\MealType;
use Illuminate\Database\Seeder;

class MealTypeSeeder extends Seeder {
	public function run(): void {
		$defaultMealTypes = [
			['name' => 'Café da manhã', 'order' => 1],
			['name' => 'Almoço', 'order' => 2],
			['name' => 'Janta', 'order' => 3],
		];


		Household::all()->each(function ($household) use ($defaultMealTypes) {
			foreach ($defaultMealTypes as $mealType) {
				MealType::firstOrCreate(
					[
						'household_id' => $household->id,
						'name' => $mealType['name'],
					],
					[
						'order' => $mealType['order'],
					]
				);
			}
		});
	}
}
