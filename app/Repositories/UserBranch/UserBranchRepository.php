<?php

namespace App\Repositories\UserBranch;

use App\Models\UserBranch;
use Illuminate\Support\Collection;

interface UserBranchRepository
{
    public function getByUserId(int $userId): Collection;
    public function deleteByUserId(int $userId): bool;
    public function batchInsert(array $data): void;
}