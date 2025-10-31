<?php

namespace App\Repositories\CategoryBranch;

use App\Models\CategoryBranch;
use Illuminate\Support\Collection;

interface CategoryBranchRepository
{
    public function batchInsert(array $data): void;
    public function deleteByCategoryId(int $categoryId): bool;
    public function getByCategoryId(int $categoryId): Collection;
}