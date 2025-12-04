<?php

namespace App\Http\Controllers;

use App\Models\MealPlan;
use App\Models\PantryItem;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ShoppingListController extends Controller
{

    public function fromMealPlan(Request $request, $mealPlanId)
    {
        $user = $request->user();

        $mealPlan = MealPlan::with(['items.recipe.ingredients'])
            ->findOrFail($mealPlanId);


        $household = $user->households()
            ->where('households.id', $mealPlan->household_id)
            ->firstOrFail();


        $neededByIngredient = [];

        foreach ($mealPlan->items as $item) {
            $recipe = $item->recipe;

            if (! $recipe) {
                continue;
            }

            $recipeServings = $recipe->servings ?: 1;
            $itemServings   = $item->servings ?: $recipeServings;

            $factor = $itemServings / $recipeServings;

            foreach ($recipe->ingredients as $ingredient) {
                $ingredientId = $ingredient->id;

                $baseQuantity = $ingredient->pivot->quantity ?? 0;
                $unit = $ingredient->pivot->unit ?? $ingredient->default_unit ?? null;

                if ($baseQuantity <= 0) {
                    continue;
                }

                $quantityForItem = $baseQuantity * $factor;

                if (! isset($neededByIngredient[$ingredientId])) {
                    $neededByIngredient[$ingredientId] = [
                        'quantity' => 0,
                        'unit'     => $unit,
                    ];
                }

                $neededByIngredient[$ingredientId]['quantity'] += $quantityForItem;
            }
        }

        if (empty($neededByIngredient)) {
            return response()->json([
                'message' => 'Nenhum ingrediente encontrado neste plano de refeições.',
            ], 400);
        }


        $pantryByIngredient = PantryItem::query()
            ->where('household_id', $household->id)

            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhereDate('expires_at', '>=', Carbon::today());
            })
            ->get()
            ->groupBy('ingredient_id')
            ->map(function ($items) {
                return $items->sum('quantity');
            })
            ->all();


        $weekLabel = $mealPlan->week_label ?? $mealPlan->week_start_date->format('o-\WW');

        $shoppingList = ShoppingList::create([
            'household_id' => $household->id,
            'meal_plan_id' => $mealPlan->id,
            'user_id'      => $user->id,
            'name'         => "Lista de compras {$weekLabel}",
            'notes'        => "Gerada automaticamente a partir do plano de refeições da semana {$weekLabel}.",
            'status'       => 'draft',
        ]);

        $itemsToInsert = [];

        foreach ($neededByIngredient as $ingredientId => $data) {
            $needed = round($data['quantity'], 2);
            $pantry = round($pantryByIngredient[$ingredientId] ?? 0, 2);
            $toBuy  = max($needed - $pantry, 0);


            if ($toBuy <= 0) {
                continue;
            }

            $itemsToInsert[] = [
                'shopping_list_id' => $shoppingList->id,
                'ingredient_id'    => $ingredientId,
                'needed_quantity'  => $needed,
                'pantry_quantity'  => $pantry,
                'to_buy_quantity'  => $toBuy,
                'unit'             => $data['unit'],
                'notes'            => null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        }

        if (! empty($itemsToInsert)) {
            ShoppingListItem::insert($itemsToInsert);
        }

        return response()->json(
            $shoppingList->load(['items.ingredient']),
            201
        );
    }
}
