<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
	use HasApiTokens, HasFactory, Notifiable;

	protected $fillable = [
		'name',
		'email',
		'password',
	];

	protected $hidden = [
		'password',
		'remember_token',
	];

	protected function casts(): array {
		return [
			'email_verified_at' => 'datetime',
			'password' => 'hashed',
		];
	}

	public function households() {
		return $this->belongsToMany(Household::class)
			->withPivot('role')
			->withTimestamps();
	}

	public function householdsOwned() {
		return $this->hasMany(Household::class, 'owner_id');
	}

	public function recipes() {
		return $this->hasMany(Recipe::class);
	}
}
