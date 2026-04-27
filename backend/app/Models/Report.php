<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'address',
        'latitude',
        'longitude',
        'photo',
        'admin_photo',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function getPhotoAttribute(?string $value): ?string
    {
        return $this->normalizeStoragePath($value);
    }

    public function getAdminPhotoAttribute(?string $value): ?string
    {
        return $this->normalizeStoragePath($value);
    }

    private function normalizeStoragePath(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $path = parse_url($value, PHP_URL_PATH) ?: '';

            if (str_contains($path, '/storage/')) {
                return '/'.ltrim($path, '/');
            }

            return $value;
        }

        if (str_starts_with($value, '/storage/')) {
            return $value;
        }

        if (str_starts_with($value, 'storage/')) {
            return '/'.$value;
        }

        return '/storage/'.ltrim($value, '/');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
