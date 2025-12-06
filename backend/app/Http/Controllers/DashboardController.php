<?php

namespace App\Http\Controllers;

use App\Models\MealPlanItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function weeklySummary(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'household_id' => ['required', 'integer', 'exists:households,id'],
            'week'         => ['required', 'string'],
        ]);

        $householdId = $validated['household_id'];

        $user->households()
            ->where('households.id', $householdId)
            ->firstOrFail();

        if (! str_contains($validated['week'], '-W')) {
            return response()->json([
                'message' => 'Formato inválido de semana. Use YYYY-WW (ex: 2025-W49).',
            ], 422);
        }

        [$year, $week] = explode('-W', $validated['week'], 2);

        $weekStart = Carbon::now()
            ->setISODate((int) $year, (int) $week)
            ->startOfWeek(Carbon::MONDAY);
        $weekEnd = (clone $weekStart)->endOfWeek(Carbon::SUNDAY);

        $today = Carbon::today();


        $baseQuery = MealPlanItem::query()
            ->join('meal_plans as mp', 'meal_plan_items.meal_plan_id', '=', 'mp.id')
            ->where('mp.household_id', $householdId)
            ->whereBetween('meal_plan_items.date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ]);

        $plannedMeals = (clone $baseQuery)->count();


        $completedMeals = (clone $baseQuery)
            ->whereDate('meal_plan_items.date', '<=', $today->toDateString())
            ->count();


        $topRecipes = DB::table('meal_plan_items as mpi')
            ->join('meal_plans as mp', 'mpi.meal_plan_id', '=', 'mp.id')
            ->join('recipes as r', 'mpi.recipe_id', '=', 'r.id')
            ->where('mp.household_id', $householdId)
            ->whereBetween('mpi.date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ])
            ->groupBy('r.id', 'r.name')
            ->select(
                'r.id as recipe_id',
                'r.name',
                DB::raw('COUNT(*) as usage_count')
            )
            ->orderByDesc('usage_count')
            ->limit(5)
            ->get();



        $topIngredients = DB::table('meal_plan_items as mpi')
            ->join('meal_plans as mp', 'mpi.meal_plan_id', '=', 'mp.id')
            ->join('recipes as r', 'mpi.recipe_id', '=', 'r.id')
            ->join('ingredient_recipe as ir', 'ir.recipe_id', '=', 'r.id')
            ->join('ingredients as i', 'ir.ingredient_id', '=', 'i.id')
            ->where('mp.household_id', $householdId)
            ->whereBetween('mpi.date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ])
            ->groupBy('i.id', 'i.name')
            ->select(
                'i.id as ingredient_id',
                'i.name',
                DB::raw('SUM(ir.quantity) as total_quantity')
            )
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        return response()->json([
            'planned_meals'    => $plannedMeals,
            'completed_meals'  => $completedMeals,
            'top_recipes'      => $topRecipes,
            'top_ingredients'  => $topIngredients,
            'week_start'       => $weekStart->toDateString(),
            'week_end'         => $weekEnd->toDateString(),
        ]);
    }
}
