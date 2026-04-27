<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\StrictFormRequest;

class LoginRequest extends StrictFormRequest
{
    protected function allowedInputKeys(): array
    {
        return ['email', 'password'];
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ];
    }
}
