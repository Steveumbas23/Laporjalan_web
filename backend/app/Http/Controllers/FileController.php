<?php

namespace App\Http\Controllers;

use App\Http\Requests\File\ShowFileRequest;
use App\Models\Report;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    public function show(ShowFileRequest $request, string $path): StreamedResponse
    {
        $cleanPath = ltrim($request->validated()['path'] ?? $path, '/');

        if ($cleanPath === '' || str_contains($cleanPath, '..')) {
            abort(404);
        }

        $storagePath = str_starts_with($cleanPath, 'storage/')
            ? substr($cleanPath, strlen('storage/'))
            : $cleanPath;

        if ($storagePath === '') {
            abort(404);
        }

        $resolvedPath = $this->resolveStoragePath($storagePath);

        if ($resolvedPath === null) {
            abort(404);
        }

        $report = Report::query()
            ->where(function ($query) use ($resolvedPath, $storagePath) {
                $query->where('photo', $resolvedPath)
                    ->orWhere('admin_photo', $resolvedPath)
                    ->orWhere('photo', $storagePath)
                    ->orWhere('admin_photo', $storagePath)
                    ->orWhere('photo', 'like', '%/'.basename($resolvedPath))
                    ->orWhere('admin_photo', 'like', '%/'.basename($resolvedPath));
            })
            ->first();

        if (!$report) {
            abort(404);
        }

        $this->authorize('view', $report);

        if (!Storage::disk('public')->exists($resolvedPath)) {
            abort(404);
        }

        return Storage::disk('public')->response($resolvedPath);
    }

    private function resolveStoragePath(string $storagePath): ?string
    {
        $disk = Storage::disk('public');

        if ($disk->exists($storagePath)) {
            return $storagePath;
        }

        $basename = basename($storagePath);
        foreach ($disk->allFiles() as $file) {
            if (basename($file) === $basename) {
                return $file;
            }
        }

        return null;
    }
}
