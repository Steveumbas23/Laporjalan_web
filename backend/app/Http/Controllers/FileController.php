<?php

namespace App\Http\Controllers;

use App\Http\Requests\File\ShowFileRequest;
use App\Models\Report;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    public function show(ShowFileRequest $request, string $path): Response|StreamedResponse
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
            $databaseResponse = $this->responseFromDatabase($storagePath);

            if ($databaseResponse) {
                return $databaseResponse;
            }

            return Storage::disk('public')->response('reports/placeholder.svg');
        }

        if (!Storage::disk('public')->exists($resolvedPath)) {
            $databaseResponse = $this->responseFromDatabase($storagePath);

            if ($databaseResponse) {
                return $databaseResponse;
            }

            return Storage::disk('public')->response('reports/placeholder.svg');
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

    private function responseFromDatabase(string $storagePath): ?Response
    {
        $basename = basename($storagePath);

        $report = Report::query()
            ->where('photo', $storagePath)
            ->orWhere('admin_photo', $storagePath)
            ->orWhere('photo', 'storage/'.$storagePath)
            ->orWhere('admin_photo', 'storage/'.$storagePath)
            ->orWhere('photo', '/storage/'.$storagePath)
            ->orWhere('admin_photo', '/storage/'.$storagePath)
            ->orWhere('photo', 'like', '%/'.$basename)
            ->orWhere('admin_photo', 'like', '%/'.$basename)
            ->first();

        if (!$report) {
            return null;
        }

        $isAdminPhoto = str_contains($storagePath, 'reports/admin/');
        $data = $isAdminPhoto ? $report->admin_photo_data : $report->photo_data;
        $mime = $isAdminPhoto ? $report->admin_photo_mime : $report->photo_mime;

        if (!$data) {
            return null;
        }

        $binary = base64_decode($data, true);

        if ($binary === false) {
            return null;
        }

        return response($binary, 200, [
            'Content-Type' => $mime ?: 'application/octet-stream',
            'Content-Length' => (string) strlen($binary),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
