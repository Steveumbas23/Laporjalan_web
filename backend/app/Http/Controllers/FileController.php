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

        $pathCandidates = array_values(array_unique(array_filter([
            $storagePath,
            basename($storagePath),
        ])));

        $report = Report::query()
            ->where(function ($query) use ($storagePath, $pathCandidates) {
                $query->where('photo', $storagePath)
                    ->orWhere('admin_photo', $storagePath);

                foreach ($pathCandidates as $candidate) {
                    $query->orWhere('photo', 'like', '%/'.$candidate)
                        ->orWhere('admin_photo', 'like', '%/'.$candidate);
                }
            })
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
