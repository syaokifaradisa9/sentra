<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $method = $this->method();
        
        switch($method) {
            case 'POST': // store
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
    
    /**
     * Get custom messages for validation errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama bisnis wajib diisi.',
            'description.required' => 'Deskripsi bisnis wajib diisi.',
        ];
    }
}