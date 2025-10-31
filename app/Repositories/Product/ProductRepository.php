<?php

namespace App\Repositories\Product;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepository
{
    public function getById(int $id): ?Product;
    public function store(array $data): Product;
    public function update(int $id, array $data): ?Product;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function getByBranchId(int $branchId): Collection;
    public function getByBusinessId(int $businessId): Collection;
    public function getByCategoryId(int $categoryId): Collection;
}