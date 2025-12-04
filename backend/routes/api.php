<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\MealPlanController;
use App\Http\Controllers\PantryController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ShoppingListController;

Route::prefix('auth')->group(function () {
	Route::post('/register', [AuthController::class, 'register']);
	Route::post('/login', [AuthController::class, 'login']);

	Route::middleware('auth:sanctum')->group(function () {
		Route::get('/me', [AuthController::class, 'me']);
		Route::post('/logout', [AuthController::class, 'logout']);
	});
});

Route::middleware('auth:sanctum')->group(function () {

	Route::prefix('households')->group(function () {
		Route::get('/', [HouseholdController::class, 'index']);
		Route::post('/', [HouseholdController::class, 'store']);
		Route::post('/{id}/members', [HouseholdController::class, 'addMember']);
	});

	Route::prefix('recipes')->group(function () {
		Route::post('/search', [RecipeController::class, 'search']);
		Route::post('/', [RecipeController::class, 'store']);
		Route::get('/{id}', [RecipeController::class, 'show']);
		Route::put('/{id}', [RecipeController::class, 'update']);
		Route::delete('/{id}', [RecipeController::class, 'destroy']);
	});

	Route::prefix('pantry')->group(function () {
		Route::post('/search', [PantryController::class, 'search']);
		Route::post('/', [PantryController::class, 'store']);
		Route::put('/{id}', [PantryController::class, 'update']);
		Route::delete('/{id}', [PantryController::class, 'destroy']);
	});

	Route::prefix('meal-plans')->group(function () {
		Route::post('/search', [MealPlanController::class, 'search']);
		Route::post('/', [MealPlanController::class, 'store']);
	});

	Route::post('/meal-plans', [MealPlanController::class, 'store']);
	Route::get('/meal-plans', [MealPlanController::class, 'index']);

	Route::post('/shopping-lists/from-meal-plan/{mealPlanId}', [ShoppingListController::class, 'fromMealPlan']);
});
