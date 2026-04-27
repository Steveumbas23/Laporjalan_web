<?php

namespace App\Http\Requests\Report;

use App\Http\Requests\StrictFormRequest;

class UpdateReportRequest extends StrictFormRequest
{
    protected function allowedInputKeys(): array
    {
        return ['status', 'photo'];
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'in:pending,process,done'],
            'photo' => ['nullable', 'image', 'max:4096'],
        ];
    }
}
