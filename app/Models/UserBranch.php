<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserBranch extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'branch_id',
    ];

    /**
     * Get the user that belongs to this user-branch relationship.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the branch that belongs to this user-branch relationship.
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
