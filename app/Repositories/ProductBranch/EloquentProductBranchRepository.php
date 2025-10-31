<?php

namespace App\Repositories\ProductBranch;

use App\Models\ProductBranch;
use Illuminate\Support\Collection;

class EloquentProductBranchRepository implements ProductBranchRepository
{
    protected ProductBranch $model;

    public function __construct(ProductBranch $productBranch)
    {
        $this->model = $productBranch;
    }

    public function batchInsert(array $data): void
    {
        $this->model->insert($data);
    }

    public function getByProductId(int $productId): Collection
    {
        return $this->model->where('product_id', $productId)->get();
    }

    public function deleteByProductId(int $productId): bool
    {
        $records = $this->model->where('product_id', $productId)->get();
        if ($records->count() > 0) {
            return $this->model->where('product_id', $productId)->delete();
        }
        return false;
    }
}