<?php

namespace App\Http\Requests\Report;

use App\Http\Requests\StrictFormRequest;

class StoreReportRequest extends StrictFormRequest
{
    protected function allowedInputKeys(): array
    {
        return ['address', 'latitude', 'longitude', 'description', 'photo'];
    }

    public function rules(): array
    {
        return [
            'address' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'description' => ['required', 'string', 'max:5000'],
            'photo' => ['required', 'image', 'max:4096'],
        ];
    }
}
