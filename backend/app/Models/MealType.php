<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealType extends Model {
	protected $fillable = [
		'household_id',
		'name',
		'order',
	];

	protected $casts = [
		'order' => 'integer',
	];

	public function household(): BelongsTo {
		return $this->belongsTo(Household::class);
	}
}
