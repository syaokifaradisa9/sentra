<?php

namespace App\Repositories\Product;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class EloquentProductRepository implements ProductRepository
{
    protected Product $model;

    public function __construct(Product $product)
    {
        $this->model = $product;
    }

    public function getById(int $id): ?Product
    {
        return $this->model->find($id);
    }

    public function store(array $data): Product
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): ?Product
    {
        $product = $this->model->find($id);
        
        if ($product) {
            $product->update($data);
            return $product->fresh();
        }
        
        return null;
    }

    public function delete(int $id): bool
    {
        $product = $this->model->find($id);
        
        if ($product) {
            return $product->delete();
        }
        
        return false;
    }

    public function all(): Collection
    {
        return $this->model->all();
    }

    public function getByBranchId(int $branchId): Collection
    {
        return $this->model->whereHas('category.branches', function ($query) use ($branchId) {
            $query->where('branches.id', $branchId);
        })->get();
    }

    public function getByBusinessId(int $businessId): Collection
    {
        return $this->model->whereHas('category.branches', function ($query) use ($businessId) {
            $query->where('branches.business_id', $businessId);
        })->get();
    }

    public function getByCategoryId(int $categoryId): Collection
    {
        return $this->model->where('category_id', $categoryId)->get();
    }
}