<?php

namespace App\Repositories\BranchEmployee;

use App\Models\BranchEmployee;
use Illuminate\Support\Collection;

class EloquentBranchEmployeeRepository implements BranchEmployeeRepository
{
    protected BranchEmployee $model;

    public function __construct(BranchEmployee $branchEmployee)
    {
        $this->model = $branchEmployee;
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

    public function assignBranch(int $userId, int $branchId): void
    {
        $this->model->updateOrCreate(
            ['user_id' => $userId],
            ['branch_id' => $branchId]
        );
    }
}
