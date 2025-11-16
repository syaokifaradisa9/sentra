<?php

namespace App\Repositories\UserBranch;

use App\Models\UserBranch;
use Illuminate\Support\Collection;

interface UserBranchRepository
{
    public function getByUserId(int $userId): Collection;
    public function deleteByUserId(int $userId): bool;
    public function deleteByBranchId(int $branchId): bool;
    public function assignBranch(int $userId, int $branchId): void;
}
