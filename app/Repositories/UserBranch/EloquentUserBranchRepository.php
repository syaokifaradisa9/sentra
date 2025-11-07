<?php

namespace App\Repositories\UserBranch;

use App\Models\UserBranch;
use Illuminate\Support\Collection;

class EloquentUserBranchRepository implements UserBranchRepository
{
    protected UserBranch $model;

    public function __construct(UserBranch $userBranch)
    {
        $this->model = $userBranch;
    }

    public function getByUserId(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->get();
    }

    public function deleteByUserId(int $userId): bool
    {
        return $this->model->where('user_id', $userId)->delete() > 0;
    }

    public function deleteByBranchId(int $branchId): bool
    {
        return $this->model->where('branch_id', $branchId)->delete() > 0;
    }

    public function batchInsert(array $data): void
    {
        $this->model->insert($data);
    }
}