<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoPriceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'promo_id',
        'product_id',
        'base_price',
        'promo_price',
        'recorded_at',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
