<?php

namespace App\Http\Controllers;

use App\Models\MealPlan;
use App\Models\MealPlanItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MealPlanController extends Controller {
	public function store(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id' => ['required', 'integer', 'exists:households,id'],
			'week_start'   => ['required', 'date'],
			'name'         => ['nullable', 'string', 'max:255'],
			'notes'        => ['nullable', 'string'],

			'items'                        => ['required', 'array', 'min:1'],
			'items.*.date'                 => ['required', 'date'],
			'items.*.meal_type'            => ['nullable', 'string', 'max:32'],
			'items.*.meal_type_id'         => ['nullable', 'integer', 'exists:meal_types,id'],
			'items.*.recipe_id'            => ['required', 'integer', 'exists:recipes,id'],
			'items.*.servings'             => ['nullable', 'integer', 'min:1'],
			'items.*.notes'                => ['nullable', 'string', 'max:255'],
		]);

		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$weekStart = Carbon::parse($validated['week_start'])->startOfWeek(Carbon::MONDAY);

		$weekLabel = $weekStart->format('o-\WW');

		$mealPlan = MealPlan::where('household_id', $household->id)
			->whereDate('week_start_date', $weekStart->toDateString())
			->first();

		if ($mealPlan) {
			$mealPlan->delete();

			MealPlanItem::where('meal_plan_id', $mealPlan->id)->delete();
		}

		$mealPlan = MealPlan::create([
			'household_id'    => $household->id,
			'user_id'         => $user->id,
			'week_start_date' => $weekStart->toDateString(),
			'week_label'      => $weekLabel,
			'name'            => $validated['name'] ?? null,
			'notes'           => $validated['notes'] ?? null,
		]);

		foreach ($validated['items'] as $itemData) {
			$mealTypeValue = $itemData['meal_type'] ?? null;

			if (!empty($itemData['meal_type_id'])) {
				$mealType = \App\Models\MealType::find($itemData['meal_type_id']);
				if ($mealType) {
					$mealTypeValue = $mealType->name;
				}
			}

			MealPlanItem::create([
				'meal_plan_id' => $mealPlan->id,
				'date'         => $itemData['date'],
				'meal_type'    => $mealTypeValue,
				'meal_type_id' => $itemData['meal_type_id'] ?? null,
				'recipe_id'    => $itemData['recipe_id'],
				'servings'     => $itemData['servings'] ?? null,
				'notes'        => $itemData['notes'] ?? null,
			]);
		}

		return response()->json(
			$mealPlan->load(['items.recipe']),
			201
		);
	}

	public function search(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id' => ['required', 'integer', 'exists:households,id'],
			'week'         => ['required', 'string'],
		]);

		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		if (! str_contains($validated['week'], '-W')) {
			return response()->json([
				'message' => 'Formato de semana inválido. Use YYYY-WW.',
			], 422);
		}

		[$year, $week] = explode('-W', $validated['week'], 2);

		$weekStart = \Illuminate\Support\Carbon::now()
			->setISODate((int) $year, (int) $week)
			->startOfWeek(\Illuminate\Support\Carbon::MONDAY);

		$mealPlan = MealPlan::with([
			'items.recipe.ingredients',
			'items.mealType',
		])
			->where('household_id', $household->id)
			->whereDate('week_start_date', $weekStart->toDateString())
			->first();

		if (! $mealPlan) {
			return response()->json([
				'message' => 'Nenhum plano de refeições encontrado para esta semana.',
			], 404);
		}

		return response()->json($mealPlan);
	}

	public function update(Request $request, $id) {
		$user = $request->user();

		$mealPlan = MealPlan::findOrFail($id);

		$validated = $request->validate([
			'name'   => ['nullable', 'string', 'max:255'],
			'notes'  => ['nullable', 'string'],
			'items'  => ['nullable', 'array'],
			'items.*.date'         => ['required_with:items', 'date'],
			'items.*.meal_type'    => ['nullable', 'string', 'max:32'],
			'items.*.meal_type_id' => ['nullable', 'integer', 'exists:meal_types,id'],
			'items.*.recipe_id'    => ['required_with:items', 'integer', 'exists:recipes,id'],
			'items.*.servings'     => ['nullable', 'integer', 'min:1'],
			'items.*.notes'        => ['nullable', 'string', 'max:255'],
		]);

		$mealPlan->update([
			'name'  => $validated['name'] ?? $mealPlan->name,
			'notes' => $validated['notes'] ?? $mealPlan->notes,
		]);

		if (isset($validated['items']) && !empty($validated['items'])) {

			MealPlanItem::where('meal_plan_id', $mealPlan->id)->delete();

			foreach ($validated['items'] as $itemData) {
				$mealTypeValue = $itemData['meal_type'] ?? null;

				if (!empty($itemData['meal_type_id'])) {
					$mealType = \App\Models\MealType::find($itemData['meal_type_id']);
					if ($mealType) {
						$mealTypeValue = $mealType->name;
					}
				}

				MealPlanItem::create([
					'meal_plan_id' => $mealPlan->id,
					'date'         => $itemData['date'],
					'meal_type'    => $mealTypeValue,
					'meal_type_id' => $itemData['meal_type_id'] ?? null,
					'recipe_id'    => $itemData['recipe_id'],
					'servings'     => $itemData['servings'] ?? null,
					'notes'        => $itemData['notes'] ?? null,
				]);
			}
		}

		return response()->json(
			$mealPlan->load(['items.recipe']),
		);
	}
}
