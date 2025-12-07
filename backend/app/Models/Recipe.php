<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model {
	use HasFactory;

	protected $fillable = [
		'household_id',
		'user_id',
		'name',
		'description',
		'instructions',
		'prep_time_minutes',
		'cook_time_minutes',
		'servings',
		'is_public',
	];

	protected $casts = [
		'is_public' => 'boolean',
	];

	public function household() {
		return $this->belongsTo(Household::class);
	}

	public function owner() {
		return $this->belongsTo(User::class, 'user_id');
	}

	public function ingredients() {
		return $this->belongsToMany(Ingredient::class)
			->withPivot(['quantity', 'unit', 'notes'])
			->withTimestamps();
	}
}
