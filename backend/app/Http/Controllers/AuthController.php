<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller {
	public function register(Request $request) {
		$data = $request->validate([
			'name'     => ['required', 'string', 'max:255'],
			'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
			'password' => ['required', 'string', 'min:6'],
		]);

		$user = User::create($data);

		$token = $user->createToken('api')->plainTextToken;

		return response()->json([
			'user'  => $user,
			'token' => $token,
		], 201);
	}

	public function login(Request $request) {
		$credentials = $request->validate([
			'email'    => ['required', 'email'],
			'password' => ['required', 'string'],
		]);

		if (! Auth::attempt($credentials)) {
			return response()->json([
				'message' => 'Credenciais inválidas.',
			], 401);
		}

		/** @var \App\Models\User $user */
		$user = Auth::user();

		$user->tokens()->delete();

		$token = $user->createToken('api')->plainTextToken;

		return response()->json([
			'user'  => $user,
			'token' => $token,
		]);
	}

	public function me(Request $request) {
		return response()->json($request->user());
	}

	public function logout(Request $request) {
		$request->user()->currentAccessToken()?->delete();

		return response()->json([
			'message' => 'Logout realizado com sucesso.',
		]);
	}
}
