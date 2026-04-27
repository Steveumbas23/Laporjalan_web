<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * REGISTER
     */
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        // SIMPAN USER
        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // RESPONSE
        return response()->json([
            'message' => 'Register berhasil',
            'user' => $user
        ], 201);
    }

    /**
     * LOGIN
     */
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $identifier = trim((string) $validated['email']);
        $password = (string) $validated['password'];

        $credentials = filter_var($identifier, FILTER_VALIDATE_EMAIL)
            ? ['email' => $identifier, 'password' => $password]
            : ['full_name' => $identifier, 'password' => $password];

        if (!Auth::attempt($credentials)) {
            $this->importLegacySqliteUser($identifier, $password);
        }

        if (!Auth::attempt($credentials)) {
            Log::warning('Failed login attempt', [
                'identifier' => $identifier,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $request->session()->regenerate();

        Log::info('User login', [
            'user_id' => $request->user()?->id,
            'email' => $request->user()?->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // RESPONSE
        return response()->json([
            'message' => 'Login berhasil',
            'user' => $request->user()
        ]);
    }

    /**
     * LOGOUT
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        Log::info('User logout', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Import a matching user from the old SQLite database after a DB switch.
     */
    private function importLegacySqliteUser(string $identifier, string $password): void
    {
        if (config('database.default') === 'sqlite') {
            return;
        }

        $legacyDatabase = database_path('database.sqlite');

        if (!is_file($legacyDatabase)) {
            return;
        }

        try {
            config([
                'database.connections.legacy_sqlite' => [
                    'driver' => 'sqlite',
                    'database' => $legacyDatabase,
                    'prefix' => '',
                    'foreign_key_constraints' => true,
                ],
            ]);

            DB::purge('legacy_sqlite');

            $legacyQuery = DB::connection('legacy_sqlite')->table('users');
            $legacyUser = filter_var($identifier, FILTER_VALIDATE_EMAIL)
                ? $legacyQuery->where('email', $identifier)->first()
                : $legacyQuery->where('full_name', $identifier)->first();

            if (!$legacyUser || !Hash::check($password, $legacyUser->password)) {
                return;
            }

            User::updateOrCreate(
                ['email' => $legacyUser->email],
                [
                    'full_name' => $legacyUser->full_name,
                    'password' => $legacyUser->password,
                    'role' => $legacyUser->role ?? 'user',
                    'email_verified_at' => $legacyUser->email_verified_at,
                ]
            );

            Log::info('Imported legacy SQLite user into active database', [
                'identifier' => $identifier,
                'email' => $legacyUser->email,
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Legacy SQLite import skipped', [
                'identifier' => $identifier,
                'error' => $exception->getMessage(),
            ]);
        } finally {
            DB::purge('legacy_sqlite');
        }
    }
}
