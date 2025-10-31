<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductBranch extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'branch_id',
    ];

    /**
     * Get the product that belongs to this product-branch relationship.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the branch that belongs to this product-branch relationship.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
