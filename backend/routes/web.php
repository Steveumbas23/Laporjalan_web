<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

if (!function_exists('lj_public_storage_response')) {
    function lj_public_storage_response(string $path)
    {
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

        if ($resolvedPath === null || !$disk->exists($resolvedPath)) {
            abort(404);
        }

        return $disk->response($resolvedPath);
    }
}

Route::get('/storage/{path}', function (string $path) {
    return lj_public_storage_response($path);
})->where('path', '.*');

Route::get('/backend/public/storage/{path}', function (string $path) {
    return lj_public_storage_response($path);
})->where('path', '.*');

Route::get('/{any?}', function () {
    $spaIndex = public_path('index.html');

    if (file_exists($spaIndex)) {
        return response()->file($spaIndex);
    }

    return view('welcome');
})->where('any', '^(?!api|sanctum|storage).*$');
