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

        $scopeRules = ['nullable'];

        if ($scopeType === 'product') {
            // no additional required scope target
        } elseif ($scopeType === 'business') {
            $scopeRules[] = 'required';
            $scopeRules[] = 'integer';
            $scopeRules[] = 'exists:businesses,id';
        } elseif ($scopeType === 'branch') {
            $scopeRules[] = 'required';
            $scopeRules[] = 'integer';
            $scopeRules[] = 'exists:branches,id';
        }

        return [
            'product_id' => 'required|exists:products,id',
            'scope_type' => ['required', Rule::in(['product', 'business', 'branch'])],
            'scope_id' => $scopeRules,
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
            'product_id.required' => 'Produk wajib dipilih.',
            'product_id.exists' => 'Produk tidak valid.',
            'scope_type.required' => 'Jenis cakupan promo wajib dipilih.',
            'scope_type.in' => 'Jenis cakupan promo tidak valid.',
            'scope_id.required' => 'Pilih target sesuai cakupan promo.',
            'scope_id.exists' => 'Data target promo tidak valid.',
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
