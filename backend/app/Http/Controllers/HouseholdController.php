<?php

namespace App\Http\Controllers;

use App\Models\Household;
use App\Models\User;
use Illuminate\Http\Request;

class HouseholdController extends Controller {
	public function index(Request $request) {
		$user = $request->user();

		$households = $user->households()
			->with('owner:id,name,email')
			->get();

		return response()->json($households);
	}

	public function store(Request $request) {
		$user = $request->user();

		$data = $request->validate([
			'name' => ['required', 'string', 'max:255'],
		]);

		$household = Household::create([
			'name'     => $data['name'],
			'owner_id' => $user->id,
		]);

		$household->users()->attach($user->id, ['role' => 'owner']);

		return response()->json($household->load('owner:id,name,email'), 201);
	}

	public function addMember(Request $request, $id) {
		$user = $request->user();

		$data = $request->validate([
			'email' => ['required_without:user_id', 'nullable', 'email', 'exists:users,email'],
			'user_id' => ['required_without:email', 'nullable', 'integer', 'exists:users,id'],
			'role' => ['nullable', 'string', 'max:50'],
		]);

		$household = $user->households()->where('households.id', $id)->firstOrFail();

		if (!empty($data['user_id'])) {
			$member = User::findOrFail($data['user_id']);
		} else {
			$member = User::where('email', $data['email'])->firstOrFail();
		}

		$role = $data['role'] ?? 'member';

		$household->users()->syncWithoutDetaching([
			$member->id => ['role' => $role],
		]);

		return response()->json([
			'message'   => 'Membro adicionado com sucesso.',
			'household' => $household->load('users:id,name,email'),
		]);
	}
}
