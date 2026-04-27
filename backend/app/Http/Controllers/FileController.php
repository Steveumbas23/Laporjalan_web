<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    public function show(Request $request, string $path): StreamedResponse
    {
        $cleanPath = ltrim($path, '/');

        if ($cleanPath === '' || str_contains($cleanPath, '..')) {
            abort(404);
        }

        $storagePath = str_starts_with($cleanPath, 'storage/')
            ? substr($cleanPath, strlen('storage/'))
            : $cleanPath;

        if ($storagePath === '') {
            abort(404);
        }

        $report = Report::query()
            ->where('photo', $storagePath)
            ->orWhere('admin_photo', $storagePath)
            ->first();

        if (!$report) {
            abort(404);
        }

        $this->authorize('view', $report);

        if (!Storage::disk('public')->exists($storagePath)) {
            abort(404);
        }

        return Storage::disk('public')->response($storagePath);
    }
}
