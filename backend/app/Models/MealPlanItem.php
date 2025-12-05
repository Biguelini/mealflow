<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPlanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'meal_plan_id',
        'date',
        'meal_type',
        'meal_type_id',
        'recipe_id',
        'servings',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function mealPlan()
    {
        return $this->belongsTo(MealPlan::class);
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function mealType()
    {
        return $this->belongsTo(MealType::class);
    }
}
