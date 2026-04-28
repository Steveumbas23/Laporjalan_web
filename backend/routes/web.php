<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/storage/{path}', function (string $path) {
    $cleanPath = ltrim($path, '/');

    if ($cleanPath === '' || str_contains($cleanPath, '..')) {
        abort(404);
    }

    $disk = Storage::disk('public');
    $resolvedPath = $disk->exists($cleanPath) ? $cleanPath : null;

    if ($resolvedPath === null) {
        $basename = basename($cleanPath);
        foreach ($disk->allFiles() as $file) {
            if (basename($file) === $basename) {
                $resolvedPath = $file;
                break;
            }
        }
    }

    if ($resolvedPath === null || !Storage::disk('public')->exists($resolvedPath)) {
        abort(404);
    }

    return Storage::disk('public')->response($resolvedPath);
})->where('path', '.*');

Route::get('/{any?}', function () {
    $spaIndex = public_path('index.html');

    if (file_exists($spaIndex)) {
        return response()->file($spaIndex);
    }

    return view('welcome');
})->where('any', '^(?!api|sanctum|storage).*$');
