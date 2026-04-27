<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

abstract class StrictFormRequest extends FormRequest
{
    /**
     * @return array<int, string>
     */
    abstract protected function allowedInputKeys(): array;

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $unexpectedKeys = array_values(array_diff(
                    array_keys($this->all()),
                    $this->allowedInputKeys(),
                ));

                foreach ($unexpectedKeys as $key) {
                    $validator->errors()->add($key, 'Field tidak diizinkan.');
                }
            },
        ];
    }
}
