<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\StrictFormRequest;

class RegisterRequest extends StrictFormRequest
{
    protected function allowedInputKeys(): array
    {
        return ['full_name', 'email', 'password', 'password_confirmation'];
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }
}
