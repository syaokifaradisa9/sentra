<?php

namespace App\Repositories\ProductBranch;

use App\Models\ProductBranch;
use Illuminate\Support\Collection;

interface ProductBranchRepository
{
    public function batchInsert(array $data): void;
    public function getByProductId(int $productId): Collection;
    public function deleteByProductId(int $productId): bool;
}