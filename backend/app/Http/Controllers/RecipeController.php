<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Household;
use Illuminate\Http\Request;

class RecipeController extends Controller {
	public function search(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id' => ['required', 'integer', 'exists:households,id'],
			'q'            => ['nullable', 'string', 'max:255'],
		]);

		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$query = Recipe::query()
			->where('household_id', $household->id)
			->with(['ingredients', 'owner:id,name']);

		if (!empty($validated['q'])) {
			$q = $validated['q'];
			$query->where(function ($sub) use ($q) {
				$sub->where('name', 'like', "%{$q}%")
					->orWhere('description', 'like', "%{$q}%");
			});
		}

		$recipes = $query->orderBy('name')->paginate(20);

		return response()->json($recipes);
	}


	public function store(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id'       => ['required', 'integer', 'exists:households,id'],
			'name'               => ['required', 'string', 'max:255'],
			'description'        => ['nullable', 'string'],
			'instructions'       => ['nullable', 'string'],
			'prep_time_minutes'  => ['nullable', 'integer', 'min:0'],
			'cook_time_minutes'  => ['nullable', 'integer', 'min:0'],
			'servings'           => ['nullable', 'integer', 'min:1'],
			'is_public'          => ['boolean'],

			'ingredients'                        => ['nullable', 'array'],
			'ingredients.*.ingredient_id'        => ['required', 'integer', 'exists:ingredients,id'],
			'ingredients.*.quantity'             => ['nullable', 'numeric', 'min:0'],
			'ingredients.*.unit'                 => ['nullable', 'string', 'max:50'],
			'ingredients.*.notes'                => ['nullable', 'string', 'max:255'],
		]);

		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$recipe = Recipe::create([
			'household_id'      => $household->id,
			'user_id'           => $user->id,
			'name'              => $validated['name'],
			'description'       => $validated['description'] ?? null,
			'instructions'      => $validated['instructions'] ?? null,
			'prep_time_minutes' => $validated['prep_time_minutes'] ?? null,
			'cook_time_minutes' => $validated['cook_time_minutes'] ?? null,
			'servings'          => $validated['servings'] ?? null,
			'is_public'         => $validated['is_public'] ?? false,
		]);

		if (!empty($validated['ingredients'])) {
			$pivotData = [];
			foreach ($validated['ingredients'] as $item) {

				$ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
				$unit = $ingredient ? $ingredient->default_unit : null;

				$pivotData[$item['ingredient_id']] = [
					'quantity' => $item['quantity'] ?? null,
					'unit'     => $unit,
					'notes'    => $item['notes'] ?? null,
				];
			}

			$recipe->ingredients()->sync($pivotData);
		}
		return response()->json(
			$recipe->load(['ingredients', 'owner:id,name']),
			201
		);
	}

	public function show(Request $request, $id) {
		$user = $request->user();

		$recipe = Recipe::with(['ingredients', 'owner:id,name'])
			->where('id', $id)
			->firstOrFail();

		$user->households()
			->where('households.id', $recipe->household_id)
			->firstOrFail();

		return response()->json($recipe);
	}


	public function update(Request $request, $id) {
		$user = $request->user();

		$validated = $request->validate([
			'name'               => ['sometimes', 'required', 'string', 'max:255'],
			'description'        => ['nullable', 'string'],
			'instructions'       => ['nullable', 'string'],
			'prep_time_minutes'  => ['nullable', 'integer', 'min:0'],
			'cook_time_minutes'  => ['nullable', 'integer', 'min:0'],
			'servings'           => ['nullable', 'integer', 'min:1'],
			'is_public'          => ['boolean'],

			'ingredients'                        => ['nullable', 'array'],
			'ingredients.*.ingredient_id'        => ['required', 'integer', 'exists:ingredients,id'],
			'ingredients.*.quantity'             => ['nullable', 'numeric', 'min:0'],
			'ingredients.*.unit'                 => ['nullable', 'string', 'max:50'],
			'ingredients.*.notes'                => ['nullable', 'string', 'max:255'],
		]);

		$recipe = Recipe::where('id', $id)->firstOrFail();


		$user->households()
			->where('households.id', $recipe->household_id)
			->firstOrFail();

		$recipe->fill($validated);
		$recipe->save();

		if (array_key_exists('ingredients', $validated)) {
			$pivotData = [];

			foreach ($validated['ingredients'] ?? [] as $item) {

				$ingredient = \App\Models\Ingredient::find($item['ingredient_id']);
				$unit = $ingredient ? $ingredient->default_unit : null;

				$pivotData[$item['ingredient_id']] = [
					'quantity' => $item['quantity'] ?? null,
					'unit'     => $unit,
					'notes'    => $item['notes'] ?? null,
				];
			}

			$recipe->ingredients()->sync($pivotData);
		}
		return response()->json(
			$recipe->load(['ingredients', 'owner:id,name'])
		);
	}


	public function destroy(Request $request, $id) {
		$user = $request->user();

		$recipe = Recipe::where('id', $id)->firstOrFail();

		$user->households()
			->where('households.id', $recipe->household_id)
			->firstOrFail();

		$recipe->delete();

		return response()->json([
			'message' => 'Receita removida com sucesso.',
		]);
	}
}
