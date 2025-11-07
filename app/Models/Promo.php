<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'owner_id',
        'scope_type',
        'scope_id',
        'start_date',
        'end_date',
        'percent_discount',
        'price_discount',
        'usage_limit',
        'used_count',
        'impacted_products',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'percent_discount' => 'decimal:2',
        'price_discount' => 'decimal:2',
        'owner_id' => 'integer',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'impacted_products' => 'integer',
    ];

    protected $appends = [
        'scope_label',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'scope_id');
    }

    public function scopedBusiness()
    {
        return $this->belongsTo(Business::class, 'scope_id');
    }

    public function scopedBranch()
    {
        return $this->belongsTo(Branch::class, 'scope_id');
    }

    public function priceHistories()
    {
        return $this->hasMany(PromoPriceHistory::class);
    }

    public function getScopeLabelAttribute(): string
    {
        return match ($this->scope_type) {
            'product' => $this->scope_id
                ? ($this->product?->name ?? 'Produk')
                : 'Semua Produk',
            'business' => $this->scopedBusiness?->name ?? 'Bisnis',
            'branch' => $this->scopedBranch?->name ?? 'Cabang',
            default => 'Promo',
        };
    }
}
