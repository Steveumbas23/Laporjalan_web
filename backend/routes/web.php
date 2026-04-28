<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/storage/{path}', function (string $path) {
    $cleanPath = ltrim($path, '/');

    if ($cleanPath === '' || str_contains($cleanPath, '..')) {
        abort(404);
    }

    if (!Storage::disk('public')->exists($cleanPath)) {
        abort(404);
    }

    return Storage::disk('public')->response($cleanPath);
})->where('path', '.*');

Route::get('/{any?}', function () {
    $spaIndex = public_path('index.html');

    if (file_exists($spaIndex)) {
        return response()->file($spaIndex);
    }

    return view('welcome');
})->where('any', '^(?!api|sanctum|storage).*$');
