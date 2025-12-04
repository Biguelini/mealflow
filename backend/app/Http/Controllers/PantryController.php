<?php

namespace App\Http\Controllers;

use App\Models\PantryItem;
use Illuminate\Http\Request;

class PantryController extends Controller {
	public function search(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id' => ['required', 'integer', 'exists:households,id'],

			'ingredient_id' => ['nullable', 'integer', 'exists:ingredients,id'],
			'expires_before' => ['nullable', 'date'],
			'expires_after' => ['nullable', 'date'],
			'has_quantity' => ['nullable', 'boolean'],
		]);


		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$query = PantryItem::query()
			->where('household_id', $household->id)
			->with('ingredient:id,name,default_unit');


		if (!empty($validated['ingredient_id'])) {
			$query->where('ingredient_id', $validated['ingredient_id']);
		}

		if (!empty($validated['expires_before'])) {
			$query->whereDate('expires_at', '<=', $validated['expires_before']);
		}

		if (!empty($validated['expires_after'])) {
			$query->whereDate('expires_at', '>=', $validated['expires_after']);
		}

		if (array_key_exists('has_quantity', $validated)) {
			if ($validated['has_quantity']) {
				$query->where('quantity', '>', 0);
			} else {
				$query->where('quantity', '<=', 0);
			}
		}

		$items = $query
			->orderByRaw('expires_at IS NOT NULL, expires_at ASC')
			->orderBy('id')
			->get();

		return response()->json($items);
	}


	public function store(Request $request) {
		$user = $request->user();

		$validated = $request->validate([
			'household_id'  => ['required', 'integer', 'exists:households,id'],
			'ingredient_id' => ['required', 'integer', 'exists:ingredients,id'],
			'quantity'      => ['required', 'numeric', 'min:0'],
			'unit'          => ['nullable', 'string', 'max:50'],
			'expires_at'    => ['nullable', 'date'],
			'notes'         => ['nullable', 'string', 'max:255'],
		]);

		$household = $user->households()
			->where('households.id', $validated['household_id'])
			->firstOrFail();

		$item = PantryItem::create([
			'household_id'  => $household->id,
			'ingredient_id' => $validated['ingredient_id'],
			'quantity'      => $validated['quantity'],
			'unit'          => $validated['unit'] ?? null,
			'expires_at'    => $validated['expires_at'] ?? null,
			'notes'         => $validated['notes'] ?? null,
		]);

		return response()->json(
			$item->load('ingredient:id,name,default_unit'),
			201
		);
	}


	public function update(Request $request, $id) {
		$user = $request->user();

		$validated = $request->validate([
			'quantity'   => ['sometimes', 'required', 'numeric', 'min:0'],
			'unit'       => ['nullable', 'string', 'max:50'],
			'expires_at' => ['nullable', 'date'],
			'notes'      => ['nullable', 'string', 'max:255'],
		]);

		$item = PantryItem::with('household')->findOrFail($id);


		$user->households()
			->where('households.id', $item->household_id)
			->firstOrFail();

		$item->fill($validated);
		$item->save();

		return response()->json(
			$item->load('ingredient:id,name,default_unit')
		);
	}


	public function destroy(Request $request, $id) {
		$user = $request->user();

		$item = PantryItem::findOrFail($id);

		$user->households()
			->where('households.id', $item->household_id)
			->firstOrFail();

		$item->delete();

		return response()->json([
			'message' => 'Item removido da despensa com sucesso.',
		]);
	}
}
