<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller {
	public function index(Request $request) {
		$validated = $request->validate([
			'q' => ['nullable', 'string', 'max:255'],
		]);

		$query = Ingredient::query();

		if (!empty($validated['q'])) {
			$q = $validated['q'];
			$query->where('name', 'like', "%{$q}%");
		}

		return $query
			->orderBy('name')
			->get();
	}

	public function store(Request $request) {
		$data = $request->validate([
			'name'         => ['required', 'string', 'max:255', 'unique:ingredients,name'],
			'default_unit' => ['nullable', 'string', 'max:50'],
		]);

		$ingredient = Ingredient::create($data);

		return response()->json($ingredient, 201);
	}

	public function show($id) {
		$ingredient = Ingredient::findOrFail($id);

		return response()->json($ingredient);
	}

	public function update(Request $request, $id) {
		$ingredient = Ingredient::findOrFail($id);

		$data = $request->validate([
			'name'         => ['sometimes', 'required', 'string', 'max:255', 'unique:ingredients,name,' . $ingredient->id],
			'default_unit' => ['nullable', 'string', 'max:50'],
		]);

		$ingredient->fill($data);
		$ingredient->save();

		return response()->json($ingredient);
	}

	public function destroy($id) {
		$ingredient = Ingredient::findOrFail($id);

		$ingredient->delete();

		return response()->json([
			'message' => 'Ingrediente removido com sucesso.',
		]);
	}
}
