<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPlan extends Model {
	use HasFactory;

	protected $fillable = [
		'household_id',
		'user_id',
		'week_start_date',
		'week_label',
		'name',
		'notes',
	];

	protected $casts = [
		'week_start_date' => 'date',
	];

	public function household() {
		return $this->belongsTo(Household::class);
	}

	public function owner() {
		return $this->belongsTo(User::class, 'user_id');
	}

	public function items() {
		return $this->hasMany(MealPlanItem::class);
	}

	public function shoppingLists() {
		return $this->hasMany(ShoppingList::class);
	}
}
