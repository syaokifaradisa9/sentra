<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BusinessRequest extends FormRequest
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
                    'description' => 'required|string|max:500',
                ];
            case 'PUT':
                return [
                    'name' => 'sometimes|string|max:255',
                    'description' => 'sometimes|string|max:500',
                ];
            default:
                return [];
        }
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama bisnis wajib diisi.',
            'description.required' => 'Deskripsi bisnis wajib diisi.',
        ];
    }
}
