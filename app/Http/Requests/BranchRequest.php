<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $method = $this->method();

        switch($method) {
            case 'POST':
                return [
                    'name' => 'required|string|max:255',
                    'address' => 'required|string|max:500',
                    'opening_time' => 'required|date_format:H:i',
                    'closing_time' => 'required|date_format:H:i|after:opening_time',
                    'business_id' => 'required|exists:businesses,id',
                ];
            case 'PUT':
                return [
                    'name' => 'sometimes|string|max:255',
                    'address' => 'sometimes|string|max:500',
                    'opening_time' => 'sometimes|date_format:H:i',
                    'closing_time' => 'sometimes|date_format:H:i|after:opening_time',
                    'business_id' => 'sometimes|exists:businesses,id',
                ];
            default:
                return [];
        }
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama cabang wajib diisi.',
            'address.required' => 'Alamat cabang wajib diisi.',
            'opening_time.required' => 'Waktu buka wajib diisi.',
            'closing_time.required' => 'Waktu tutup wajib diisi.',
            'closing_time.after' => 'Waktu tutup harus setelah waktu buka.',
            'business_id.required' => 'ID bisnis wajib diisi.',
            'business_id.exists' => 'Bisnis yang dipilih tidak ditemukan.',
        ];
    }
}
