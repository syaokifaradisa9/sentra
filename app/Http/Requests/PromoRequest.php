<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PromoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'percent_discount' => 'nullable|numeric|min:0|max:100|required_without:price_discount',
            'price_discount' => 'nullable|numeric|min:0|required_without:percent_discount',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Produk wajib dipilih.',
            'product_id.exists' => 'Produk tidak valid.',
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
        ];
    }
}
