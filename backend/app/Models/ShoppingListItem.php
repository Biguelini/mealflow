<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingListItem extends Model {
	use HasFactory;

	protected $fillable = [
		'shopping_list_id',
		'ingredient_id',
		'needed_quantity',
		'pantry_quantity',
		'to_buy_quantity',
		'unit',
		'notes',
	];

	protected $casts = [
		'needed_quantity' => 'decimal:2',
		'pantry_quantity' => 'decimal:2',
		'to_buy_quantity' => 'decimal:2',
	];

	public function shoppingList() {
		return $this->belongsTo(ShoppingList::class);
	}

	public function ingredient() {
		return $this->belongsTo(Ingredient::class);
	}
}
