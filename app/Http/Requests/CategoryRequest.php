<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $commonRules = [
            'branch_ids' => 'nullable|array',
            'branch_ids.*' => 'integer|exists:branches,id',
            'icon' => 'nullable|string|max:100',
        ];

        if ($this->isMethod('post')) {
            return array_merge($commonRules, [
                'name' => 'required|string|max:255',
            ]);
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            return array_merge($commonRules, [
                'name' => 'required|string|max:255',
            ]);
        }

        return $commonRules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.string' => 'Nama kategori harus berupa teks.',
            'name.max' => 'Nama kategori maksimal 255 karakter.',
            'branch_ids.array' => 'Pilihan cabang tidak valid.',
            'branch_ids.*.integer' => 'Pilihan cabang tidak valid.',
            'branch_ids.*.exists' => 'Pilihan cabang tidak tersedia.',
            'icon.string' => 'Ikon kategori harus berupa teks yang valid.',
            'icon.max' => 'Nama ikon maksimal 100 karakter.',
        ];
    }
}
