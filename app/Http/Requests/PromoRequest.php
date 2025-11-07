<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $scopeType = $this->input('scope_type');

        return [
            'scope_type' => ['required', Rule::in(['product', 'business', 'branch'])],
            'scope_id' => [
                'nullable',
                'integer',
                Rule::requiredIf(in_array($scopeType, ['business', 'branch'], true)),
                Rule::when($scopeType === 'business', ['exists:businesses,id']),
                Rule::when($scopeType === 'branch', ['exists:branches,id']),
            ],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'percent_discount' => 'nullable|numeric|min:0|max:100|required_without:price_discount',
            'price_discount' => 'nullable|numeric|min:0|required_without:percent_discount',
            'usage_limit' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'scope_type.required' => 'Jenis cakupan promo wajib dipilih.',
            'scope_type.in' => 'Jenis cakupan promo tidak valid.',
            'scope_id.required' => 'Pilih data untuk cakupan promo ini.',
            'scope_id.exists' => 'Data cakupan promo tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
            'percent_discount.numeric' => 'Diskon persen harus angka.',
            'percent_discount.min' => 'Diskon persen minimal 0.',
            'percent_discount.max' => 'Diskon persen maksimal 100.',
            'percent_discount.required_without' => 'Isi diskon persen atau diskon harga.',
            'price_discount.numeric' => 'Diskon harga harus angka.',
            'price_discount.min' => 'Diskon harga minimal 0.',
            'price_discount.required_without' => 'Isi diskon harga atau diskon persen.',
            'usage_limit.integer' => 'Kuota promo harus berupa angka.',
            'usage_limit.min' => 'Kuota promo minimal 1.',
        ];
    }
}
