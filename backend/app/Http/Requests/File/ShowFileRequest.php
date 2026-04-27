<?php

namespace App\Http\Requests\File;

use App\Http\Requests\StrictFormRequest;

class ShowFileRequest extends StrictFormRequest
{
    protected function allowedInputKeys(): array
    {
        return ['path'];
    }

    protected function validationData(): array
    {
        return [
            ...$this->all(),
            'path' => $this->route('path'),
        ];
    }

    public function rules(): array
    {
        return [
            'path' => [
                'required',
                'string',
                'regex:/^(?:storage\/)?[A-Za-z0-9._\/-]+$/',
                'not_regex:/\.\./',
                'not_regex:/\\\\/',
            ],
        ];
    }
}
