<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'start_date',
        'end_date',
        'percent_discount',
        'price_discount',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'percent_discount' => 'decimal:2',
        'price_discount' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
