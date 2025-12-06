<?php

namespace App\Http\Controllers;

use App\Models\MealType;
use Illuminate\Http\Request;

class MealTypeController extends Controller {
	public function index(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id' => ['required', 'integer', 'exists:households,id'],
		]);


		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$mealTypes = $household->mealTypes;

		return response()->json($mealTypes);
	}

	public function store(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id' => ['required', 'integer', 'exists:households,id'],
			'name' => ['required', 'string', 'max:255'],
			'order' => ['nullable', 'integer'],
		]);


		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->wherePivot('role', 'owner')
			->orWhere('households.owner_id', $user->id)
			->firstOrFail();


		if (!isset($validated['order'])) {
			$maxOrder = $household->mealTypes()->max('order') ?? 0;
			$validated['order'] = $maxOrder + 1;
		}

		$mealType = MealType::create($validated);

		return response()->json($mealType, 201);
	}

	public function update(Request $request, $id) {
		$user = $request->user();

		$validated = $request->validate([
			'name' => ['sometimes', 'string', 'max:255'],
			'order' => ['sometimes', 'integer'],
		]);

		$mealType = MealType::findOrFail($id);


		$household = $user->households()
			->where('households.id', $mealType->household_id)
			->wherePivot('role', 'owner')
			->orWhere('households.owner_id', $user->id)
			->firstOrFail();

		$mealType->update($validated);

		return response()->json($mealType);
	}

	public function destroy(Request $request, $id) {
		$user = $request->user();

		$mealType = MealType::findOrFail($id);


		$household = $user->households()
			->where('households.id', $mealType->household_id)
			->wherePivot('role', 'owner')
			->orWhere('households.owner_id', $user->id)
			->firstOrFail();

		$mealType->delete();

		return response()->json(['message' => 'Meal type deleted successfully'], 200);
	}
}
