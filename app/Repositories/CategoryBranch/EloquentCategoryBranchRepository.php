<?php

namespace App\Repositories\CategoryBranch;

use App\Models\CategoryBranch;
use Illuminate\Support\Collection;

class EloquentCategoryBranchRepository implements CategoryBranchRepository
{
    protected CategoryBranch $model;

    public function __construct(CategoryBranch $categoryBranch)
    {
        $this->model = $categoryBranch;
    }

    public function batchInsert(array $data): void
    {
        $this->model->insert($data);
    }

    public function deleteByCategoryId(int $categoryId): bool
    {
        $records = $this->model->where('category_id', $categoryId)->get();
        if ($records->count() > 0) {
            return $this->model->where('category_id', $categoryId)->delete();
        }
        return false;
    }

    public function getByCategoryId(int $categoryId): Collection
    {
        return $this->model->where('category_id', $categoryId)->get();
    }
}