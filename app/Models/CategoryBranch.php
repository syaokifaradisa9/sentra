<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryBranch extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'branch_id',
    ];

    /**
     * Get the category that belongs to this category-branch relationship.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the branch that belongs to this category-branch relationship.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
