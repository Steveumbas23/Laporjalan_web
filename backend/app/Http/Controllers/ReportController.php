<?php

namespace App\Http\Controllers;

use App\Http\Requests\Report\StoreReportRequest;
use App\Http\Requests\Report\UpdateReportRequest;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Report::query()->latest();

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $reports = $query->get();

        if ($user->role === 'admin') {
            Log::info('Admin viewed reports', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'total_reports' => $reports->count(),
            ]);
        }

        return response()->json($reports);
    }

    public function store(StoreReportRequest $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validated();

        $photoPath = $request->file('photo')->store('reports/photos', 'public');

        $reportData = [
            'user_id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'photo' => $photoPath,
            'description' => $validated['description'],
            'status' => 'pending',
        ];

        if (Schema::hasColumn('reports', 'address')) {
            $reportData['address'] = $validated['address'];
        }

        $report = Report::create($reportData);

        Log::info('Report created', [
            'user_id' => $user->id,
            'email' => $user->email,
            'report_id' => $report->id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($report, 201);
    }

    public function update(UpdateReportRequest $request, Report $report): JsonResponse
    {
        $user = $request->user();

        $oldStatus = $report->status;
        $hadAdminPhoto = !empty($report->admin_photo);

        $validated = $request->validated();

        if (isset($validated['status'])) {
            $report->status = $validated['status'];
        }

        $uploadedAdminPhoto = false;

        if ($request->hasFile('photo')) {
            $adminPhotoPath = $request->file('photo')->store('reports/admin', 'public');
            $report->admin_photo = $adminPhotoPath;
            $uploadedAdminPhoto = true;
        }

        $report->save();

        Log::info('Admin updated report', [
            'admin_id' => $user->id,
            'admin_email' => $user->email,
            'report_id' => $report->id,
            'old_status' => $oldStatus,
            'new_status' => $report->status,
            'uploaded_admin_photo' => $uploadedAdminPhoto,
            'had_admin_photo_before' => $hadAdminPhoto,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($report);
    }

    public function destroy(Request $request, Report $report): JsonResponse
    {
        $user = $request->user();

        Log::info('Admin deleted report', [
            'admin_id' => $user->id,
            'admin_email' => $user->email,
            'report_id' => $report->id,
            'report_owner_id' => $report->user_id,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $report->delete();

        return response()->json(['message' => 'Laporan dihapus']);
    }
}
