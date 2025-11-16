<?php

namespace App\Repositories\BranchEmployee;

use App\Models\BranchEmployee;
use Illuminate\Support\Collection;

interface BranchEmployeeRepository
{
    public function getByUserId(int $userId): Collection;
    public function deleteByUserId(int $userId): bool;
    public function deleteByBranchId(int $branchId): bool;
    public function assignBranch(int $userId, int $branchId): void;
}
