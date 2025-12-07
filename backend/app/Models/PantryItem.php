<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PantryItem extends Model {
	use HasFactory;

	protected $fillable = [
		'household_id',
		'ingredient_id',
		'quantity',
		'unit',
		'expires_at',
		'notes',
	];

	protected $casts = [
		'expires_at' => 'date',
		'quantity'   => 'decimal:2',
	];

	public function household() {
		return $this->belongsTo(Household::class);
	}

	public function ingredient() {
		return $this->belongsTo(Ingredient::class);
	}
}
