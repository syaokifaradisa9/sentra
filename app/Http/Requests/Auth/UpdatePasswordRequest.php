<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
            'new_password_confirmation' => 'required|string|same:new_password',
        ];
    }

    public function messages()
    {
        return [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.string' => 'Format password saat ini tidak valid.',
            'new_password.required' => 'Password baru wajib diisi.',
            'new_password.string' => 'Format password baru tidak valid.',
            'new_password.min' => 'Password baru minimal harus 8 karakter.',
            'new_password_confirmation.required' => 'Konfirmasi password baru wajib diisi.',
            'new_password_confirmation.string' => 'Format konfirmasi password tidak valid.',
            'new_password_confirmation.same' => 'Konfirmasi password baru tidak cocok.',
        ];
    }
}
