<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('employee') ?? $this->route('user'); // Handle both route parameter names
        $currentUser = $this->user();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => $this->isMethod('post') ? 'required|string|min:8|confirmed' : 'nullable|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'position' => 'required|string|max:255',
        ];

        if ($currentUser && $currentUser->hasRole('Businessman')) {
            $rules['business_id'] = 'required|integer|exists:businesses,id';
            $rules['branch_id'] = 'required|integer|exists:branches,id';
        } elseif ($currentUser && $currentUser->hasRole('BusinessOwner')) {
            $rules['branch_id'] = 'required|integer|exists:branches,id';
        } elseif ($currentUser && $currentUser->hasRole('SmallBusinessOwner')) {
            $rules['branch_id'] = 'nullable|integer|exists:branches,id';
        } else {
            $rules['branch_id'] = 'nullable|integer|exists:branches,id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'address.required' => 'Alamat wajib diisi.',
            'position.required' => 'Jabatan wajib diisi.',
            'business_id.required' => 'Bisnis wajib dipilih.',
            'business_id.exists' => 'Bisnis yang dipilih tidak valid.',
            'branch_id.required' => 'Cabang wajib dipilih.',
            'branch_id.integer' => 'Cabang tidak valid.',
            'branch_id.exists' => 'Cabang yang dipilih tidak tersedia.',
        ];
    }
}
