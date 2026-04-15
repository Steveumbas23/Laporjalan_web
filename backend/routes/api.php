<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\ReportController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/files/{path}', [FileController::class, 'show'])
            ->where('path', '.*')
            ->name('files.show');

        Route::get('/me', function (Request $request) {
            return response()->json(['user' => $request->user()]);
        })->name('auth.me');

        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
        Route::patch('/reports/{report}', [ReportController::class, 'update'])->name('reports.update');
        Route::delete('/reports/{report}', [ReportController::class, 'destroy'])->name('reports.destroy');

        Route::get('/users/count', function (Request $request) {
            $user = $request->user();

            if ($user?->role !== 'admin') {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $total = User::query()
                ->where('role', 'user')
                ->count();

            Log::info('Admin viewed user count', [
                'admin_id' => $user->id,
                'admin_email' => $user->email,
                'total_users' => $total,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'total' => $total,
            ]);
        })->name('users.count');
    });
});
