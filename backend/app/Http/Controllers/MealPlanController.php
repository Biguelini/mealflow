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
			'items.*.meal_type'            => ['required', 'string', 'max:32'],
			'items.*.recipe_id'            => ['required', 'integer', 'exists:recipes,id'],
			'items.*.servings'             => ['nullable', 'integer', 'min:1'],
			'items.*.notes'                => ['nullable', 'string', 'max:255'],
		]);


		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$weekStart = Carbon::parse($validated['week_start'])->startOfWeek(Carbon::MONDAY);

		$weekLabel = $weekStart->format('o-\WW');

		$mealPlan = MealPlan::create([
			'household_id'    => $household->id,
			'user_id'         => $user->id,
			'week_start_date' => $weekStart->toDateString(),
			'week_label'      => $weekLabel,
			'name'            => $validated['name'] ?? null,
			'notes'           => $validated['notes'] ?? null,
		]);

		foreach ($validated['items'] as $itemData) {
			MealPlanItem::create([
				'meal_plan_id' => $mealPlan->id,
				'date'         => $itemData['date'],
				'meal_type'    => $itemData['meal_type'],
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
}
